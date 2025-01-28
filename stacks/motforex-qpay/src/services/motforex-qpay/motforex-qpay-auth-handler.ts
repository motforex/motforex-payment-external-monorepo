import { handleDefaultError, logger, updateParameterStoreVal } from '@motforex/global-libs';
import { getQpayAuthToken } from '@motforex/global-services';

const MOTFOREX_QPAY_USERNAME = process.env.MOTFOREX_QPAY_USERNAME;
const MOTFOREX_QPAY_PASSWORD = process.env.MOTFOREX_QPAY_PASSWORD;

const QPAY_TOKEN_PARAMETER = '/motforex/payments/qpay/access-token';

export async function handleMotfxQpayAuthToken(): Promise<void> {
  try {
    logger.info('==========================================================================');
    // Checking required credentials from env
    if (!MOTFOREX_QPAY_USERNAME || !MOTFOREX_QPAY_PASSWORD) {
      logger.error('Unable to fetch MOTFOREX qpay! Because credentials are not configured!');
      return;
    }

    // Fetching the QPAY token
    const tokenRes = await getQpayAuthToken(MOTFOREX_QPAY_USERNAME, MOTFOREX_QPAY_PASSWORD);
    logger.info(`QPAY token response: ${JSON.stringify(tokenRes)}`);

    // Updating the QPAY token in the parameter store
    await updateParameterStoreVal(QPAY_TOKEN_PARAMETER, tokenRes.access_token);
    logger.info('Successfully updated the QPAY token in the parameter store!');
  } catch (error: unknown) {
    handleDefaultError(error);
  } finally {
    logger.info('==========================================================================');
  }
}
