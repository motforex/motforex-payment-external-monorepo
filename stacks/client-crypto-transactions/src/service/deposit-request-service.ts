import { logger } from '@motforex/global-libs';
import { getValidDepositById } from './deposit-utils-service';
import { STATUS_PENDING } from '@motforex/global-types';
import { createCoinbuysInvoice } from './coinbuys';

export async function createCoinbuysInvoiceByDepositId(id: number): Promise<object> {
  try {
    const depositRequest = await getValidDepositById(id, [STATUS_PENDING]);
    return await createCoinbuysInvoice(depositRequest);
  } catch (error: unknown) {
    logger.info(`Error occurred on createCryptoDeposit: ${error}`);
    throw error;
  }
}
