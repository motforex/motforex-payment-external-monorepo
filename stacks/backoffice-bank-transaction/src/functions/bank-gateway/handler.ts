import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { extractMetadata, handleApiFuncError, middyfy } from '@motforex/global-libs';
import * as bankGatewayService from '@/services/bank-gateway';

const getStatementItemsFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return await bankGatewayService.getStatementItems(extractMetadata(event));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getStatementItemsCountFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return await bankGatewayService.getStatementItemsCount(extractMetadata(event));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const getStatementItems = middyfy(getStatementItemsFunc);
export const getStatementItemsCount = middyfy(getStatementItemsCountFunc);
