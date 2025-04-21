import type { MerchantInvoice, PaymentRequest } from '@motforex/global-types';

import { CustomError, logger } from '@motforex/global-libs';
import { getMerchantInvoiceById } from '@/repository/merchant-invoice';
import { getValidDepositRequest } from '../utility';
import { STATUS_CANCELLED, STATUS_EXPIRED, STATUS_PENDING } from '@motforex/global-types';

interface ValidatedResponse {
  depositRequest: PaymentRequest;
  merchantInvoice: MerchantInvoice | undefined;
}

/**
 * Retrieves and validates a deposit request and its corresponding merchant invoice.
 *
 * This function concurrently fetches a deposit request and a merchant invoice by their ID.
 * It then validates the status and payment method of the deposit request.
 * If the status is not pending or the payment method does not match the expected value,
 * an error is logged and a custom error is thrown.
 *
 * @param {number} id - The unique identifier of the invoice.
 * @param {string[]} payment - The payment method or identifier.
 * @param {string} [email] - The optional email associated with the invoice.
 * @returns A promise that resolves to an object containing the validated deposit request and merchant invoice.
 * @throws {CustomError} If the status is not pending or the payment method is invalid.
 */
export async function getValidatedInvoiceAndRequest(
  id: number,
  payment: string[],
  email?: string
): Promise<ValidatedResponse> {
  // Run both async operations concurrently.
  const [depositRequest, merchantInvoice] = await Promise.all([
    getValidDepositRequest(id, [STATUS_PENDING, STATUS_CANCELLED, STATUS_EXPIRED], email),
    getMerchantInvoiceById(id)
  ]);

  const { paymentMethodTitle } = depositRequest;

  // If a paymentMethodTitle exists, validate that at least one provided payment method matches.
  if (!paymentMethodTitle) {
    logger.error('No payment method title found for Qpay invoice creation!');
    throw new CustomError('No payment method title found for Qpay invoice creation!', 400);
  }

  // Check if none of the provided payment methods are included in the paymentMethod string.
  const paymentMethod = paymentMethodTitle.toLowerCase();
  if (!payment.some((p) => paymentMethod.includes(p.toLowerCase()))) {
    logger.error('Invalid payment method for Qpay invoice creation!');
    throw new CustomError('Invalid payment method for Qpay invoice creation!', 400);
  }

  return { depositRequest, merchantInvoice };
}

/**
 * Documentation of getValidInvoicePayment function
 *
 * Retrieves a valid merchant invoice based on the provided ID, payment, and optional email.
 *
 * @param {number} id - The unique identifier of the invoice.
 * @param {string[]} payment - The payment method or identifier.
 * @param {string} [email] - The optional email associated with the invoice.
 * @returns {Promise<MerchantInvoice>} - A promise that resolves to the valid merchant invoice.
 *
 * @throws {CustomError} - Throws an error if the invoice does not exist for the deposit request.
 */
export async function getValidInvoicePayment(id: number, payment: string[], email?: string): Promise<MerchantInvoice> {
  // Check if the invoice is valid
  const { merchantInvoice } = await getValidatedInvoiceAndRequest(id, payment, email);

  if (!merchantInvoice) {
    logger.error(`Invoice does not exist for deposit request!`);
    throw new CustomError('Invoice does not exist for the deposit request!', 404);
  }

  logger.info(`Invoice found for deposit request!`);
  return merchantInvoice;
}
