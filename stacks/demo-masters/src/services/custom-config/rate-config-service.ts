import { getCustomConfigByCode } from '@/repository/custom-config-repository';
import { getCustomConfigTypedValue } from './custom-config-utils';
import { CustomError, logger } from '@motforex/global-libs';
import { RATE_USD_MNT_BUY, RATE_USD_MNT_SELL } from '@/constants';

export async function getUsdMntBuyRate(): Promise<number> {
  const config = await getCustomConfigByCode(RATE_USD_MNT_BUY);

  if (!config) {
    logger.error('USD to MNT buy rate is not configured');
    throw new CustomError('USD to MNT buy rate is not configured', 500);
  }

  return getCustomConfigTypedValue(config) as number;
}

export async function getUsdMntSellRate(): Promise<number> {
  const config = await getCustomConfigByCode(RATE_USD_MNT_SELL);

  if (!config) {
    logger.error('USD to MNT buy rate is not configured');
    throw new CustomError('USD to MNT buy rate is not configured', 500);
  }

  return getCustomConfigTypedValue(config) as number;
}
