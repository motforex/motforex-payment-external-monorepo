import { handleDefaultError, logger } from '@motforex/global-libs';
import { saveQpayTokenToParameterStore } from '../qpay';
import {
  MOTFOREX_QPAY_PASSWORD,
  MOTFOREX_QPAY_TOKEN_PARAMETER,
  MOTFOREX_QPAY_USERNAME
} from './motforex-qpay-constants';

export async function handleMotfxQpayAuthToken(): Promise<void> {
  try {
    logger.info('==========================================================================');
    // Checking required credentials from env
    if (!MOTFOREX_QPAY_USERNAME || !MOTFOREX_QPAY_PASSWORD || !MOTFOREX_QPAY_TOKEN_PARAMETER) {
      logger.error('Unable to fetch MOTFOREX qpay! Because credentials are not configured!');
      return;
    }

    // Saving Qpay token to parameter store
    await saveQpayTokenToParameterStore(MOTFOREX_QPAY_USERNAME, MOTFOREX_QPAY_PASSWORD, MOTFOREX_QPAY_TOKEN_PARAMETER);
  } catch (error: unknown) {
    handleDefaultError(error);
  } finally {
    logger.info('==========================================================================');
  }
}
