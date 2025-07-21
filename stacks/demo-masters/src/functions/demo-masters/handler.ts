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
import {
  checkDemoMastersInvoice,
  createDemoMastersPurchase,
  getDemoMastersPriceDetail,
  getEventPurchasesByIdAndEventName,
  getEventPurchasesByQuery,
  handleDemoMastersQpayCallback
} from '@/services/demo-masters';
import { getUsdMntBuyRate } from '@/services/custom-config';
import { extractQueryParamsFromEvent } from '@motforex/dynamo';
import { STATUS_PENDING } from '@motforex/global-types';
import { DemoMastersPriceDetail } from '@/types';

const getDemoMastersRateFunc: ApiFuncType<{ rate: number }> = async () => {
  try {
    return formatApiResponse({ rate: await getUsdMntBuyRate() });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getDemoMastersPriceFunc: ApiFuncType<DemoMastersPriceDetail> = async () => {
  try {
    const response = await getDemoMastersPriceDetail();
    return formatApiResponse(response);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getDemoMastersPurchaseByQueryFunc: ApiFuncType<null> = async (event) => {
  try {
    const { queryParams } = extractMetadata(event);
    const result = await getEventPurchasesByQuery(
      extractQueryParamsFromEvent(event, {
        indexName: 'status-createdAt-index',
        pKey: STATUS_PENDING,
        pKeyType: 'S',
        pKeyProp: 'status',
        ...queryParams
      })
    );
    return formatApiResponse(result);
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
    const { sub: userId, email } = checkAuthorization(extractMetadata(event), 'demo-masters-create-invoice');
    const { id, amountInTransactionCurrency, amountInUsd, status, metadata } = await createDemoMastersPurchase(
      userId,
      email
    );
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

const postCheckAdminDemoMasterInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Bad request!`, 400);
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
export const getDemoMastersPrice = middyfy(getDemoMastersPriceFunc);
export const getDemoMastersInvoice = middyfy(getDemoMastersInvoiceFunc);
export const getDemoMastersPurchaseByQuery = middyfy(getDemoMastersPurchaseByQueryFunc);
export const postCreateDemoMastersInvoice = middyfy(postCreateDemoMastersInvoiceFunc);
export const postCheckDemoMastersInvoice = middyfy(postCheckDemoMastersInvoiceFunc);
export const postAdminCheckDemoMastersInvoice = middyfy(postCheckAdminDemoMasterInvoiceFunc);
export const getHandleDemoMastersQpayCallback = middyfy(getHandleDemoMastersQpayCallbackFunc);
