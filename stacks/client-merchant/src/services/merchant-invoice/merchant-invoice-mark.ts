import { STATUS_EXECUTED, STATUS_FAILED, type MerchantInvoice } from '@motforex/global-types';

import { executeDepositRequestById, markDepositRequestAsExpired } from '@motforex/global-services';
import { updateMerchantInvoice } from '@/repository/merchant-invoice';
import { logger } from '@motforex/global-libs';

export async function markPaymentInvoiceAsSuccessful(invoice: MerchantInvoice): Promise<MerchantInvoice> {
  try {
    logger.info(`Marking payment invoice as paid: ${invoice.id}`);
    const updatedInvoice: MerchantInvoice = { ...invoice, invoiceStatus: STATUS_EXECUTED };
    await executeDepositRequest(updatedInvoice);
    return await updateMerchantInvoice(updatedInvoice);
  } catch (error: unknown) {
    logger.error(`Error marking payment invoice as paid: ${invoice.id}`);
    throw error;
  }
}

export async function markPaymentInvoiceAsExpired(invoice: MerchantInvoice): Promise<MerchantInvoice> {
  try {
    logger.info(`Expiring merchant invoice: ${invoice.id}`);
    await markDepositRequestAsExpired(invoice.id, 'Qpay invoice is expired');
    return await updateMerchantInvoice({ ...invoice, invoiceStatus: 'EXPIRED', executionStatus: 'EXPIRED' });
  } catch (error: unknown) {
    logger.error(`Error expiring merchant invoice: ${invoice.id}`);
    throw error;
  }
}

export async function markPaymentInvoiceAsUnsuccessful(invoice: MerchantInvoice): Promise<MerchantInvoice> {
  try {
    logger.info(`Expiring merchant invoice: ${invoice.id}`);
    return await updateMerchantInvoice({ ...invoice, invoiceStatus: STATUS_FAILED, executionStatus: STATUS_FAILED });
  } catch (error: unknown) {
    logger.error(`Error expiring merchant invoice: ${invoice.id}`);
    throw error;
  }
}

// --------------------------------------------------------------------------------------------
async function executeDepositRequest(invoice: MerchantInvoice): Promise<void> {
  try {
    await executeDepositRequestById(invoice.id, 'Qpay invoice is paid by CREATE-CHECK');
    invoice.executionStatus = STATUS_EXECUTED;
  } catch (error: unknown) {
    logger.error(`Error occurred on executeDepositRequest: ${JSON.stringify(error)}`);
    invoice.executionStatus = STATUS_FAILED;
  }
}
