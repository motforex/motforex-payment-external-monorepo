import {
  formatApiResponse,
  handleApiFuncError,
  middyfy,
  type CustomAPIGatewayEvent as ApiFuncType
} from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

const createQpayInvoiceFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return formatApiResponse({ message: 'Test function is working!' });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const checkQpayInvoiceAsClientFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return formatApiResponse({ message: 'Test function is working!' });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const checkQpayInvoiceAsAdminFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return formatApiResponse({ message: 'Test function is working!' });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const createQpayInvoice = middyfy(createQpayInvoiceFunc);
export const checkQpayInvoiceAsClient = middyfy(checkQpayInvoiceAsClientFunc);
export const checkQpayInvoiceAsAdmin = middyfy(checkQpayInvoiceAsAdminFunc);
