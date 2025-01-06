import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';

import {
  getPaymentMethodById as getPaymentMethodByIdRepo,
  getPaymentMethodByQuery,
} from '@repository/payment-methods-repository';
import { formatJSONApiResponse } from '@libs/format';
import { handleApiFuncError } from '@libs/error';
import { QueryRequest } from '@repository/dynamo';

const USER_VISIBLE_KEYS =
  'id, type, title, iconUrl, minAmount, maxAmount, commission, formSchema, instructions, isRequireProof, expirationPeriod, isActive, paymentProofInstructions, transactionCurrency, warning';

export async function getUserPaymentMethodById(id: number): Promise<APIResponse> {
  try {
    const paymentMethod = await getPaymentMethodByIdRepo(id, `${USER_VISIBLE_KEYS}`);
    if (!paymentMethod) return formatJSONApiResponse({});
    return formatJSONApiResponse(paymentMethod);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function getUserPaymentMethodsByQuery(queryReq: QueryRequest): Promise<APIResponse> {
  try {
    const { lastEvaluatedKey, items } = await getPaymentMethodByQuery(queryReq, USER_VISIBLE_KEYS);
    const filteredItems = items.filter((item) => item.isActive === true);
    return formatJSONApiResponse({ lastEvaluatedKey, items: filteredItems });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
