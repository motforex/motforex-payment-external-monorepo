import { logger } from '@motforex/global-libs';
import { getValidDepositById } from './deposit-utils-service';
import { STATUS_PENDING } from '@motforex/global-types';

export async function createCryptoDeposit(id: number): Promise<object> {
  try {
    const depositRequest = await getValidDepositById(id, [STATUS_PENDING]);

    return {};
  } catch (error: unknown) {
    logger.info(`Error occurred on createCryptoDeposit: ${error}`);
    throw error;
  }
}
