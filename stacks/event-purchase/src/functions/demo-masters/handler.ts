import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import {
  checkAuthorization,
  CustomError,
  extractMetadata,
  formatApiResponse,
  handleApiFuncError,
  logger,
  middyfy
} from '@motforex/global-libs';
import { createDemoMastersPurchase } from '@/services/demo-masters';
import { checkDemoMastersInvoice } from '@/services/demo-masters/demo-masters-check';
import { getEventPurchasesByIdAndEventName } from '@/services/demo-masters/demo-masters-get';
import { handleDemoMastersQpayCallback } from '@/services/demo-masters/demo-masters-callback';
import { getUsdMntSellRate } from '@/services/custom-config/rate-config-service';

const getDemoMastersRateFunc: ApiFuncType<null> = async (event) => {
  try {
    const { sub: userId } = checkAuthorization(extractMetadata(event), 'demo-masters-create-invoice');
    return formatApiResponse({ rate: await getUsdMntSellRate() });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getDemoMastersInvoiceFunc: ApiFuncType<null> = async (event) => {
  try {
    const { sub: userId } = checkAuthorization(extractMetadata(event), 'demo-masters-create-invoice');
    return formatApiResponse(await getEventPurchasesByIdAndEventName(userId));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postCreateDemoMastersInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const { sub: userId } = checkAuthorization(extractMetadata(event), 'demo-masters-create-invoice');
    const { id, amountInTransactionCurrency, amountInUsd, status, metadata } = await createDemoMastersPurchase(userId);
    return formatApiResponse({ id, amountInTransactionCurrency, amountInUsd, status, metadata });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postCheckDemoMastersInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Bad request!`, 400);
    const { sub: userId } = checkAuthorization(extractMetadata(event), 'demo-masters-create-invoice');
    logger.info(`User:${userId} checking the invoice:${event.pathParameters.id}`);

    const { id, amountInTransactionCurrency, amountInUsd, status } = await checkDemoMastersInvoice(
      event.pathParameters.id
    );
    return formatApiResponse({ id, amountInTransactionCurrency, amountInUsd, status });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getHandleDemoMastersQpayCallbackFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  if (!event.pathParameters || !event.pathParameters.id) return formatApiResponse({});
  await handleDemoMastersQpayCallback(event.pathParameters.id);
  return formatApiResponse({});
};

export const getDemoMastersRate = middyfy(getDemoMastersRateFunc);
export const getDemoMastersInvoice = middyfy(getDemoMastersInvoiceFunc);
export const postCreateDemoMastersInvoice = middyfy(postCreateDemoMastersInvoiceFunc);
export const postCheckDemoMastersInvoice = middyfy(postCheckDemoMastersInvoiceFunc);
export const getHandleDemoMastersQpayCallback = middyfy(getHandleDemoMastersQpayCallbackFunc);
