import type { MerchantInvoice, PaymentRequest } from '@motforex/global-types';

import { CustomError, getParameterStoreVal, logger } from '@motforex/global-libs';
import { createSimpleQpayInvoice, getCurrentDateAsString } from '@motforex/global-services';
import { MerchantInvoiceSchema, STATUS_PENDING } from '@motforex/global-types';
import { buildQpayInvoiceRequest } from '../merchant-invoice/merchant-invoice-utils';
import {
  MOTFOREX_QPAY_EXPIRY_TIME,
  QPAY_TOKEN_PARAMETER,
  MOTFOREX_QPAY_REGENERATION_COUNT
} from './motforex-qpay-constants';
import { createMerchantInvoice, updateMerchantInvoice } from '@/repository/merchant-invoice';
import { isPaidOnQpay } from './motforex-qpay-check';
import { markPaymentInvoiceAsSuccessful } from '../merchant-invoice';
import { cancelMotforexInvoice } from './motforex-qpay-cancel';

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
  const { id, conversionRate, amountInUsd, amountWithCommission, transactionCurrency, userId } = depositRequest;
  logger.info(`Creating new Qpay invoice for deposit request: ${id} ${locale}`);

  // const transactionAmount = amountWithCommission.amount * conversionRate;
  const transactionAmount = 10;
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
  const { id, transactionAmount } = merchantInvoice;
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
      regenerationCount: merchantInvoice.regenerationCount - 1,
      expiryDate: Date.now() + MOTFOREX_QPAY_EXPIRY_TIME,
      providerId: invoice_id,
      providerInfo: invoiceNumber,
      metadata: { qPay_shortUrl, qr_text, qr_image, urls }
    },
    'providerId = :oldProviderId',
    { ':oldProviderId': merchantInvoice.providerId }
  );
  logger.info(`Qpay Invoice regenerated successfully: ${JSON.stringify(updatedInvoice.id)}`);

  return updatedInvoice;
}
