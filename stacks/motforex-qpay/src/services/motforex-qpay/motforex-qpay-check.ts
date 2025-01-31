import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata, PaymentInvoice } from '@motforex/global-types';
import { formatApiResponse, handleApiFuncError, logger } from '@motforex/global-libs';
import { getValidInvoiceRecord } from '../utility';
import { checkQpayInvoice, formatInvoiceAsResponse, QpayCheckPayment } from '@motforex/global-services';

/**
 *
 * Check Motforex Qpay invoice as client. Checks the invoiceStatus of the PaymentInvoice and if its status is PENDING, it will check the invoice from Qpay.'
 *
 * @param metadata
 * @param id
 * @returns
 */
export async function checkMotforexQpayInvoiceAsClient(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    const paymentInvoice = await getValidInvoiceRecord(id);

    if (paymentInvoice.invoiceStatus !== 'PENDING') {
      logger.info(`Invoice is not available for checking: ${id} status:${paymentInvoice.invoiceStatus}`);
      return formatInvoiceAsResponse(paymentInvoice);
    }

    return formatApiResponse({});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

/**
 *
 * Check Motforex Qpay invoice as admin. Checks the invoiceStatus of the PaymentInvoice and if its status is PENDING, it will check the invoice from Qpay.'
 * If the invoice is paid, it will update the PaymentInvoice status to PAID, and executes deposit Request
 *
 * @param metadata
 * @param id
 * @returns
 */
export async function checkMotforexQpayInvoiceAsAdmin(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    const paymentInvoice = await getValidInvoiceRecord(id);

    return formatApiResponse({});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
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
    const checkResponse: QpayCheckPayment = await checkQpayInvoice(qpayToken, `${invoice.providerInfo}`);

    if (checkResponse.count === 0) {
      logger.info(`Qpay invoice is not paid yet! QpayInvoice: ${invoice.providerId}`);
      return false;
    }

    logger.info(`Qpay invoice check found a match! QpayInvoice: ${invoice.providerId}`);
    logger.info(`Qpay invoice check response: ${JSON.stringify(checkResponse)}`);

    const roundedAmount = roundToTwoDecimalPlaces(invoice.transactionAmount);
    const isPaid = checkResponse.paid_amount !== undefined && Math.abs(checkResponse.paid_amount - roundedAmount) <= 1;

    return isPaid;
  } catch (error: unknown) {
    logger.error(`Error occurred while checking invoice from Qpay: ${JSON.stringify(error)}`);
    throw error;
  }
}

function roundToTwoDecimalPlaces(input: number): number {
  return Math.round((input + Number.EPSILON) * 100) / 100;
}
