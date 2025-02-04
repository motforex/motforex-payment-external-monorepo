import type { PaymentRequest } from '@motforex/global-types';

import { getRecordByKey } from '@motforex/dynamo';

const DEPOSIT_REQUEST_TABLE_NAME = 'motforex-core-deposit-request';

export async function getDepositReqById(id: number, projectionExp?: string): Promise<PaymentRequest | undefined> {
  return await getRecordByKey<PaymentRequest>({
    tableName: DEPOSIT_REQUEST_TABLE_NAME,
    key: { id },
    projectionExpression: projectionExp
  });
}
