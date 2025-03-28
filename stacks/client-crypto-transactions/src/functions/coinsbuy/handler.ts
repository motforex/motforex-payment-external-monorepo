import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';
import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';

import { CustomError, formatApiResponse, handleApiFuncErrorWithI18n, logger, middyfy } from '@motforex/global-libs';
import { createCoinbuysInvoiceByDepositId } from '@/service/deposit-request-service';

const createCoinbuysInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`financeMessageErrorBadRequestPathVariable`, 400);
    return formatApiResponse({ response: await createCoinbuysInvoiceByDepositId(Number(event.pathParameters.id)) });
  } catch (error: unknown) {
    return handleApiFuncErrorWithI18n(error);
  }
};

const checkCoinsbuyInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`financeMessageErrorBadRequestPathVariable`, 400);
    return formatApiResponse({});
  } catch (error: unknown) {
    return handleApiFuncErrorWithI18n(error);
  }
};

const callbackCoinbuysInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    logger.info(`Path variable: ${event.pathParameters?.id}`);
    logger.info(`Query string: ${event.queryStringParameters}`);
    logger.info(`Body: ${event.body}`);
    return formatApiResponse(event.body || {});
  } catch (error: unknown) {
    return handleApiFuncErrorWithI18n(error);
  }
};

export const createCoinbuysInvoice = middyfy(createCoinbuysInvoiceFunc);
export const checkCoinsbuyInvoice = middyfy(checkCoinsbuyInvoiceFunc);
export const callbackCoinbuysInvoice = middyfy(callbackCoinbuysInvoiceFunc);
