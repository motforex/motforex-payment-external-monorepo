import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import {
  checkAdminAuthorization,
  CustomError,
  extractMetadata,
  handleApiFuncError,
  middyfy
} from '@motforex/global-libs';
import * as bankMatcherDeService from '@/services/bank-matcher-deposit';
import { verifyPermission } from '@motforex/global-services';

const getDepositExecutionsFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:readBankDeposit']);

    return await bankMatcherDeService.getDepositExecutions(metadata);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getDepositExecutionsCountFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:readBankDeposit']);

    return await bankMatcherDeService.getDepositExecutionsCount(metadata);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getDepositExecutionByIdFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:readBankDeposit']);

    return await bankMatcherDeService.getDepositExecutionById(Number(event.pathParameters?.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const putDepositExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:executeBankDeposit']);
    return await bankMatcherDeService.updateDepositExecution(metadata, Number(event.pathParameters?.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postReprocessDepositExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:executeBankDeposit']);

    return await bankMatcherDeService.reprocessDepositExecution(metadata, Number(event.pathParameters?.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postSolveDepositExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);

    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:executeBankDeposit']);

    return await bankMatcherDeService.solveDepositExecutionByApi(metadata, Number(event.pathParameters?.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const getDepositExecutions = middyfy(getDepositExecutionsFunc);
export const getDepositExecutionsCount = middyfy(getDepositExecutionsCountFunc);
export const getDepositExecutionById = middyfy(getDepositExecutionByIdFunc);
export const putDepositExecution = middyfy(putDepositExecutionFunc);
export const postReprocessDepositExecution = middyfy(postReprocessDepositExecutionFunc);
export const postSolveDepositExecution = middyfy(postSolveDepositExecutionFunc);
