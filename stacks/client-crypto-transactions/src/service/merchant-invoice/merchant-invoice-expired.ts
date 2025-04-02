import { updateMerchantInvoice } from '@/repository/merchant-invoice';
import { MerchantInvoice, STATUS_EXPIRED, STATUS_PENDING } from '@motforex/global-types';

export async function markMerchantInvoiceAsFailed(merchantInvoice: MerchantInvoice): Promise<MerchantInvoice> {
  return await updateMerchantInvoice(
    {
      ...merchantInvoice,
      invoiceStatus: STATUS_EXPIRED,
      executionStatus: STATUS_EXPIRED
    },
    `#status = :pending`,
    { ':pending': STATUS_PENDING }
  );
}
