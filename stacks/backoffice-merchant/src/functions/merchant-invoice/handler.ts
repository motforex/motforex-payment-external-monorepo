import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { checkAdminAuthorization, extractMetadata, handleApiFuncError, middyfy } from '@motforex/global-libs';
import * as merchantInvoiceRepo from '@/services/merchant-invoice';
import { extractQueryParamsFromEvent } from '@motforex/dynamo';
import { verifyPermission } from '@motforex/global-services';

const getMerchantInvoiceTableDescFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:readInvoiceDeposit']);

    return await merchantInvoiceRepo.getMerchantInvoiceTableDesc();
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getMerchantInvoiceByQueryFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:readInvoiceDeposit']);

    const { queryParams } = metadata;
    return await merchantInvoiceRepo.getMerchantInvoiceByQuery(
      extractQueryParamsFromEvent(event, {
        indexName: 'all-createdAt-index',
        pKey: '1',
        pKeyType: 'N',
        pKeyProp: 'all',
        ...queryParams
      })
    );
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const getMerchantInvoiceTableDesc = middyfy(getMerchantInvoiceTableDescFunc);
export const getMerchantInvoiceByQuery = middyfy(getMerchantInvoiceByQueryFunc);
