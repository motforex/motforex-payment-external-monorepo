import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { checkAuthorization, CustomError, extractMetadata, handleApiFuncError, middyfy } from '@motforex/global-libs';
import {
  checkMotfxSocialpayInvoice,
  createMotforexGolomtMerchantInvoice,
  createMotforexSocialpayInvoice
} from '@/services/golomt-merchant';
import { formatInvoiceAsResponse } from '@motforex/global-services';

const createGolomtMerchInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`financeMessageErrorBadRequestPathVariable`, 400);

    const id = Number(event.pathParameters.id);
    const metadata = extractMetadata(event);
    const { email } = checkAuthorization(metadata);

    const response = await createMotforexGolomtMerchantInvoice(id, email, metadata.headers.locale as string);
    return formatInvoiceAsResponse(response);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const createSocialPayInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`financeMessageErrorBadRequestPathVariable`, 400);

    const id = Number(event.pathParameters.id);
    const metadata = extractMetadata(event);
    const { email } = checkAuthorization(metadata);
    const response = await createMotforexSocialpayInvoice(id, email, metadata.headers.locale as string);

    return formatInvoiceAsResponse(response);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const checkGolomtMerchInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`financeMessageErrorBadRequestPathVariable`, 400);

    const id = Number(event.pathParameters.id);
    const metadata = extractMetadata(event);
    const { email } = checkAuthorization(metadata);

    const response = await checkMotfxSocialpayInvoice(id, email, 'CARD');
    return formatInvoiceAsResponse(response);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const checkSocialpayInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`financeMessageErrorBadRequestPathVariable`, 400);

    const id = Number(event.pathParameters.id);
    const metadata = extractMetadata(event);
    const { email } = checkAuthorization(metadata);

    const response = await checkMotfxSocialpayInvoice(id, email, 'SOCIALPAY');
    return formatInvoiceAsResponse(response);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const createGolomtMerchInvoice = middyfy(createGolomtMerchInvoiceFunc);
export const createSocialPayInvoice = middyfy(createSocialPayInvoiceFunc);
export const checkGolomtMerchInvoice = middyfy(checkGolomtMerchInvoiceFunc);
export const checkSocialpayInvoice = middyfy(checkSocialpayInvoiceFunc);
