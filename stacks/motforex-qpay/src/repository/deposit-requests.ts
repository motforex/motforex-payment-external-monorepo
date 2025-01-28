import { getRecordByKey } from '@motforex/dynamo';

const DEPOSIT_REQUEST_TABLE_NAME = 'motforex-core-deposit-request';

export async function getDepositReqById(id: number, projectionExp?: string): Promise<object | undefined> {
  return await getRecordByKey<object>({
    tableName: DEPOSIT_REQUEST_TABLE_NAME,
    key: { id },
    projectionExpression: projectionExp
  });
}
