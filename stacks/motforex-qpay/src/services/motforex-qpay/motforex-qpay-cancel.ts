import { logger } from '@motforex/global-libs';
import { cancelQpayInvoice as cancelQpayInvoiceStatus } from '@motforex/global-services';

export async function cancelQpayInvoice(qpayToken: string, invoiceId: string): Promise<void> {
  try {
    logger.info(`Cancelling Qpay invoice: ${invoiceId}`);
    const response = await cancelQpayInvoiceStatus(qpayToken, invoiceId);
    logger.info(`Qpay invoice cancelled: ${invoiceId} response: ${JSON.stringify(response)}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error occurred on cancelQpayInvoice: ${error.message}`);
    }
    logger.error(`Error occurred on cancelQpayInvoice: ${JSON.stringify(error)}`);
  }
}
