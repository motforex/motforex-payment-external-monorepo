import type { MerchantInvoice } from '@motforex/global-types';

import { CustomError, getParameterStoreVal, logger } from '@motforex/global-libs';
import { checkQpayInvoice } from '@motforex/global-services';
import { markPaymentInvoiceAsSuccessful } from '../merchant-invoice';
import { getValidatedInvoiceAndRequest } from '../merchant-invoice';
import { QPAY_TOKEN_PARAMETER } from './motforex-qpay-constants';
import { STATUS_PENDING } from '@motforex/global-types';

/**
 * Check Motforex Qpay invoice as client. Checks the invoiceStatus of the PaymentInvoice and if its status is PENDING, it will check the invoice from Qpay.'
 *
 * @param metadata
 * @param id
 * @returns
 *
 */
export async function checkMotforexQpayInvoiceAsClient(id: number, email: string): Promise<MerchantInvoice> {
  const { merchantInvoice } = await getValidatedInvoiceAndRequest(id, email, 'QPAY');
  // Check if the deposit request and invoice exist

  if (!merchantInvoice) {
    logger.error(`Deposit request or invoice does not exist!`);
    throw new CustomError('financeMessageErrorDepositRequestNotFound', 404);
  }

  if (merchantInvoice.invoiceStatus !== STATUS_PENDING) {
    logger.info(`Invoice is not in PENDING status!`);
    return merchantInvoice;
  }

  return await checkMotforexQpayInvoice(merchantInvoice);
}

/**
 * Check Motforex Qpay invoice. Checks the invoiceStatus of the PaymentInvoice and if its status is PENDING, it will check the invoice from Qpay.'
 * If the invoice is paid, it will update the PaymentInvoice status to PAID, and executes Deposit Request.
 *
 * @param invoice
 * @returns
 *
 */
export async function checkMotforexQpayInvoice(invoice?: MerchantInvoice): Promise<MerchantInvoice> {
  if (!invoice) {
    logger.error(`Invoice does not exist for deposit request!`);
    throw new CustomError('Invoice does not exist for the deposit request!', 404);
  }

  if (invoice.invoiceStatus !== STATUS_PENDING) {
    logger.info(`Invoice is not in PENDING status!`);
    return invoice;
  }

  const qpayAuthToken = await getParameterStoreVal(QPAY_TOKEN_PARAMETER);
  if (!qpayAuthToken) {
    logger.error('QPAY token is not found in the parameter store!');
    throw new CustomError('Unable to process Qpay-Invoice', 500);
  }

  // Check if the invoice is paid
  if (!(await isPaidOnQpay(qpayAuthToken, invoice))) {
    logger.info(`Invoice is not paid yet!`);
    return invoice;
  }

  // If the invoice is paid, update the invoice status to PAID
  logger.info(`Invoice is paid!`);
  return await markPaymentInvoiceAsSuccessful(invoice);
}

/**
 * Check invoice from Qpay without updating PaymentInvoice.
 *
 * @param qpayToken - Qpay token
 * @param invoice - PaymentInvoice
 *
 * @returns - True if the invoice is paid, false otherwise
 *
 **/
export async function isPaidOnQpay(qpayToken: string, invoice: MerchantInvoice): Promise<boolean> {
  try {
    logger.info(`Checking invoice from Qpay: ${invoice.id}, QpayInvoice: ${invoice.providerId}`);
    const { count, paid_amount, rows } = await checkQpayInvoice(qpayToken, `${invoice.providerId}`);

    if (count === 0) {
      logger.info(`Qpay invoice is not paid yet! QpayInvoice: ${invoice.providerId}`);
      return false;
    }

    logger.info(`Qpay invoice check found a match! QpayInvoice: ${invoice.providerId}`);
    logger.info(`Qpay invoice check response: COUNT:${count} PAID_AMOUNT:${paid_amount} ROWS:${JSON.stringify(rows)}`);

    const roundedAmount = roundToTwoDecimalPlaces(invoice.transactionAmount);
    logger.info(`Rounded amount: ${roundedAmount}`);
    logger.info(`Paid amount: ${paid_amount}`);
    const isPaid = paid_amount !== undefined && Math.abs(paid_amount - roundedAmount) <= 1;

    logger.info(`Qpay invoice is paid: ${isPaid}, QpayInvoice: ${invoice.providerId}`);
    return isPaid;
  } catch (error: unknown) {
    logger.error(`Error occurred while checking invoice from Qpay: ${JSON.stringify(error)}`);
    throw error;
  }
}

function roundToTwoDecimalPlaces(input: number): number {
  return Math.round((input + Number.EPSILON) * 100) / 100;
}
