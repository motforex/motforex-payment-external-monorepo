import CustomError from '@configs/custom-error';
import { CONFIG_USD_MNT_BUY, CONFIG_USD_MNT_SELL } from '@constants/configuration.constants';
import { getParameterStoreVal } from '@services/utils';

export async function getUsdToMntRates(): Promise<{ buyRate: number; sellRate: number }> {
  const [buyRate, sellRate] = await Promise.all([
    getParameterStoreVal(CONFIG_USD_MNT_BUY),
    getParameterStoreVal(CONFIG_USD_MNT_SELL),
  ]);
  if (!buyRate || !sellRate) throw new CustomError('Unable to retrieve USD config rates!');
  return { buyRate: Number(buyRate), sellRate: Number(sellRate) };
}
