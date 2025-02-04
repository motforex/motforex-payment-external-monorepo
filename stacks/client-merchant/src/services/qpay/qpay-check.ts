import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata, MerchantInvoice } from '@motforex/global-types';

import { CustomError, getParameterStoreVal, handleApiFuncError, logger } from '@motforex/global-libs';
import { checkQpayInvoice, formatInvoiceAsResponse } from '@motforex/global-services';
import { getValidatedInvoiceAndRequest } from '../merchant-invoice/merchant-invoice-utils';
import { QPAY_TOKEN_PARAMETER } from './qpay-constants';
import { markPaymentInvoiceAsSuccessful } from '../merchant-invoice';

/**
 * Check Motforex Qpay invoice as client. Checks the invoiceStatus of the PaymentInvoice and if its status is PENDING, it will check the invoice from Qpay.'
 *
 * @param metadata
 * @param id
 * @returns
 *
 */
export async function checkMotforexQpayInvoiceAsClient(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    const { email, depositRequest, merchantInvoice } = await getValidatedInvoiceAndRequest(metadata, id);
    // Check if the email is valid
    if (depositRequest.email !== email) {
      logger.error(`Invalid email for Qpay invoice creation!`);
      throw new CustomError('Invalid request for Qpay invoice creation!', 400);
    }
    // Check if the invoice is paid
    return await formatInvoiceAsResponse(await checkMotforexQpayInvoice(merchantInvoice));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
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

  if (invoice.invoiceStatus !== 'PENDING') {
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
    return invoice;
  }

  // Mark the invoice as successful
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
