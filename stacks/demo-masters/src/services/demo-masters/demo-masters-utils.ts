import { getEventPurchaseById, getEventPurchaseByQuery } from '@/repository/demo-masters-repository';
import { EventPurchase } from '@motforex/global-types';
import { getDayStartTimestamp } from '../utils/date-utils';
import { CustomError, getParameterStoreVal, logger } from '@motforex/global-libs';
import { MOTFOREX_DEMO_MASTERS_PRICE_PS_KEY } from '@/constants';

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

export async function getDemoMastersPrice(): Promise<number> {
  const value = await getParameterStoreVal(MOTFOREX_DEMO_MASTERS_PRICE_PS_KEY);
  if (!value) {
    logger.error('Demo masters price not found in parameter store');
    throw new CustomError('Unable to create demo masters purchase', 500);
  }
  const parsedValue = parseFloat(value);
  if (isNaN(parsedValue) || parsedValue <= 0) {
    logger.error('Demo masters price is not a valid number');
    throw new CustomError('Invalid demo masters price', 500);
  }

  return parsedValue;
}
