import type { MerchantInvoice } from '@motforex/global-types';

import { updateMerchantInvoice } from '@/repository/merchant-invoice';
import { executeDepositRequestById } from '@motforex/global-services';
import { logger } from '@motforex/global-libs';

/**
 *  Re-execute deposit request
 *
 * @param invoice - Merchant invoice
 * @returns - Updated merchant invoice
 */
export async function reexecuteDepositRequest(invoice: MerchantInvoice): Promise<MerchantInvoice> {
  try {
    logger.info(`Re-executing deposit request with id: ${invoice.id}`);
    await executeDepositRequestById(invoice.id, 'Qpay invoice is re-executed');

    const updatedInvoice = await updateMerchantInvoice({
      ...invoice,
      executionStatus: 'SUCCESSFUL',
      message: 'Re-execution successful!'
    });
    logger.info(`Successfully re-executed deposit request with id: ${invoice.id}`);

    return updatedInvoice;
  } catch (error: unknown) {
    logger.error(`Failed to re-execute deposit request with id: ${invoice.id}`, error);
    return invoice;
  }
}
