import { handleApiFuncError, logger } from '@motforex/global-libs';
import { PaymentInvoice } from '@motforex/global-types';

export async function handleMotforexQpayCallback(providerId: string): Promise<void> {
  try {
    logger.info(`Handling Motforex Qpay callback: ${providerId}`);

    // await
    logger.info(`Qpay callback handled successfully: ${providerId}`);
  } catch (error: unknown) {
    handleApiFuncError(error);
  }
}

export async function executeDepositRequestByInvoice(invoice: PaymentInvoice): Promise<void> {
  try {
    logger.info(`Executing deposit request by invoice: ${invoice.id}`);

    logger.info(`Deposit request executed successfully: ${invoice.id}`);
  } catch (error: unknown) {
    logger.error(`Error occurred on executeDepositRequestByInvoice: ${JSON.stringify(error)}`);
  }
}
