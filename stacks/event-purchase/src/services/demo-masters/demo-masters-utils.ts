import { getEventPurchaseByQuery } from '@/repository/demo-masters-repository';
import { EventPurchase } from '@motforex/global-types';
import { getDayStartTimestamp } from '../utils/date-utils';
import { CustomError, logger } from '@motforex/global-libs';

export async function getPurchasesByUserIdAndEvent(userId: string, event: string): Promise<EventPurchase[]> {
  try {
    const dayStartTimestamp = getDayStartTimestamp();

    const { items } = await getEventPurchaseByQuery({
      indexName: 'userIdReferenceDateEventName-createdAt-index',
      pKey: `${userId}~${event}~${dayStartTimestamp}`,
      pKeyType: 'S',
      pKeyProp: 'userIdReferenceDateEventName'
    });

    logger.info(`Fetched event purchase for user ${userId} and event ${event}: ${JSON.stringify(items)}`);
    return items;
  } catch (error) {
    logger.error(`Error fetching event purchase for user ${userId} and event ${event}:`, error);
    throw error instanceof Error ? error : new CustomError('Internal server error', 500);
  }
}
