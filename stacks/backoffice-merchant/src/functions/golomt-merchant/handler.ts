import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import {
  checkAdminAuthorization,
  CustomError,
  extractMetadata,
  formatApiResponse,
  handleApiFuncError,
  middyfy
} from '@motforex/global-libs';
import { checkMotforexGolomtMerchInvoice, receiveGolomtMerchPushNotification } from '@/services/motforex-golomt-merch';
import { GolomtMerchantCallbackRequest as GolomtCallbackReq } from '@/types';
import { verifyPermission } from '@motforex/global-services';

const postCheckGolomtMerchFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);

    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:executeInvoiceDeposit']);

    return await checkMotforexGolomtMerchInvoice(metadata, Number(event.pathParameters.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postReceiveGolomtMerchCallbackFunc: ApiFuncType<GolomtCallbackReq> = async (event): Promise<ApiFuncRes> => {
  try {
    if (event.httpMethod !== 'POST') return formatApiResponse({ message: 'Unallowed HTTP method' }, 404);
    await receiveGolomtMerchPushNotification(event.body as GolomtCallbackReq);
    return formatApiResponse({ message: 'Golomt Merch callback handled successfully' });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const postCheckGolomtMerch = middyfy(postCheckGolomtMerchFunc);
export const postReceiveGolomtMerchCallback = middyfy(postReceiveGolomtMerchCallbackFunc);
