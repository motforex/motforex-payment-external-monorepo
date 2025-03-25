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

const checkCoinsbuyInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return formatApiResponse({ response: await getCoinbuysAuthToken() });
  } catch (error: unknown) {
    return handleApiFuncErrorWithI18n(error);
  }
};

const callbackCoinbuysInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return formatApiResponse({ response: await getCoinbuysAuthToken() });
  } catch (error: unknown) {
    return handleApiFuncErrorWithI18n(error);
  }
};

export const createCoinbuysInvoice = middyfy(createCoinbuysInvoiceFunc);
export const checkCoinsbuyInvoice = middyfy(checkCoinsbuyInvoiceFunc);
export const callbackCoinbuysInvoice = middyfy(callbackCoinbuysInvoiceFunc);
