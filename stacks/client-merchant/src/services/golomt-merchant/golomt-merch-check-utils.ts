import { logger } from '@motforex/global-libs';
import { checkGolomtMerchInvoice } from '@motforex/global-services';

const ERROR_CODE_SUCCESS = '000';

export async function isPaidOnGolomtMerch(key: string, tkn: string, transactionId: string): Promise<boolean> {
  try {
    logger.info(`Checking invoice from Golomt Merchant with transactionId: ${transactionId}`);
    const { amount, status, errorDesc, errorCode, cardNumber } = await checkGolomtMerchInvoice(key, tkn, transactionId);

    logger.info(`Golomt Merchant invoice check: ${JSON.stringify({ errorDesc, errorCode })}`);
    logger.info(`Golomt Merchant invoice check: amount:${amount} status:${status} cardNumber:${cardNumber}`);

    return errorCode === ERROR_CODE_SUCCESS;
  } catch (error: unknown) {
    logger.error(`Error occurred on checkInvoiceFromGolomtMerchant: ${JSON.stringify(error)}`);
    throw error;
  }
}
