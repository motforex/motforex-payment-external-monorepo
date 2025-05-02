import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { CustomError, extractMetadata, handleApiFuncError, middyfy } from '@motforex/global-libs';
import { formatInvoiceAsResponse } from '@motforex/global-services';

import { checkAuthorization } from '@motforex/global-libs';
import {
  checkMotforexApplepayInvoice,
  createMotforexApplepayInvoice,
  processMotforexApplepayPayment
} from '@/services/applepay/applepay-merch';

const createApplePayInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Bad request!`, 400);
    const id = Number(event.pathParameters.id);
    const metadata = extractMetadata(event);
    const { email } = checkAuthorization(metadata);
    const response = await createMotforexApplepayInvoice(id, email, metadata.headers.locale as string);
    return formatInvoiceAsResponse(response);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const processApplePayPaymentFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const { id } = event.pathParameters || {};
    if (!id) throw new CustomError('Missing invoice ID', 400);

    const body = JSON.parse(event.body || '{}');
    const { paymentToken } = body;
    if (!paymentToken) throw new CustomError('Missing payment token', 400);

    const updatedInvoice = await processMotforexApplepayPayment(Number(id), paymentToken);
    return formatInvoiceAsResponse(updatedInvoice);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const checkApplePayInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Bad request!`, 400);

    const id = Number(event.pathParameters.id);
    const metadata = extractMetadata(event);
    const { email } = checkAuthorization(metadata);

    const response = await checkMotforexApplepayInvoice(id, email);

    return formatInvoiceAsResponse(response);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const createApplePayInvoice = middyfy(createApplePayInvoiceFunc);
export const processApplePayPayment = middyfy(processApplePayPaymentFunc);
export const checkApplePayInvoice = middyfy(checkApplePayInvoiceFunc);
