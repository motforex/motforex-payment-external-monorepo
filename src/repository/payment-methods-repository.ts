import type { PaymentMethod } from '@type/payment-method.types';
import type { CustomQueryCommandOutput as QueryOutput, QueryRequest } from '@type/dynamo.types';

import { extractExpAttributeNamesFromProjection, getRecordByKey, getTableDescription, queryRecords } from './dynamo';
import { DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';

const PAYMENT_METHOD_TABLE = 'motforex-core-payment-methods';
type QueryResponse = QueryOutput<Partial<PaymentMethod>>;

export async function getPaymentMethodTableDescription(): Promise<DescribeTableCommandOutput> {
  return await getTableDescription(PAYMENT_METHOD_TABLE);
}

export async function getPaymentMethodById(id: number, projectionExp?: string): Promise<PaymentMethod | undefined> {
  const params = {
    tableName: PAYMENT_METHOD_TABLE,
    key: { id },
    projectionExp: projectionExp,
    extraExpAttributeNames: projectionExp ? { ...extractExpAttributeNamesFromProjection(projectionExp) } : undefined,
  };
  return await getRecordByKey<PaymentMethod>(params);
}

export async function getPaymentMethodByQuery(query: QueryRequest, projection?: string): Promise<QueryResponse> {
  return await queryRecords<PaymentMethod>({
    tableName: PAYMENT_METHOD_TABLE,
    queryRequest: query,
    projectionExp: projection,
  });
}
