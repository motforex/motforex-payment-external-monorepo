import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { CustomError, extractMetadata, handleApiFuncError, middyfy } from '@motforex/global-libs';
import {
  checkMotforexGolomtMerchInvoice,
  createMotforexGolomtMerchantInvoice,
  createMotforexSocialpayInvoice
} from '@/services/golomt-merchant';

const createGolomtMerchInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Bad request!`, 400);
    return await createMotforexGolomtMerchantInvoice(extractMetadata(event), Number(event.pathParameters.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const createSocialPayInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Bad request!`, 400);
    return await createMotforexSocialpayInvoice(extractMetadata(event), Number(event.pathParameters.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const checkGolomtMerchInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Bad request!`, 400);
    return await checkMotforexGolomtMerchInvoice(extractMetadata(event), Number(event.pathParameters.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const createGolomtMerchInvoice = middyfy(createGolomtMerchInvoiceFunc);
export const createSocialPayInvoice = middyfy(createSocialPayInvoiceFunc);
export const checkGolomtMerchInvoice = middyfy(checkGolomtMerchInvoiceFunc);
