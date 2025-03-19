import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { checkAdminAuthorization, extractMetadata, handleApiFuncError, middyfy } from '@motforex/global-libs';
import { verifyPermission } from '@motforex/global-services';
import * as bankGatewayService from '@/services/bank-gateway';

const getStatementItemsFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:readBankDeposit']);

    return await bankGatewayService.getStatementItems(metadata);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getStatementItemsCountFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:readBankDeposit']);

    return await bankGatewayService.getStatementItemsCount(metadata);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const getStatementItems = middyfy(getStatementItemsFunc);
export const getStatementItemsCount = middyfy(getStatementItemsCountFunc);
