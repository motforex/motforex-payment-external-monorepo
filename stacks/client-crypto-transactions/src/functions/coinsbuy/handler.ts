import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';
import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';

import { formatApiResponse, handleApiFuncErrorWithI18n, middyfy } from '@motforex/global-libs';
import { getCoinbuysAuthToken } from '@/service/coinbuys/coinbuys-auth-service';

const createCoinbuysInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return formatApiResponse({ response: await getCoinbuysAuthToken() });
  } catch (error: unknown) {
    return handleApiFuncErrorWithI18n(error);
  }
};

export const createCoinbuysInvoice = middyfy(createCoinbuysInvoiceFunc);
