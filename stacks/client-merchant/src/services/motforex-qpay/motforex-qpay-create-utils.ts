import type { MerchantInvoice, PaymentRequest } from '@motforex/global-types';

import { markPaymentInvoiceAsSuccessful } from '../merchant-invoice';
import {
  createSimpleQpayInvoice,
  getCurrentDateAsString,
  QpayCreateInvoiceRequest,
  QpayCreateInvoiceRequestSchema
} from '@motforex/global-services';
import { createMerchantInvoice, updateMerchantInvoice } from '@/repository/merchant-invoice';
import { CustomError, getParameterStoreVal, logger } from '@motforex/global-libs';
import { MerchantInvoiceSchema, STATUS_PENDING } from '@motforex/global-types';
import {
  MOTFOREX_QPAY_EXPIRY_TIME,
  QPAY_TOKEN_PARAMETER,
  MOTFOREX_QPAY_REGENERATION_COUNT,
  MOTFOREX_QPAY_INVOICE_CODE
} from './motforex-qpay-constants';
import { cancelMotforexInvoice } from './motforex-qpay-cancel';
import { isPaidOnQpay } from './motforex-qpay-check';

/**
 * Create new Qpay invoice for the deposit request.
 *
 * @param depositRequest
 * @returns
 */
export async function createNewQpayInvoice(
  depositRequest: PaymentRequest,
  locale: string = 'mn'
): Promise<MerchantInvoice> {
  const { id, conversionRate, amountInUsd, amountWithCommission, transactionCurrency, userId, status } = depositRequest;
  logger.info(`Creating new Qpay invoice for deposit request: ${id} ${locale}`);

  // Check if the deposit request and invoice exist
  if (status !== STATUS_PENDING) {
    logger.error(`Deposit request is not in PENDING status!`);
    throw new CustomError('financeMessageErrorStatusNotAcceptable', 400);
  }

  // Calculate the transaction amount
  const transactionAmount = amountWithCommission.amount * conversionRate;
  logger.info(`Initial amount: ${amountWithCommission.amount}, Conversion rate: ${conversionRate}`);
  logger.info(`The converted AmountInMNT: ${transactionAmount}`);
  const invoiceNumber = `${id}${getCurrentDateAsString()}`;

  // Create qpay invoice request
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
  const invoice = await createMerchantInvoice(
    MerchantInvoiceSchema.parse({
      // General config props
      id: id,
      referenceId: id,
      referenceType: 'DEPOSIT',
      providerId: invoice_id,
      providerInfo: invoiceNumber,
      regenerationCount: MOTFOREX_QPAY_REGENERATION_COUNT,
      expiryDate: Date.now() + MOTFOREX_QPAY_EXPIRY_TIME,
      merchantMethod: 'QPAY',
      userId: userId,
      all: 1,
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
  return invoice;
}

/**
 * Regenerate Qpay invoice for the deposit request. If the invoice is not paid, it will cancel the older invoice and create a new one.
 * If the invoice is paid, it will return the invoice as is.
 *
 * @param merchantInvoice
 * @returns
 */
export async function regenerateQpayInvoice(merchantInvoice: MerchantInvoice): Promise<MerchantInvoice> {
  const { id, transactionAmount, regenerationCount, providerId } = merchantInvoice;
  logger.info(`Regenerating Qpay invoice for deposit request: ${id}`);

  const qpayAuthToken = await getParameterStoreVal(QPAY_TOKEN_PARAMETER);
  if (!qpayAuthToken) {
    logger.error('QPAY token is not found in the parameter store!');
    throw new CustomError('QPAY token is not found in the parameter store!', 500);
  }

  // If the older invoice is PAID
  if (await isPaidOnQpay(qpayAuthToken, merchantInvoice)) {
    logger.info(`Qpay invoice is already paid!`);
    return await markPaymentInvoiceAsSuccessful(merchantInvoice);
  }
  logger.info(`Qpay invoice is not paid yet!`);

  // IF the older invoice is NOT-PAID
  await cancelMotforexInvoice(qpayAuthToken, merchantInvoice.providerId);

  // Creating invoice request
  const invoiceNumber = `${id}${getCurrentDateAsString()}`;
  const qpayRequest = buildQpayInvoiceRequest(id, transactionAmount, invoiceNumber);
  const { invoice_id, qPay_shortUrl, qr_text, qr_image, urls } = await createSimpleQpayInvoice(
    qpayAuthToken,
    qpayRequest
  );
  logger.info(`Qpay invoice regenerated! successfully: ${invoice_id}`);

  // update the invoice
  const updatedInvoice = await updateMerchantInvoice(
    {
      ...merchantInvoice,
      regenerationCount: regenerationCount - 1,
      expiryDate: Date.now() + MOTFOREX_QPAY_EXPIRY_TIME,
      providerId: invoice_id,
      providerInfo: invoiceNumber,
      metadata: { qPay_shortUrl, qr_text, qr_image, urls }
    },
    'providerId = :oldProviderId',
    { ':oldProviderId': providerId }
  );
  logger.info(`Qpay Invoice regenerated successfully: ${JSON.stringify(updatedInvoice.id)}`);

  return updatedInvoice;
}

/**
 * Constructs a QPay invoice request object based on the provided ID, amount, and invoice number.
 * The object is validated against the `QpayCreateInvoiceRequestSchema`.
 *
 * @param {number} id - The unique identifier of the deposit request.
 * @param {number} amount - The amount for the invoice.
 * @param {string} invoiceNumber - The unique invoice number.
 * @returns {QpayCreateInvoiceRequest} - A validated QPay invoice request object.
 * @example
 * const qpayRequest = buildQpayInvoiceRequest(12345, 100.50, "INV12345");
 * // Output: {
 * //   invoice_code: "MOTFOREX_QPAY_INVOICE_CODE",
 * //   sender_invoice_no: "INV12345",
 * //   invoice_receiver_code: "INV12345",
 * //   invoice_description: "MOTFOREX DEPOSIT 12345",
 * //   sender_branch_code: "MAIN",
 * //   amount: 100.50,
 * //   callback_url: "https://api-backoffice.motforex.com/mechant/v1/invoice/qpay/12345/callback"
 * // }
 */
export function buildQpayInvoiceRequest(id: number, amount: number, invoiceNumber: string): QpayCreateInvoiceRequest {
  return QpayCreateInvoiceRequestSchema.parse({
    invoice_code: MOTFOREX_QPAY_INVOICE_CODE,
    sender_invoice_no: invoiceNumber,
    invoice_receiver_code: invoiceNumber,
    invoice_description: `MOTFOREX DEPOSIT ${id}`,
    sender_branch_code: 'MAIN',
    amount,
    callback_url: `https://api.motforex.com/mechant/v1/invoice/qpay/${id}/callback`
  });
}
