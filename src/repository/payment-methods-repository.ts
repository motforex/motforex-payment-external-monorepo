import type { PaymentMethod } from '@type/payment-method.types';
import type { CustomGetCommandInput, CustomQueryCommandOutput as QueryOutput, QueryRequest } from '@type/dynamo.types';

import { createRecord, getRecordByKey, getTableDescription, queryRecords, updateRecord } from './dynamo';
import { buildDynamoQueryInput, getExpressionAttributeNByProjection } from './dynamo-utils';
import { DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';

const PAYMENT_METHOD_TABLE = 'motforex-core-payment-methods';

export async function getPaymentMethodTableDescription(): Promise<DescribeTableCommandOutput> {
  return await getTableDescription(PAYMENT_METHOD_TABLE);
}

export async function getPaymentMethodById(id: number, keys?: string): Promise<PaymentMethod | undefined> {
  const params: CustomGetCommandInput = {
    tableName: PAYMENT_METHOD_TABLE,
    key: 'id',
    value: id,
  };

  if (keys) {
    params.options = {
      ProjectionExpression: keys,
      ExpressionAttributeNames: getExpressionAttributeNByProjection(keys),
    };
  }

  return await getRecordByKey<PaymentMethod>(params);
}

export async function getPaymentMethodByQuery(queryReq: QueryRequest): Promise<QueryOutput<Partial<PaymentMethod>>> {
  return await queryRecords<PaymentMethod>({ ...buildDynamoQueryInput(queryReq, PAYMENT_METHOD_TABLE) });
}

export async function createPaymentMethod(paymentMethod: PaymentMethod): Promise<PaymentMethod> {
  return await createRecord<PaymentMethod>({ tableName: PAYMENT_METHOD_TABLE, item: paymentMethod });
}

export async function updatePaymentMethod(paymentMethod: PaymentMethod): Promise<PaymentMethod | undefined> {
  return await updateRecord<PaymentMethod>({
    tableName: PAYMENT_METHOD_TABLE,
    key: { id: paymentMethod.id },
    item: {
      title: paymentMethod.title,
      iconUrl: paymentMethod.iconUrl,
      type: paymentMethod.type,
      instructions: paymentMethod.instructions,
      allowedCountries: paymentMethod.allowedCountries,
      minAmount: paymentMethod.minAmount,
      maxAmount: paymentMethod.maxAmount,
      commission: paymentMethod.commission,
      isActive: paymentMethod.isActive,
      isRequireProof: paymentMethod.isRequireProof,
      expirationPeriod: paymentMethod.expirationPeriod,
      paymentProofInstructions: paymentMethod.paymentProofInstructions,
      formSchema: paymentMethod.formSchema,
    },
  });
}
