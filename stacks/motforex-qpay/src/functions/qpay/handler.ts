import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { CustomError, extractMetadata, handleApiFuncError, middyfy } from '@motforex/global-libs';
import {
  checkMotforexQpayInvoiceAsAdmin,
  checkMotforexQpayInvoiceAsClient,
  createMotforexQpayInvoice,
  handleMotfxQpayAuthToken
} from '@/services';

export const handleQpayToken = async (): Promise<void> => {
  await handleMotfxQpayAuthToken();
};

const createQpayInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Bad request!`, 400);
    return await createMotforexQpayInvoice(extractMetadata(event), Number(event.pathParameters.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const checkQpayInvoiceAsClientFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Bad request!`, 400);
    return await checkMotforexQpayInvoiceAsClient(extractMetadata(event), Number(event.pathParameters.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const checkQpayInvoiceAsAdminFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Bad request!`, 400);
    return await checkMotforexQpayInvoiceAsAdmin(extractMetadata(event), Number(event.pathParameters.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const createQpayInvoice = middyfy(createQpayInvoiceFunc);
export const checkQpayInvoiceAsClient = middyfy(checkQpayInvoiceAsClientFunc);
export const checkQpayInvoiceAsAdmin = middyfy(checkQpayInvoiceAsAdminFunc);
