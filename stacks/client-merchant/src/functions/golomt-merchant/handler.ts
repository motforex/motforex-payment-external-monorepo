import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';
import type { GolomtCallbackBody } from '@/types';

import {
  checkAuthorization,
  CustomError,
  extractMetadata,
  formatApiResponse,
  handleApiFuncError,
  middyfy
} from '@motforex/global-libs';
import {
  checkMotfxSocialpayInvoice,
  createMotforexGolomtMerchantInvoice,
  createMotforexSocialpayInvoice
} from '@/services/golomt-merchant';
import { formatInvoiceAsResponse } from '@motforex/global-services';
import { receiveMotfxGolomtMerchNotification } from '@/services/golomt-merchant/golomt-merchant-callback';

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

const receiveMerchantNotificationFunc: ApiFuncType<GolomtCallbackBody> = async (event): Promise<ApiFuncRes> => {
  try {
    if (event.httpMethod !== 'POST') return formatApiResponse({ message: 'Unallowed HTTP method' }, 404);

    await receiveMotfxGolomtMerchNotification(event.body);
    return formatApiResponse(event.body || {});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const createGolomtMerchInvoice = middyfy(createGolomtMerchInvoiceFunc);
export const createSocialPayInvoice = middyfy(createSocialPayInvoiceFunc);
export const checkGolomtMerchInvoice = middyfy(checkGolomtMerchInvoiceFunc);
export const checkSocialpayInvoice = middyfy(checkSocialpayInvoiceFunc);
export const receiveMerchantNotification = middyfy(receiveMerchantNotificationFunc);
