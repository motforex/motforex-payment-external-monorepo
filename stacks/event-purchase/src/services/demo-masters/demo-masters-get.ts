import { getEventPurchaseByQuery } from '@/repository/demo-masters-repository';
import { QueryRequest } from '@motforex/dynamo';

export async function getEventPurchasesByQuery(queryRequest: QueryRequest) {
  return await getEventPurchaseByQuery(queryRequest);
}

export async function getEventPurchasesByIdAndEventName(userId: string) {
  const key = `${userId}~${`demo-masters`}`;
  console.log(key);
  return await getEventPurchaseByQuery(
    {
      indexName: 'userIdEventName-createdAt-index',
      pKey: key,
      pKeyType: 'S',
      pKeyProp: 'userIdEventName'
    },
    'id, invoice, postDate, status, amountInUsd, amountInTransactionCurrency'
  );
}
