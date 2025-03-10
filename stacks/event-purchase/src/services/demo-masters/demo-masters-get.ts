import { getEventPurchaseByQuery } from '@/repository/demo-masters-repository';

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
