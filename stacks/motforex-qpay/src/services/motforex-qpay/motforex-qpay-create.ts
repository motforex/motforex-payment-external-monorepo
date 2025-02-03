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

import { createPaymentInvoice, updatePaymentInvoice } from '@/repository/invoice-record';
import { createSimpleQpayInvoice, formatInvoiceAsResponse } from '@motforex/global-services';
import { QPAY_TOKEN_PARAMETER } from './motforex-qpay-constants';
import { getCurrentDateAsString } from '../utility';
import { markPaymentInvoiceAsExpired, markPaymentInvoiceAsSuccessful } from '../payment-invoice';
import { checkInvoiceFromQpay } from './motforex-qpay-check';
import { cancelQpayInvoice } from './motforex-qpay-cancel';
import { buildQpayInvoiceRequest } from '../qpay/qpay-utils';
import { getValidatedInvoiceAndRequest } from './motforex-qpay-utils';

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
    const { email, depositRequest, invoice } = await getValidatedInvoiceAndRequest(metadata, id);

    if (depositRequest.email !== email) {
      logger.error(`Invalid email for Qpay invoice creation!`);
      throw new CustomError('Invalid request for Qpay invoice creation!', 400);
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
    if (invoice.expiryDate > currentDate) {
      logger.info(`Invoice haven't expired for deposit request: ${id}`);
      return formatInvoiceAsResponse(invoice);
    }
    logger.info(`Invoice expiry date: ${invoice.expiryDate}, Current date: ${currentDate}`);

    logger.info(`Invoice have expired for deposit request: ${id}`);
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
 * Regenerate Qpay invoice for the deposit request. If the invoice is not paid, it will cancel the older invoice and create a new one.
 * If the invoice is paid, it will return the invoice as is.
 *
 * @param invoice
 * @returns
 */
async function regenerateQpayInvoice(invoice: PaymentInvoice): Promise<APIResponse> {
  const { id, transactionAmount } = invoice;
  logger.info(`Regenerating Qpay invoice for deposit request: ${id}`);

  const invoiceNumber = `${id}${getCurrentDateAsString()}`;
  const qpayRequest = buildQpayInvoiceRequest(id, transactionAmount, invoiceNumber);

  const qpayAuthToken = await getParameterStoreVal(QPAY_TOKEN_PARAMETER);
  if (!qpayAuthToken) {
    logger.error('QPAY token is not found in the parameter store!');
    throw new CustomError('QPAY token is not found in the parameter store!', 500);
  }

  // If the older invoice is PAID
  if (await checkInvoiceFromQpay(qpayAuthToken, invoice)) {
    await markPaymentInvoiceAsSuccessful(invoice);
  }

  // IF the older invoice is NOT-PAID
  await cancelQpayInvoice(qpayAuthToken, invoice.providerId);

  // Create new Qpay invoice
  const { invoice_id, qPay_shortUrl, qr_text, qr_image, urls } = await createSimpleQpayInvoice(
    qpayAuthToken,
    qpayRequest
  );
  logger.info(`Qpay invoice regenerated! successfully: ${invoice_id}`);

  // update the invoice
  const updateInvoice = await updatePaymentInvoice(
    {
      ...invoice,
      regenerationCount: invoice.regenerationCount - 1,
      expiryDate: Date.now() + EXPIRY_TIME,
      providerId: invoice_id,
      providerInfo: invoiceNumber,
      metadata: { qPay_shortUrl, qr_text, qr_image, urls }
    },
    'providerId = :oldProviderId',
    { ':oldProviderId': invoice.providerId }
  );

  logger.info(`Qpay Invoice regenerated successfully: ${JSON.stringify(updateInvoice.id)}`);
  return formatInvoiceAsResponse(updateInvoice);
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

  const transactionAmount = amountWithCommission.amount * conversionRate;
  logger.info(`Initial amount: ${amountWithCommission.amount}, Conversion rate: ${conversionRate}`);
  logger.info(`The converted AmountInMNT: ${transactionAmount}`);

  const invoiceNumber = `${id}${getCurrentDateAsString()}`;
  const createQpayInvoiceRequest = buildQpayInvoiceRequest(id, transactionAmount, invoiceNumber);

  const qpayAuthToken = await getParameterStoreVal(QPAY_TOKEN_PARAMETER);
  if (!qpayAuthToken) {
    logger.error('QPAY token is not found in the parameter store!');
    throw new CustomError('QPAY token is not found in the parameter store!', 500);
  }

  const { invoice_id, qPay_shortUrl, qr_text, qr_image, urls } = await createSimpleQpayInvoice(
    qpayAuthToken,
    createQpayInvoiceRequest
  );
  logger.info(`Qpay invoice created successfully: ${JSON.stringify(invoice_id)}`);

  const invoice = await createPaymentInvoice(
    PaymentInvoiceSchema.parse({
      // General config props
      id: id,
      referenceId: id,
      referenceType: 'DEPOSIT',
      providerId: invoice_id,
      providerInfo: invoiceNumber,
      regenerationCount: REGENERATION_COUNT,
      expiryDate: Date.now() + EXPIRY_TIME,
      merchantMethod: 'QPAY',
      userId: userId,
      // Amount props
      conversionRate,
      transactionAmount,
      transactionCurrency,
      amountInUsd,
      // Status props
      invoiceStatus: STATUS_PENDING,
      executionStatus: STATUS_PENDING,
      message: 'Qpay invoice created successfully',
      metadata: { qPay_shortUrl, qr_text, qr_image, urls },
      postDate: new Date().toISOString(),
      createdAt: Date.now()
    })
  );

  logger.info(`New invoice created successfully: ${JSON.stringify(invoice.id)}`);
  return formatApiResponse(depositRequest);
}
