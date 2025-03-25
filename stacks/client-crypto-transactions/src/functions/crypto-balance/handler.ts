import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';
import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';

import {
  formatApiResponse,
  formatResponse,
  handleApiFuncErrorWithI18n,
  handleDefaultErrorWithI18n,
  middyfy
} from '@motforex/global-libs';

const getCryptoBalanceByApiFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return formatApiResponse({ response: {} });
  } catch (error: unknown) {
    return handleApiFuncErrorWithI18n(error);
  }
};

export const updateCryptoBalancePrivately = async () => {
  try {
    return formatResponse({});
  } catch (error: unknown) {
    return handleDefaultErrorWithI18n(error);
  }
};

export const getCryptoBalanceByApi = middyfy(getCryptoBalanceByApiFunc);
