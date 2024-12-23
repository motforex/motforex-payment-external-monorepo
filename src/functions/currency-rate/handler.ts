import type { CustomAPIGatewayEvent as ApiFunc } from '@libs/api-gateway';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { handleApiFuncError } from '@libs/error';
import { formatJSONApiResponse } from '@libs/format';
import { middyfy } from '@libs/middyfy';
import { getUsdToMntRates as getUsdToMntRatesSrv } from '@services/currency-rate';
import { extractMetadata } from '@services/utils/cognito-auth-service';

const getUsdToMntRatesFunc: ApiFunc<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return formatJSONApiResponse(await getUsdToMntRatesSrv(extractMetadata(event)));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const getUsdToMntRates = middyfy(getUsdToMntRatesFunc);
