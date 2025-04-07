import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { CustomError, extractMetadata, handleApiFuncError, middyfy } from '@motforex/global-libs';
import { checkMotforexQpayInvoiceAsClient, createMotforexQpayInvoice } from '@/services';

const createQpayInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`financeMessageErrorBadRequestPathVariable`, 400);
    return await createMotforexQpayInvoice(extractMetadata(event), Number(event.pathParameters.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const checkQpayInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`financeMessageErrorBadRequestPathVariable`, 400);
    return await checkMotforexQpayInvoiceAsClient(extractMetadata(event), Number(event.pathParameters.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const createQpayInvoice = middyfy(createQpayInvoiceFunc);
export const checkQpayInvoice = middyfy(checkQpayInvoiceFunc);
