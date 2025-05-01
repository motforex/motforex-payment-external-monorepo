import { handleDefaultError, logger } from '@motforex/global-libs';
import { checkMotforexQpayInvoice } from './motforex-qpay-check';
import { getMerchantInvoiceById } from '@/repository/merchant-invoice';
import { STATUS_PENDING } from '@motforex/global-types';

/**
 *  Handle Motforex Qpay callback
 *
 *
 * @param id
 * @returns
 */
export async function handleCallbackMotforexInvoice(id: number): Promise<void> {
  try {
    const merchantInvoice = await getMerchantInvoiceById(id);

    if (!merchantInvoice) {
      logger.error(`Deposit request or invoice does not exist!`);
      return;
    }

    if (merchantInvoice.invoiceStatus !== STATUS_PENDING) {
      logger.info(`Invoice:${id} is not in PENDING status!`);
      return;
    }

    await checkMotforexQpayInvoice(merchantInvoice);
  } catch (error: unknown) {
    handleDefaultError(error);
  }
}
