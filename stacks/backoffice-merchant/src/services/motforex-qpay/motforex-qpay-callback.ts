import { handleDefaultError, logger } from '@motforex/global-libs';
import { getValidInvoicePayment } from '../merchant-invoice';
import { checkValidMotforexQpayInvoice } from './motforex-qpay-check';

export async function handleQpayCallback(id: number): Promise<void> {
  try {
    const merchantInvoice = await getValidInvoicePayment(id, 'qpay');

    // Check MerchantInvoice status
    if (merchantInvoice.invoiceStatus !== 'PENDING') {
      logger.info(`Invoice is not in PENDING status!`);
      return;
    }

    // Checking if the invoice is paid
    await checkValidMotforexQpayInvoice(merchantInvoice);
  } catch (error: unknown) {
    handleDefaultError(error);
  }
}
