import { logger, updateParameterStoreVal } from '@motforex/global-libs';
import { getQpayAuthToken } from '@motforex/global-services';

export async function saveQpayTokenToParameterStore(qpayUse: string, qpayPwd: string, parKey: string): Promise<void> {
  // Fetching the QPAY token
  const tokenRes = await getQpayAuthToken(qpayUse, qpayPwd);
  logger.info(`QPAY token response: ${JSON.stringify(tokenRes)}`);

  // Updating the QPAY token in the parameter store
  await updateParameterStoreVal(parKey, tokenRes.access_token);
  logger.info('QPAY token has been saved to the parameter store');
}
