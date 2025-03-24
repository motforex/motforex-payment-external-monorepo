import type { PaymentRequest } from '@motforex/global-types';
import type { CustomQueryCommandOutput } from '@motforex/dynamo';

import { getRecordByKey, queryRecords, QueryRequest, updateRecord } from '@motforex/dynamo';
import { omit } from 'lodash';

const DEPOSIT_REQUEST_TABLE = 'motforex-core-deposit-request';
type QueryResponse = CustomQueryCommandOutput<Partial<PaymentRequest>>;

export async function getDepositReqById(id: number, projectionExp?: string): Promise<PaymentRequest | undefined> {
  return await getRecordByKey<PaymentRequest>({
    tableName: DEPOSIT_REQUEST_TABLE,
    key: { id },
    projectionExpression: projectionExp
  });
}

export async function getDepositRequestByQuery(
  queryRequest: QueryRequest,
  projection?: string
): Promise<QueryResponse> {
  return await queryRecords<PaymentRequest>({
    tableName: DEPOSIT_REQUEST_TABLE,
    queryRequest,
    projectionExpression: projection
  });
}

export async function updateDepositRequest(
  item: PaymentRequest,
  condition?: string,
  extra?: Record<string, any>
): Promise<PaymentRequest> {
  await updateRecord<PaymentRequest>({
    tableName: DEPOSIT_REQUEST_TABLE,
    key: { id: item.id },
    item: { ...omit(item, 'id') },
    conditionExpression: condition,
    extraExpressionAttributeValues: extra,
    returnValues: 'NONE'
  });
  return item;
}
