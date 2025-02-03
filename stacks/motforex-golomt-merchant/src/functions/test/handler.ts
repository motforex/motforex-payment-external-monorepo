import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { formatApiResponse, handleApiFuncError, middyfy } from '@motforex/global-libs';

const postTestFunctionFunc: ApiFuncType<null> = async (): Promise<ApiFuncRes> => {
  try {
    return formatApiResponse({ message: 'Test function is working!' });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const postTestFunction = middyfy(postTestFunctionFunc);
