import { getEventPurchaseById, getEventPurchaseByQuery } from '@/repository/demo-masters-repository';
import { EventPurchase } from '@motforex/global-types';
import { getDayStartTimestamp } from '../utils/date-utils';
import { CustomError, getParameterStoreVal, logger } from '@motforex/global-libs';
import { MOTFOREX_DEMO_MASTERS_ACTUAL_PRICE_PS_KEY, MOTFOREX_DEMO_MASTERS_PRICE_PS_KEY } from '@/constants';
import { DemoMastersPriceDetail, DemoMastersPriceDetailSchema } from '@/types';

export async function getValidatedEventPurchaseById(id: string): Promise<EventPurchase> {
  const result = await getEventPurchaseById(id);

  if (!result) {
    logger.error('Event purchase not found');
    throw new CustomError('Bad request! Event purchase not found!', 400);
  }

  return result;
}

export async function getPurchasesByUserIdAndEvent(userId: string, event: string): Promise<EventPurchase[]> {
  try {
    const dayStartTimestamp = getDayStartTimestamp();

    const { items } = await getEventPurchaseByQuery({
      indexName: 'userIdReferenceDateEventName-createdAt-index',
      pKey: `${userId}~${dayStartTimestamp}~${event}`,
      pKeyType: 'S',
      pKeyProp: 'userIdReferenceDateEventName'
    });

    return items;
  } catch (error) {
    logger.error(`Error fetching event purchase for user ${userId} and event ${event}:`, error);
    throw error instanceof Error ? error : new CustomError('Internal server error', 500);
  }
}

export async function getParameterStoreNumberValue(key: string): Promise<number> {
  const value = await getParameterStoreVal(key);
  if (!value) {
    logger.error(`Parameter store value for key ${key} not found`);
    throw new CustomError(`Parameter store value for key ${key} not found`, 500);
  }
  const parsedValue = parseFloat(value);
  if (isNaN(parsedValue) || parsedValue <= 0) {
    logger.error(`Parameter store value for key ${key} is not a valid number`);
    throw new CustomError(`Invalid parameter store value for key ${key}`, 500);
  }
  return parsedValue;
}

export async function getDemoMastersPrice(): Promise<number> {
  return getParameterStoreNumberValue(MOTFOREX_DEMO_MASTERS_PRICE_PS_KEY);
}

export async function getDemoMastersPriceDetail(): Promise<DemoMastersPriceDetail> {
  const [currentPriceInUsd, actualPriceInUsd] = await Promise.all([
    getParameterStoreNumberValue(MOTFOREX_DEMO_MASTERS_PRICE_PS_KEY),
    getParameterStoreNumberValue(MOTFOREX_DEMO_MASTERS_ACTUAL_PRICE_PS_KEY)
  ]);
  return DemoMastersPriceDetailSchema.parse({ currentPriceInUsd, actualPriceInUsd });
}
