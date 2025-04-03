import { updateMerchantInvoice } from '@/repository/merchant-invoice';
import { MerchantInvoice, STATUS_EXPIRED, STATUS_PENDING } from '@motforex/global-types';

export async function markMerchantInvoiceAsFailed(
  merchantInvoice: MerchantInvoice,
  message?: string
): Promise<MerchantInvoice> {
  return await updateMerchantInvoice(
    {
      ...merchantInvoice,
      invoiceStatus: STATUS_EXPIRED,
      executionStatus: STATUS_EXPIRED,
      message: message || 'Invoice is expired'
    },
    `invoiceStatus = :pending`,
    { ':pending': STATUS_PENDING }
  );
}
