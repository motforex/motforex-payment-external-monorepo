import { updatePaymentInvoice } from '@/repository/invoice-record';
import { logger } from '@motforex/global-libs';
import { PaymentInvoice } from '@motforex/global-types';

export async function markPaymentInvoiceAsExpired(invoice: PaymentInvoice): Promise<PaymentInvoice> {
  try {
    logger.info(`Expiring payment invoice: ${invoice.id}`);
    return await updatePaymentInvoice({ ...invoice, invoiceStatus: 'EXPIRED' });
  } catch (error: unknown) {
    logger.error(`Error expiring payment invoice: ${invoice.id}`);
    throw error;
  }
}
