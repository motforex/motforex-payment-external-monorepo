import { updatePaymentInvoice } from '@/repository/invoice-record';
import { logger } from '@motforex/global-libs';
import { PaymentInvoice } from '@motforex/global-types';

export async function markPaymentInvoiceAsSuccessful(invoice: PaymentInvoice): Promise<PaymentInvoice> {
  try {
    logger.info(`Marking payment invoice as paid: ${invoice.id}`);
    return await updatePaymentInvoice({ ...invoice, invoiceStatus: 'SUCCESSFUL' });
  } catch (error: unknown) {
    logger.error(`Error marking payment invoice as paid: ${invoice.id}`);
    throw error;
  }
}

export async function markPaymentInvoiceAsExpired(invoice: PaymentInvoice): Promise<PaymentInvoice> {
  try {
    logger.info(`Expiring payment invoice: ${invoice.id}`);
    return await updatePaymentInvoice({ ...invoice, invoiceStatus: 'EXPIRED', executionStatus: 'EXPIRED' });
  } catch (error: unknown) {
    logger.error(`Error expiring payment invoice: ${invoice.id}`);
    throw error;
  }
}

export async function markPaymentInvoiceAsUnsuccessful(invoice: PaymentInvoice): Promise<PaymentInvoice> {
  try {
    logger.info(`Expiring payment invoice: ${invoice.id}`);
    return await updatePaymentInvoice({ ...invoice, invoiceStatus: 'UNSUCCESSFUL', executionStatus: 'UNSUCCESSFUL' });
  } catch (error: unknown) {
    logger.error(`Error expiring payment invoice: ${invoice.id}`);
    throw error;
  }
}
