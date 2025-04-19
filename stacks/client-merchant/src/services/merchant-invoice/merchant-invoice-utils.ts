import type { MerchantInvoice, PaymentRequest } from '@motforex/global-types';

import { markPaymentInvoiceAsExpired } from '../merchant-invoice';
import { CustomError, logger } from '@motforex/global-libs';
import { getMerchantInvoiceById, getMerchantInvoiceByQuery } from '@/repository/merchant-invoice';
import { getDepositReqById } from '@/repository/deposit-requests';
import { QueryRequestSchema } from '@motforex/dynamo';

interface ValidatedResponse {
  depositRequest: PaymentRequest;
  merchantInvoice: MerchantInvoice | undefined;
}

export type HandleInvoiceCreationRequest = {
  id: number;
  email: string;
  locale: string;
  createNewInvoice: (depositRequest: PaymentRequest, locale: string) => Promise<any>;
  regenerateInvoice: (merchantInvoice: MerchantInvoice) => Promise<any>;
  invoiceType: string;
};

/**
 * Handles the logic for creating or regenerating an invoice based on the provided request data.
 * Validates the request, checks the invoice status, and either creates a new invoice, returns an
 * existing valid invoice, or regenerates an expired one.
 *
 * @param {HandleInvoiceCreationRequest} request - The request object containing metadata, ID, and invoice functions.
 * @param {Metadata} request.metadata - Metadata for the request, including headers and authorization details.
 * @param {number} request.id - The unique identifier of the invoice or deposit request.
 * @param {(depositRequest: PaymentRequest, locale: string) => Promise<any>} request.createNewInvoice - Function to create a new invoice.
 * @param {(merchantInvoice: MerchantInvoice) => Promise<any>} request.regenerateInvoice - Function to regenerate an existing invoice.
 * @param {string} request.invoiceType - The type of invoice (e.g., "QPAY") for logging purposes.
 * @returns {Promise<APIResponse>} - An API response object containing the formatted invoice data or an error response.
 * @example
 * const request = {
 *   metadata: { headers: { locale: 'en', authorization: 'Bearer token' } },
 *   id: 12345,
 *   createNewInvoice: async (depositRequest, locale) => ({ id: 12345, amount: 100 }),
 *   regenerateInvoice: async (merchantInvoice) => ({ ...merchantInvoice, expiryDate: Date.now() + 3600 }),
 *   invoiceType: 'QPAY',
 * };
 * const response = await handleInvoiceCreation(request);
 * // Output: { statusCode: 200, body: '{"id": 12345, "amount": 100}' }
 */
export async function handleInvoiceCreation(request: HandleInvoiceCreationRequest): Promise<MerchantInvoice> {
  const { id, createNewInvoice, regenerateInvoice, locale, invoiceType, email } = request;

  const { depositRequest, merchantInvoice } = await getValidatedInvoiceAndRequest(id, email, invoiceType);
  // If the invoice request does not exist
  if (!merchantInvoice) {
    logger.error(`Merchant invoice not found for ID: ${id}`);
    return await createNewInvoice(depositRequest, locale || 'mn');
  }
  logger.info(`Merchant invoice (${invoiceType}) found for ID: ${id}`);

  // If the invoice request is not PENDING
  if (merchantInvoice.invoiceStatus !== 'PENDING') {
    logger.info(`Merchant invoice (${invoiceType}) is already successful for ID: ${id}`);
    return merchantInvoice;
  }

  // If the invoice request already exists and not expired yet
  const currentDate = Date.now();
  if (merchantInvoice.expiryDate > currentDate) {
    logger.info(`Merchant invoice (${invoiceType}) hasn't expired for ID: ${id}`);
    return merchantInvoice;
  }

  // If invoice has expired and regeneration count is zero
  if (merchantInvoice.regenerationCount <= 0) {
    logger.info(`Merchant invoice (${invoiceType}) regeneration count is zero for ID: ${id}`);
    const updatedInvoice = await markPaymentInvoiceAsExpired(merchantInvoice);
    return updatedInvoice;
  }

  if (depositRequest.status !== 'PENDING') {
    logger.error(`Deposit request is not in PENDING status for ID: ${id}`);
    throw new CustomError('financeMessageErrorDepositRequestNotFound', 400);
  }

  return await regenerateInvoice(merchantInvoice);
}

/**
 * Validates the request metadata and retrieves the deposit request and merchant invoice associated
 * with the given ID. Ensures the deposit request is in a pending state and the email matches the authorization.
 *
 * @param {RequestMetadata} metadata - Metadata containing authorization and header details.
 * @param {number} id - The unique identifier of the deposit request or invoice.
 * @param {string} email - The email address associated with the deposit request.
 * @param {string} invoiceType - The type of invoice (e.g., "QPAY") for validation.
 * @returns {Promise<ValidatedResponse>} - An object containing the validated email, deposit request, and merchant invoice (if it exists).
 * @throws {CustomError} - If the deposit request status is not `PENDING` or validation fails.
 * @example
 * const metadata = { headers: { authorization: 'Bearer token' } };
 * const id = 12345;
 * const result = await getValidatedInvoiceAndRequest(metadata, id);
 * // Output: {
 * //   email: "user@example.com",
 * //   depositRequest: { id: 12345, status: "PENDING", email: "user@example.com" },
 * //   merchantInvoice: undefined
 * // }
 */
export async function getValidatedInvoiceAndRequest(
  id: number,
  email: string,
  invoiceType: string
): Promise<ValidatedResponse> {
  const [depositRequest, merchantInvoice] = await Promise.all([getDepositReqById(id), getMerchantInvoiceById(id)]);
  // If the deposit request does not exist
  if (!depositRequest) {
    logger.error(`Deposit request not found for ID: ${id}`);
    throw new CustomError('financeMessageErrorDepositRequestNotFound', 400);
  }

  // If payment method is not matched with the invoice type
  if (!depositRequest.paymentMethodTitle.toUpperCase().includes(invoiceType.toUpperCase())) {
    logger.error(`Invalid payment method for ${invoiceType}-invoice creation!`);
    throw new CustomError(`financeMessageErrorInvalidPaymentMethod`, 400);
  }

  // If the deposit request does not exist
  if (depositRequest.email !== email) {
    logger.info(`Email mismatch for deposit request ID: ${id}`);
    throw new CustomError(`financeMessageErrorInvalidPaymentMethod`, 400);
  }

  return { depositRequest, merchantInvoice };
}

export async function getMerchantInvoiceByProviderId(providerId: string, amount: number): Promise<MerchantInvoice> {
  const queryRequest = QueryRequestSchema.parse({
    indexName: 'providerId-createdAt-index',
    pKey: providerId,
    pKeyType: 'S',
    pKeyProp: 'providerId'
  });

  const { items } = await getMerchantInvoiceByQuery(queryRequest);

  if (items.length === 0) {
    logger.info(`No merchant invoice found for providerId: ${providerId}`);
    throw new CustomError(`MerchantInvoice not found`);
  }

  if (items.length > 1) {
    logger.info(`Multiple invoices found for providerId: ${providerId}, selecting closest to amount: ${amount}`);
    const closestItem = items.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev.transactionAmount - amount);
      const currDiff = Math.abs(curr.transactionAmount - amount);
      return currDiff < prevDiff ? curr : prev;
    });
    return closestItem;
  }

  return items[0];
}
