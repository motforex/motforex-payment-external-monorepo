import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { CustomError, extractMetadata, formatApiResponse, handleApiFuncError, middyfy } from '@motforex/global-libs';
import { checkMotforexQpayInvoice, handleMotfxQpayAuthToken } from '@/services/motforex-qpay';

export const handleQpayToken = async (): Promise<void> => {
  await handleMotfxQpayAuthToken();
};

const postCheckQpayInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Bad request!`, 400);
    return await checkMotforexQpayInvoice(extractMetadata(event), Number(event.pathParameters.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getHandleQpayCallbackFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Bad request!`, 400);
    await Number(event.pathParameters.id);
    return formatApiResponse({ message: 'Qpay callback handled successfully' });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const postCheckQpayInvoice = middyfy(postCheckQpayInvoiceFunc);
export const getHandleQpayCallback = middyfy(getHandleQpayCallbackFunc);
