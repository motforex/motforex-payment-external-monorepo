import type { CustomAPIGatewayEvent as ApiFuncType } from '@libs/api-gateway';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import {
  getUserPaymentMethodsByQuery,
  getUserPaymentMethodById as getUserPaymentMthdById,
} from '@services/payment-methods';
import { extractMetadata } from '@services/utils/cognito-auth-service';
import { CustomError } from '@configs/index';
import { handleApiFuncError } from '@libs/error';
import { middyfy } from '@libs/middyfy';

const getUserPaymentMethodByIdFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Path variable is missing`);
    const { id } = event.pathParameters;
    return await getUserPaymentMthdById(Number(id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getUserPaymentMethodsByTypeFunc: ApiFuncType<object> = async (event): Promise<ApiFuncRes> => {
  try {
    const { queryParams } = extractMetadata(event);
    if (!queryParams || !queryParams.type) throw new CustomError('Query params are missing ');
    const result = await getUserPaymentMethodsByQuery({
      indexName: 'type-createdAt-index',
      pKey: queryParams.type.toUpperCase(),
      pKeyProp: 'type',
      pKeyType: 'S',
    });
    return result;
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const getUserPaymentMethodById = middyfy(getUserPaymentMethodByIdFunc);
export const getUserPaymentMethodsByType = middyfy(getUserPaymentMethodsByTypeFunc);
