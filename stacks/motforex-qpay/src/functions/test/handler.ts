import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { formatApiResponse, handleApiFuncError, middyfy } from '@motforex/global-libs';
import { handleMotfxQpayAuthToken } from '@/services/motforex-qpay';

const postTestFunctionFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    await handleMotfxQpayAuthToken();
    return formatApiResponse({ message: 'Test function is working!' });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const postTestFunction = middyfy(postTestFunctionFunc);
