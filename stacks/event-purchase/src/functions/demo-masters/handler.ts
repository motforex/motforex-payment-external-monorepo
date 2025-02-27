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
    const { status, metadata } = await createDemoMastersPurchase(userId);
    return formatApiResponse({ status, metadata });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postCheckDemoMastersInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Bad request!`, 400);
    const { sub: userId } = checkAuthorization(extractMetadata(event), 'demo-masters-create-invoice');
    logger.info(`User:${userId} checking the invoice:${event.pathParameters.id}`);

    const { status } = await checkDemoMastersInvoice(event.pathParameters.id);
    return formatApiResponse({ status });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getHandleDemoMastersQpayCallbackFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  if (!event.pathParameters || !event.pathParameters.id) return formatApiResponse({});
  await handleDemoMastersQpayCallback(event.pathParameters.id);
  return formatApiResponse({});
};

export const getDemoMastersInvoice = middyfy(getDemoMastersInvoiceFunc);
export const postCreateDemoMastersInvoice = middyfy(postCreateDemoMastersInvoiceFunc);
export const postCheckDemoMastersInvoice = middyfy(postCheckDemoMastersInvoiceFunc);
export const getHandleDemoMastersQpayCallback = middyfy(getHandleDemoMastersQpayCallbackFunc);
