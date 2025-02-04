import type { MerchantInvoice, PaymentRequest, RequestMetadata } from '@motforex/global-types';
import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata } from '@motforex/global-types';

import { formatInvoiceAsResponse } from '@motforex/global-services';
import { markPaymentInvoiceAsExpired } from '../merchant-invoice';
import { QpayCreateInvoiceRequest, QpayCreateInvoiceRequestSchema } from '@motforex/global-services';
import { checkAuthorization, handleApiFuncError, CustomError, logger } from '@motforex/global-libs';
import { getMerchantInvoiceById } from '@/repository/invoice-record';
import { getValidDepositRequest } from '../utility';
import { STATUS_PENDING } from '@motforex/global-types';
import { MOTFOREX_QPAY_INVOICE_CODE } from '../qpay';

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
 * Helper function to handle invoice creation and regeneration logic.
 *
 * @param metadata - Request metadata
 * @param id - Invoice ID
 * @param createNewInvoice - Function to create a new invoice
 * @param regenerateInvoice - Function to regenerate an invoice
 * @param invoiceType - Type of invoice (for logging purposes)
 * @returns - API response
 */
export async function handleInvoiceCreation(request: HandleInvoiceCreationRequest): Promise<APIResponse> {
  try {
    const { metadata, id, createNewInvoice, regenerateInvoice, invoiceType } = request;
    const { email, depositRequest, merchantInvoice } = await getValidatedInvoiceAndRequest(metadata, id);

    if (depositRequest.email !== email) {
      logger.error(`Invalid email for ${invoiceType} invoice creation!`);
      throw new CustomError(`Invalid request for ${invoiceType} invoice creation!`, 400);
    }

    if (!depositRequest.paymentMethodTitle.toUpperCase().includes(invoiceType.toUpperCase())) {
      logger.error(`Invalid payment method for ${invoiceType}-invoice creation!`);
      throw new CustomError(`Invalid payment method for ${invoiceType} invoice creation!`, 400);
    }

    // If the invoice request does nox2t exist
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

export async function getValidatedInvoiceAndRequest(metadata: RequestMetadata, id: number): Promise<ValidatedResponse> {
  const { email } = checkAuthorization(metadata, 'create-Motforex-Invoice');
  const [depositRequest, merchantInvoice] = await Promise.all([
    getValidDepositRequest(id, [STATUS_PENDING], email),
    getMerchantInvoiceById(id)
  ]);

  if (depositRequest.status !== STATUS_PENDING) {
    logger.error(`Invalid status for invoice creation!`);
    throw new CustomError('Invalid status for invoice creation!', 400);
  }

  return { email, depositRequest, merchantInvoice };
}

export function buildQpayInvoiceRequest(id: number, amount: number, invoiceNumber: string): QpayCreateInvoiceRequest {
  return QpayCreateInvoiceRequestSchema.parse({
    invoice_code: MOTFOREX_QPAY_INVOICE_CODE,
    sender_invoice_no: invoiceNumber,
    invoice_receiver_code: invoiceNumber,
    invoice_description: `MOTFOREX DEPOSIT ${id}`,
    sender_branch_code: 'MAIN',
    amount,
    callback_url: `https://api.motforex.com/qpay/v1/invoice/${id}/callback`
  });
}
