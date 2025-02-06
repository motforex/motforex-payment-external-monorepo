import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { extractMetadata, handleApiFuncError, middyfy } from '@motforex/global-libs';
import * as merchantInvoiceRepo from '@/services/merchant-invoice';
import { extractQueryParamsFromEvent } from '@motforex/dynamo';

const getMerchantInvoiceTableDescFunc: ApiFuncType<null> = async (): Promise<ApiFuncRes> => {
  try {
    return await merchantInvoiceRepo.getMerchantInvoiceTableDesc();
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getMerchantInvoiceByQueryFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const { queryParams } = extractMetadata(event);
    return await merchantInvoiceRepo.getMerchantInvoiceByQuery(
      extractQueryParamsFromEvent(event, 'all-createdAt-index', {
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
