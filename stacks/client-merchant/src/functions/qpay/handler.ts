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
import { checkMotforexQpayInvoiceAsClient, createMotfxQpayInvoice } from '@/services';
import { formatInvoiceAsResponse } from '@motforex/global-services';
import { handleCallbackMotforexInvoice } from '@/services/motforex-qpay/motforex-qpay-callback';

const createQpayInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`financeMessageErrorBadRequestPathVariable`, 400);

    const id = Number(event.pathParameters.id);
    const metadata = extractMetadata(event);
    const { email } = checkAuthorization(metadata);

    const response = await createMotfxQpayInvoice(id, email, metadata.headers.locale as string);

    return formatInvoiceAsResponse(response);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const checkQpayInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`financeMessageErrorBadRequestPathVariable`, 400);

    const id = Number(event.pathParameters.id);
    const metadata = extractMetadata(event);
    const { email } = checkAuthorization(metadata);
    const response = await checkMotforexQpayInvoiceAsClient(id, email);

    return formatInvoiceAsResponse(response);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getCallbackQpayInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) {
      logger.info(`Missing path parameters`);
      return formatApiResponse({});
    }

    const id = Number(event.pathParameters.id);
    await handleCallbackMotforexInvoice(id);
    return formatApiResponse({});
  } catch (error: unknown) {
    handleApiFuncError(error);
    return formatApiResponse({});
  }
};

export const createQpayInvoice = middyfy(createQpayInvoiceFunc);
export const checkQpayInvoice = middyfy(checkQpayInvoiceFunc);
export const getCallbackQpayInvoice = middyfy(getCallbackQpayInvoiceFunc);
