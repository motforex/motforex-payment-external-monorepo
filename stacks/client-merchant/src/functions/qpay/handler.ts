import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { checkAuthorization, CustomError, extractMetadata, handleApiFuncError, middyfy } from '@motforex/global-libs';
import { checkMotforexQpayInvoiceAsClient, createMotfxQpayInvoice } from '@/services';
import { formatInvoiceAsResponse } from '@motforex/global-services';

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

export const createQpayInvoice = middyfy(createQpayInvoiceFunc);
export const checkQpayInvoice = middyfy(checkQpayInvoiceFunc);
