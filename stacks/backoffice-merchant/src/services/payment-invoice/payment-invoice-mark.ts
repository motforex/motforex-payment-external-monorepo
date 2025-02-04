import type { MerchantInvoice } from '@motforex/global-types';

import { executeDepositRequestById, markDepositRequestAsExpired } from '@motforex/global-services';
import { updatePaymentInvoice } from '@/repository/invoice-record';
import { logger } from '@motforex/global-libs';

export async function markPaymentInvoiceAsSuccessful(invoice: MerchantInvoice): Promise<MerchantInvoice> {
  try {
    logger.info(`Marking payment invoice as paid: ${invoice.id}`);
    const updatedInvoice: MerchantInvoice = { ...invoice, invoiceStatus: 'SUCCESSFUL' };
    await executeDepositRequest(updatedInvoice);
    return await updatePaymentInvoice(updatedInvoice);
  } catch (error: unknown) {
    logger.error(`Error marking payment invoice as paid: ${invoice.id}`);
    throw error;
  }
}

export async function markPaymentInvoiceAsExpired(invoice: MerchantInvoice): Promise<MerchantInvoice> {
  try {
    logger.info(`Expiring payment invoice: ${invoice.id}`);
    await markDepositRequestAsExpired(invoice.id, 'Qpay invoice is expired');
    return await updatePaymentInvoice({ ...invoice, invoiceStatus: 'EXPIRED', executionStatus: 'EXPIRED' });
  } catch (error: unknown) {
    logger.error(`Error expiring payment invoice: ${invoice.id}`);
    throw error;
  }
}

export async function markPaymentInvoiceAsUnsuccessful(invoice: MerchantInvoice): Promise<MerchantInvoice> {
  try {
    logger.info(`Expiring payment invoice: ${invoice.id}`);
    return await updatePaymentInvoice({ ...invoice, invoiceStatus: 'UNSUCCESSFUL', executionStatus: 'UNSUCCESSFUL' });
  } catch (error: unknown) {
    logger.error(`Error expiring payment invoice: ${invoice.id}`);
    throw error;
  }
}

// --------------------------------------------------------------------------------------------
async function executeDepositRequest(invoice: MerchantInvoice): Promise<void> {
  try {
    await executeDepositRequestById(invoice.id, 'Qpay invoice is paid by CREATE-CHECK');
    invoice.executionStatus = 'SUCCESSFUL';
  } catch (error: unknown) {
    logger.error(`Error occurred on executeDepositRequest: ${JSON.stringify(error)}`);
    invoice.executionStatus = 'UNSUCCESSFUL';
  }
}
