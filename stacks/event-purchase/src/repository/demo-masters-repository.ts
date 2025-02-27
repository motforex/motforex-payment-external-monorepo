import type { QueryRequest } from '@motforex/dynamo';
import type { EventPurchase } from '@motforex/global-types';

import { createRecord, getRecordByKey, queryRecords, updateRecord } from '@motforex/dynamo';
import { omit } from 'lodash';

const DEMO_MASTERS_TABLE_NAME = 'motforex-events-purchase';

export async function getEventPurchaseById(id: string, projection?: string): Promise<EventPurchase | undefined> {
  return await getRecordByKey<EventPurchase>({
    tableName: DEMO_MASTERS_TABLE_NAME,
    key: { id },
    projectionExpression: projection
  });
}

export async function getEventPurchaseByQuery(
  queryRequest: QueryRequest,
  projection?: string,
  scanIdxForward?: boolean
) {
  return await queryRecords<EventPurchase>({
    tableName: DEMO_MASTERS_TABLE_NAME,
    queryRequest: queryRequest,
    projectionExpression: projection,
    scanIdxForward: scanIdxForward || false
  });
}

export async function createEventPurchase(eventPurchase: EventPurchase): Promise<EventPurchase> {
  return await createRecord<EventPurchase>({
    tableName: DEMO_MASTERS_TABLE_NAME,
    item: eventPurchase
  });
}

export async function updateEventPurchase(
  eventPurchase: EventPurchase,
  condition?: string,
  extra?: Record<string, any>
): Promise<EventPurchase> {
  await updateRecord<EventPurchase>({
    tableName: DEMO_MASTERS_TABLE_NAME,
    key: { id: eventPurchase.id },
    item: { ...omit(eventPurchase, 'id') },
    conditionExpression: condition,
    extraExpressionAttributeValues: extra,
    returnValues: 'NONE'
  });
  return eventPurchase;
}
