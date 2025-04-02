import type { MerchantInvoice, PaymentRequest, RequestMetadata } from '@motforex/global-types';
import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata } from '@motforex/global-types';

import { formatInvoiceAsResponse } from '@motforex/global-services';
import { markPaymentInvoiceAsExpired } from '../merchant-invoice';
import { QpayCreateInvoiceRequest, QpayCreateInvoiceRequestSchema } from '@motforex/global-services';
import { checkAuthorization, handleApiFuncError, CustomError, logger } from '@motforex/global-libs';
import { getMerchantInvoiceById } from '@/repository/merchant-invoice';
import { getValidDepositRequest } from '../utility';
import { STATUS_PENDING } from '@motforex/global-types';
import { MOTFOREX_QPAY_INVOICE_CODE } from '../motforex-qpay';

interface ValidatedResponse {
  email: string;
  depositRequest: PaymentRequest;
  merchantInvoice: MerchantInvoice | undefined;
}

export type HandleInvoiceCreationRequest = {
  metadata: Metadata;
  id: number;
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
export async function handleInvoiceCreation(request: HandleInvoiceCreationRequest): Promise<APIResponse> {
  try {
    const { metadata, id, createNewInvoice, regenerateInvoice, invoiceType } = request;
    const { depositRequest, merchantInvoice } = await getValidatedInvoiceAndRequest(metadata, id);

    if (!depositRequest.paymentMethodTitle.toUpperCase().includes(invoiceType.toUpperCase())) {
      logger.error(`Invalid payment method for ${invoiceType}-invoice creation!`);
      throw new CustomError(`Invalid payment method for ${invoiceType} invoice creation!`, 400);
    }

    // If the invoice request does not exist
    if (!merchantInvoice) {
      logger.info(`${invoiceType}-Invoice does not exist for deposit request: ${id}`);
      return formatInvoiceAsResponse(
        await createNewInvoice(depositRequest, (metadata.headers.locale as string) || 'en')
      );
    }

    // If the invoice request already exists
    logger.info(`${invoiceType}-Invoice already exists for deposit request: ${id}`);
    if (merchantInvoice.invoiceStatus !== 'PENDING') {
      logger.info(`${invoiceType}-Invoice is already successful for deposit request: ${id}`);
      return formatInvoiceAsResponse(merchantInvoice);
    }

    const currentDate = Date.now();
    if (merchantInvoice.expiryDate > currentDate) {
      logger.info(`${invoiceType}-Invoice hasn't expired for deposit request: ${id}`);
      return formatInvoiceAsResponse(merchantInvoice);
    }

    logger.info(`${invoiceType}-Invoice has expired for deposit request: ${id}`);
    if (merchantInvoice.regenerationCount <= 0) {
      logger.info(`${invoiceType}-Invoice regeneration count is zero for deposit request: ${id}`);
      const updatedInvoice = await markPaymentInvoiceAsExpired(merchantInvoice);
      return formatInvoiceAsResponse(updatedInvoice);
    }

    return formatInvoiceAsResponse(await regenerateInvoice(merchantInvoice));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

/**
 * Validates the request metadata and retrieves the deposit request and merchant invoice associated
 * with the given ID. Ensures the deposit request is in a pending state and the email matches the authorization.
 *
 * @param {RequestMetadata} metadata - Metadata containing authorization and header details.
 * @param {number} id - The unique identifier of the deposit request or invoice.
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
export async function getValidatedInvoiceAndRequest(metadata: RequestMetadata, id: number): Promise<ValidatedResponse> {
  const { email } = checkAuthorization(metadata, 'create-Motforex-Invoice');
  const [depositRequest, merchantInvoice] = await Promise.all([
    getValidDepositRequest(id, [STATUS_PENDING], email),
    getMerchantInvoiceById(id)
  ]);

  return { email, depositRequest, merchantInvoice };
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
    callback_url: `https://api-backoffice.motforex.com/mechant/v1/invoice/qpay/${id}/callback`
  });
}
