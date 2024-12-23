import CustomError from '@configs/custom-error';
import { CONFIG_USD_MNT_BUY, CONFIG_USD_MNT_SELL } from '@constants/configuration.constants';
import { getParameterStoreVal } from '@services/utils';
import { RequestMetadata } from '@type/util.types';

export async function getUsdToMntRates(metadata: RequestMetadata): Promise<{ buyRate: number; sellRate: number }> {
  const { queryParams } = metadata;
  if (!queryParams || !queryParams.currency) throw new CustomError('Query params are missing!');

  let buyKey, sellKey;

  switch (queryParams.currency.toUpperCase()) {
    case 'USD-MNT':
      buyKey = CONFIG_USD_MNT_BUY;
      sellKey = CONFIG_USD_MNT_SELL;
      break;
    default:
      throw new CustomError('Invalid query params!');
  }

  const [buyRate, sellRate] = await Promise.all([getParameterStoreVal(buyKey), getParameterStoreVal(sellKey)]);
  if (!buyRate || !sellRate) throw new CustomError('Unable to retrieve USD config rates!');
  return { buyRate: Number(buyRate), sellRate: Number(sellRate) };
}
