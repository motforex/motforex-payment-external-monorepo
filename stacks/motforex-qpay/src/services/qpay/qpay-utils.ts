import { QpayCreateInvoiceRequest, QpayCreateInvoiceRequestSchema } from '@motforex/global-services';
import { MOTFOREX_QPAY_INVOICE_CODE } from '../motforex-qpay';

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
