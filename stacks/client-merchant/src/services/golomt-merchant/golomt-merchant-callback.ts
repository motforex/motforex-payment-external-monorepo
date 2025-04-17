import { GolomtCallbackBody } from '@/types';
import { handleApiFuncError, logger } from '@motforex/global-libs';

export async function receiveMotfxGolomtMerchNotification(callbackBody: GolomtCallbackBody): Promise<void> {
  const { errorCode, errorDesc, transactionId } = callbackBody;
  logger.info(`Push-notification errorCode:${errorCode} errorDesc:${errorDesc}`);

  try {
  } catch (error: unknown) {
    handleApiFuncError(error);
  }
}
