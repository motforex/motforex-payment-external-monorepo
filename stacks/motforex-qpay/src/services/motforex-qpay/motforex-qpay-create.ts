import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata, PaymentInvoice, PaymentRequest } from '@motforex/global-types';

import { PaymentInvoiceSchema, STATUS_PENDING } from '@motforex/global-types';
import {
  CustomError,
  formatApiResponse,
  getParameterStoreVal,
  handleApiFuncError,
  logger
} from '@motforex/global-libs';

import { getValidDepositRequest } from '../utility';
import { createPaymentInvoice, getPaymentInvoiceById } from '@/repository/invoice-record';
import {
  createSimpleQpayInvoice,
  formatInvoiceAsResponse,
  QpayCreateInvoiceRequestSchema
} from '@motforex/global-services';
import { MOTFOREX_QPAY_INVOICE_CODE, QPAY_TOKEN_PARAMETER } from './motforex-qpay-constants';
import { getCurrentDateAsString } from '../utility';
import { markPaymentInvoiceAsExpired } from '../payment-invoice/payment-invoice-expired';
import { checkAuthorization } from '@motforex/global-libs';

export const REGENERATION_COUNT = 5;
export const EXPIRY_TIME = 300000;

/**
 * Create Motforex Qpay invoice for the deposit request.
 *
 * @param metadata
 * @param id
 * @returns
 */
export async function createMotforexQpayInvoice(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    const {} = checkAuthorization(metadata, 'createMotforexQpayInvoice');
    const [depositRequest, invoice] = await Promise.all([
      getValidDepositRequest(id, [STATUS_PENDING]),
      getPaymentInvoiceById(id)
    ]);

    if (!depositRequest.paymentMethodTitle.toLowerCase().includes('qpay')) {
      logger.error(`Invalid payment method for Qpay invoice creation!`);
      throw new CustomError('Invalid payment method for Qpay invoice creation!', 400);
    }

    // InvoiceRecord: If the invoice request already exists
    if (!invoice) {
      logger.info(`Invoice does not exist for deposit request: ${id}`);
      return await createNewQpayInvoice(depositRequest);
    }

    // InvoiceRecord: If the invoice request already exists
    logger.info(`Invoice already exists for deposit request: ${id}`);
    if (invoice.invoiceStatus !== 'PENDING') {
      logger.info(`Invoice is already successful for deposit request: ${id}`);
      return formatInvoiceAsResponse(invoice);
    }

    const currentDate = Date.now();
    if (invoice.expiryDate < currentDate) {
      logger.info(`Invoice has not expired for deposit request: ${id}`);
      return formatInvoiceAsResponse(invoice);
    }

    logger.info(`Invoice has expired for deposit request: ${id}`);
    if (invoice.regenerationCount <= 0) {
      logger.info(`Invoice regeneration count is zero for deposit request: ${id}`);
      const updateInvoice = await markPaymentInvoiceAsExpired(invoice);
      return formatInvoiceAsResponse(updateInvoice);
    }

    return await regenerateQpayInvoice(invoice);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

/**
 * Regenerate Qpay invoice for the deposit request.
 *
 * @param invoice
 * @returns
 */
async function regenerateQpayInvoice(invoice: PaymentInvoice): Promise<APIResponse> {
  const { id, transactionAmount } = invoice;

  const invoiceNumber = `${id}${getCurrentDateAsString()}`;

  const createQpayInvoiceRequest = QpayCreateInvoiceRequestSchema.parse({
    invoice_code: MOTFOREX_QPAY_INVOICE_CODE,
    sender_invoice_no: invoiceNumber,
    invoice_receiver_code: invoiceNumber,
    invoice_description: `MOTFOREX DEPOSIT ${id}`,
    sender_branch_code: 'MAIN',
    amount: transactionAmount,
    callback_url: `https://api.motforex.com/payments/v1/qpay/callback/${id}` // Callback URL for the invoice
  });

  const qpayAuthToken = await getParameterStoreVal(QPAY_TOKEN_PARAMETER);
  if (!qpayAuthToken) {
    logger.error('QPAY token is not found in the parameter store!');
    throw new CustomError('QPAY token is not found in the parameter store!', 500);
  }

  // Check if the older invoice is not paid

  // Create new Qpay invoice

  const qpayInvoice = await createSimpleQpayInvoice(qpayAuthToken, createQpayInvoiceRequest);
  logger.info(`Qpay invoice created successfully: ${JSON.stringify(qpayInvoice)}`);

  return formatInvoiceAsResponse(invoice);
}

/**
 * Create new Qpay invoice for the deposit request.
 *
 * @param depositRequest
 * @returns
 */
async function createNewQpayInvoice(depositRequest: PaymentRequest): Promise<APIResponse> {
  const { id, conversionRate, amountInUsd, amountWithCommission, transactionCurrency, userId } = depositRequest;
  logger.info(`Creating new Qpay invoice for deposit request: ${id}`);

  const amountInMnt = amountWithCommission.amount * conversionRate;
  logger.info(`Initial amount: ${amountWithCommission.amount}, Conversion rate: ${conversionRate}`);
  logger.info(`The converted AmountInMNT: ${amountInMnt}`);

  const invoiceNumber = `${id}${getCurrentDateAsString()}`;

  const createQpayInvoiceRequest = QpayCreateInvoiceRequestSchema.parse({
    invoice_code: MOTFOREX_QPAY_INVOICE_CODE,
    sender_invoice_no: invoiceNumber,
    invoice_receiver_code: invoiceNumber,
    invoice_description: `MOTFOREX DEPOSIT ${id}`,
    sender_branch_code: 'MAIN',
    amount: amountInMnt,
    callback_url: `https://api.motforex.com/payments/v1/qpay/callback/${id}` // Callback URL for the invoice
  });

  const qpayAuthToken = await getParameterStoreVal(QPAY_TOKEN_PARAMETER);
  if (!qpayAuthToken) {
    logger.error('QPAY token is not found in the parameter store!');
    throw new CustomError('QPAY token is not found in the parameter store!', 500);
  }

  const qpayInvoice = await createSimpleQpayInvoice(qpayAuthToken, createQpayInvoiceRequest);
  logger.info(`Qpay invoice created successfully: ${JSON.stringify(qpayInvoice)}`);

  const invoice = await createPaymentInvoice(
    PaymentInvoiceSchema.parse({
      // General config props
      id: id,
      referenceId: id,
      referenceType: 'DEPOSIT',
      providerId: invoiceNumber,
      regenerationCount: REGENERATION_COUNT,
      expiryDate: Date.now() + EXPIRY_TIME,
      merchantMethod: 'QPAY',
      userId: userId,
      // Amount props
      conversionRate,
      transactionAmount: amountInMnt,
      transactionCurrency,
      amountInUsd,
      // Status props
      invoiceStatus: 'PENDING',
      executionStatus: 'PENDING',
      message: 'Qpay invoice created successfully',
      metadata: qpayInvoice,
      postDate: new Date().toISOString(),
      createdAt: Date.now()
    })
  );

  logger.info(`New invoice created successfully: ${JSON.stringify(invoice)}`);
  return formatApiResponse(depositRequest);
}
