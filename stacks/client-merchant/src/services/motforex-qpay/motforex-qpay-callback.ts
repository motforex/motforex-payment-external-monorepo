import { getPaymentInvoiceById } from '@/repository/invoice-record';
import { handleApiFuncError, logger } from '@motforex/global-libs';
import { markPaymentInvoiceAsSuccessful } from '../payment-invoice';

export async function handleMotforexQpayCallback(id: number): Promise<void> {
  try {
    logger.info(`Handling Motforex Qpay callback: ${id}`);

    // Finding payment invoice by id
    const invoice = await getPaymentInvoiceById(id);
    if (!invoice || invoice.invoiceStatus !== 'PENDING') {
      logger.error(`Payment invoice is unavailable: ${id}`);
      return;
    }

    // Marking payment invoice as successful
    await markPaymentInvoiceAsSuccessful(invoice);
    logger.info(`Qpay callback handled successfully: ${id}`);
  } catch (error: unknown) {
    handleApiFuncError(error);
  }
}
