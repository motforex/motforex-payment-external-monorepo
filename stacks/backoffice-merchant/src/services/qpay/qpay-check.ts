import type { MerchantInvoice } from '@motforex/global-types';

import { logger } from '@motforex/global-libs';
import { checkQpayInvoice, QpayCheckPayment } from '@motforex/global-services';

/**
 * Check invoice from Qpay without updating PaymentInvoice.
 *
 * @param qpayToken - Qpay token
 * @param invoice - PaymentInvoice
 *
 * @returns - True if the invoice is paid, false otherwise
 *
 **/
export async function isQpayInvoicePaid(qpayToken: string, invoice: MerchantInvoice): Promise<boolean> {
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
