import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';
import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';

import {
  checkAuthorization,
  CustomError,
  extractMetadata,
  formatApiResponse,
  handleApiFuncErrorWithI18n,
  logger,
  middyfy
} from '@motforex/global-libs';
import { createCoinbuysInvoiceByDepositId } from '@/service/coinsbuy-deposit/coinsbuy-deposit-service';
import { coinsbuyDepositCallbackService } from '@/service/coinsbuy-deposit/coinsbuy-deposit-callback-service';
import { CoinsbuyDepositSchema } from '@/types/coinsbuy.types';

const createCoinbuysInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`financeMessageErrorBadRequestPathVariable`, 400);

    const { email } = checkAuthorization(extractMetadata(event));
    const id = Number(event.pathParameters.id);

    const result = await createCoinbuysInvoiceByDepositId(id, email);
    return formatApiResponse(result);
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
    logger.info(`Body: ${JSON.stringify(event.body)}`);

    const parsedBody = CoinsbuyDepositSchema.parse(event.body);

    await coinsbuyDepositCallbackService(parsedBody);
    return formatApiResponse({});
  } catch (error: unknown) {
    return handleApiFuncErrorWithI18n(error);
  }
};

export const createCoinbuysInvoice = middyfy(createCoinbuysInvoiceFunc);
export const checkCoinsbuyInvoice = middyfy(checkCoinsbuyInvoiceFunc);
export const callbackCoinbuysInvoice = middyfy(callbackCoinbuysInvoiceFunc);
