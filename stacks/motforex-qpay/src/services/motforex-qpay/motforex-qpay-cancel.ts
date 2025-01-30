import { logger } from '@motforex/global-libs';
import { cancelQpayInvoice as cancelQpayInvoiceStatus } from '@motforex/global-services';

export async function cancelQpayInvoice(qpayToken: string, invoice: string): Promise<void> {
  try {
    logger.info(`Cancelling Qpay invoice: ${invoice}`);
    const response = await cancelQpayInvoiceStatus(qpayToken, invoice);
    logger.info(`Qpay invoice cancelled: ${invoice} response: ${JSON.stringify(response)}`);
  } catch (error: unknown) {
    logger.error(`Error occurred on cancelQpayInvoice: ${JSON.stringify(error)}`);
    throw error;
  }
}
