import { GolomtCallbackBody } from '@/types';
import { CustomError, handleApiFuncError, logger } from '@motforex/global-libs';
import { getMerchantInvoiceByProviderId, markPaymentInvoiceAsSuccessful } from '../merchant-invoice';
import { GOLOMT_MERCHANT_SECRET, GOLOMT_MERCHANT_TOKEN } from './golomt-merch-configs';
import { isPaidOnGolomtMerch } from './golomt-merch-check-utils';

export async function receiveMotfxGolomtMerchNotification(callbackBody: GolomtCallbackBody): Promise<void> {
  const { errorCode, errorDesc, transactionId, amount } = callbackBody;
  logger.info(`Push-notification errorCode:${errorCode} errorDesc:${errorDesc}`);

  try {
    const merchantInvoice = await getMerchantInvoiceByProviderId(transactionId, Number(amount));

    if (merchantInvoice.invoiceStatus !== 'PENDING') {
      logger.info(`Golomt-Merchant-Invoice is not in PENDING status:${transactionId}`);
      return;
    }

    if (!GOLOMT_MERCHANT_SECRET || !GOLOMT_MERCHANT_TOKEN) {
      logger.error('Golomt-Merchant secret or token is not found!');
      throw new CustomError('Unable to process Golomt-Merchant-Invoice', 500);
    }

    // Check if the invoice is paid
    if (await isPaidOnGolomtMerch(GOLOMT_MERCHANT_SECRET, GOLOMT_MERCHANT_TOKEN, merchantInvoice.providerId)) {
      logger.info(`Golomt-Merchant invoice is paid: ${merchantInvoice.providerId}`);
      await markPaymentInvoiceAsSuccessful(merchantInvoice);
      return;
    }

    logger.info(`Golomt-Merchant invoice is not paid: ${merchantInvoice.providerId}`);
  } catch (error: unknown) {
    handleApiFuncError(error);
  }
}
