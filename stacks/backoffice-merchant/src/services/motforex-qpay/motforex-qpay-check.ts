import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata, PaymentInvoice } from '@motforex/global-types';

import { CustomError, getParameterStoreVal, handleApiFuncError, logger } from '@motforex/global-libs';
import { checkQpayInvoice, formatInvoiceAsResponse, QpayCheckPayment } from '@motforex/global-services';
import { getValidatedInvoiceAndRequest } from './motforex-qpay-utils';
import { QPAY_TOKEN_PARAMETER } from './motforex-qpay-constants';
import { markPaymentInvoiceAsSuccessful } from '../payment-invoice';

/**
 *
 * Check Motforex Qpay invoice as admin. Checks the invoiceStatus of the PaymentInvoice and if its status is PENDING, it will check the invoice from Qpay.'
 * If the invoice is paid, it will update the PaymentInvoice status to PAID, and executes deposit Request
 *
 * @param metadata
 * @param id
 * @returns
 */
export async function checkMotforexQpayInvoice(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    // Check if the invoice is valid
    const { invoice } = await getValidatedInvoiceAndRequest(metadata, id);

    // Check if the invoice is paid
    return await formatInvoiceAsResponse(await checkMotforexQpayInv(invoice));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

/**
 *
 * Check Motforex Qpay invoice. Checks the invoiceStatus of the PaymentInvoice and if its status is PENDING, it will check the invoice from Qpay.'
 * If the invoice is paid, it will update the PaymentInvoice status to PAID, and executes Deposit Request.
 *
 *
 * @param invoice
 * @returns
 */
export async function checkMotforexQpayInv(invoice: PaymentInvoice | undefined): Promise<PaymentInvoice> {
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
    throw new CustomError('QPAY token is not found in the parameter store!', 500);
  }

  if (!(await checkInvoiceFromQpay(qpayAuthToken, invoice))) {
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
export async function checkInvoiceFromQpay(qpayToken: string, invoice: PaymentInvoice): Promise<boolean> {
  try {
    logger.info(`Checking invoice from Qpay: ${invoice.id}, QpayInvoice: ${invoice.providerId}`);
    const checkResponse: QpayCheckPayment = await checkQpayInvoice(qpayToken, `${invoice.providerId}`);

    if (checkResponse.count === 0) {
      logger.info(`Qpay invoice is not paid yet! QpayInvoice: ${invoice.providerId}`);
      return false;
    }

    logger.info(`Qpay invoice check found a match! QpayInvoice: ${invoice.providerId}`);
    logger.info(`Qpay invoice check response: ${JSON.stringify(checkResponse)}`);

    const roundedAmount = roundToTwoDecimalPlaces(invoice.transactionAmount);
    logger.info(`Rounded amount: ${roundedAmount}`);
    logger.info(`Paid amount: ${checkResponse.paid_amount}`);
    const isPaid = checkResponse.paid_amount !== undefined && Math.abs(checkResponse.paid_amount - roundedAmount) <= 1;

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
