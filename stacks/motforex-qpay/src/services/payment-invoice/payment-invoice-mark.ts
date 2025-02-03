import type { PaymentInvoice } from '@motforex/global-types';

import { updatePaymentInvoice } from '@/repository/invoice-record';
import { executeDepositRequestById } from '../deposit-request';
import { logger } from '@motforex/global-libs';

export async function markPaymentInvoiceAsSuccessful(invoice: PaymentInvoice): Promise<PaymentInvoice> {
  try {
    logger.info(`Marking payment invoice as paid: ${invoice.id}`);
    const updatedInvoice: PaymentInvoice = { ...invoice, invoiceStatus: 'SUCCESSFUL' };
    await executeDepositRequest(updatedInvoice);
    return await updatePaymentInvoice(updatedInvoice);
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

// --------------------------------------------------------------------------------------------
async function executeDepositRequest(invoice: PaymentInvoice): Promise<void> {
  try {
    await executeDepositRequestById(invoice.id, 'Qpay invoice is paid by CREATE-CHECK');
    invoice.executionStatus = 'SUCCESSFUL';
  } catch (error: unknown) {
    logger.error(`Error occurred on executeDepositRequest: ${JSON.stringify(error)}`);
    invoice.executionStatus = 'UNSUCCESSFUL';
  }
}
