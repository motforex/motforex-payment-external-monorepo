import type { MerchantInvoice, PaymentRequest, RequestMetadata } from '@motforex/global-types';

import { QpayCreateInvoiceRequest, QpayCreateInvoiceRequestSchema } from '@motforex/global-services';
import { checkAuthorization, CustomError, logger } from '@motforex/global-libs';
import { getPaymentInvoiceById } from '@/repository/invoice-record';
import { getValidDepositRequest } from '../utility';
import { STATUS_PENDING } from '@motforex/global-types';
import { MOTFOREX_QPAY_INVOICE_CODE } from '.';

interface ValidatedResponse {
  email: string;
  depositRequest: PaymentRequest;
  invoice: MerchantInvoice | undefined;
}

export async function getValidatedInvoiceAndRequest(metadata: RequestMetadata, id: number): Promise<ValidatedResponse> {
  const { email } = checkAuthorization(metadata, 'create-Motforex-Qpay-Invoice');
  const [depositRequest, invoice] = await Promise.all([
    getValidDepositRequest(id, [STATUS_PENDING], email),
    getPaymentInvoiceById(id)
  ]);

  if (depositRequest.status !== STATUS_PENDING) {
    logger.error(`Invalid status for Qpay invoice creation!`);
    throw new CustomError('Invalid status for Qpay invoice creation!', 400);
  }

  if (depositRequest.paymentMethodTitle && !depositRequest.paymentMethodTitle.toLowerCase().includes('qpay')) {
    logger.error(`Invalid payment method for Qpay invoice creation!`);
    throw new CustomError('Invalid payment method for Qpay invoice creation!', 400);
  }

  return { email, depositRequest, invoice };
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
