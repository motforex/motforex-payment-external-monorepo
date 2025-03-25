import { CryptoBalanceRecord } from '@/types/crypto-balance.types';
import { createRecord, getRecordByKey, updateRecord } from '@motforex/dynamo';
import { omit } from 'lodash';

const CRYPTO_BALANCE_RECORD_TABLE = 'crypto-balance-requests';

export async function getCryptoBalanceRecordByUserId(
  userId: string,
  projection?: string
): Promise<CryptoBalanceRecord | undefined> {
  return await getRecordByKey<CryptoBalanceRecord>({
    tableName: CRYPTO_BALANCE_RECORD_TABLE,
    key: { userId },
    projectionExpression: projection
  });
}

export async function createCryptoBalanceRecord(item: CryptoBalanceRecord): Promise<CryptoBalanceRecord> {
  await createRecord<CryptoBalanceRecord>({
    tableName: CRYPTO_BALANCE_RECORD_TABLE,
    item
  });
  return item;
}

export async function updateCryptoBalanceRecord(
  item: CryptoBalanceRecord,
  condition?: string,
  extra?: Record<string, any>
): Promise<CryptoBalanceRecord> {
  await updateRecord<CryptoBalanceRecord>({
    tableName: CRYPTO_BALANCE_RECORD_TABLE,
    key: { userId: item.userId },
    item: { ...omit(item, 'id') },
    conditionExpression: condition,
    extraExpressionAttributeValues: extra,
    returnValues: 'NONE'
  });
  return item;
}
