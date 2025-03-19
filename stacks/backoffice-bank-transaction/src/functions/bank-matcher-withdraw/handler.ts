import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import {
  checkAdminAuthorization,
  CustomError,
  extractMetadata,
  handleApiFuncError,
  middyfy
} from '@motforex/global-libs';
import * as bankMatcherWithdrawService from '@/services/bank-matcher-withdraw';
import { verifyPermission } from '@motforex/global-services';

const getWithdrawExecutionsFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    // Extract metadata from the event
    const metadata = extractMetadata(event);
    // Check admin authorization
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['withdraw:readBankWithdraw']);
    // Get withdraw executions
    return await bankMatcherWithdrawService.getWithdrawExecutions(metadata);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getWithdrawExecutionsCountFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    // Extract metadata from the event
    const metadata = extractMetadata(event);
    // Check admin authorization
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['withdraw:readBankWithdraw']);
    // Get withdraw executions
    return await bankMatcherWithdrawService.getWithdrawExecutionsCount(metadata);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getWithdrawExecutionByIdFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    // Check admin authorization
    const { permission } = checkAdminAuthorization(extractMetadata(event));
    await verifyPermission(permission, ['withdraw:readBankWithdraw']);
    // Get withdraw execution by id
    return await bankMatcherWithdrawService.getWithdrawExecutionById(Number(event.pathParameters?.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getRefreshWithdrawExecutionFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    // Check admin authorization
    const { permission } = checkAdminAuthorization(extractMetadata(event));
    await verifyPermission(permission, ['withdraw:executeBankWithdraw']);
    // Refresh withdraw execution
    return await bankMatcherWithdrawService.refreshWithdrawExecution();
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const putWithdrawExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    // Check admin authorization
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['withdraw:executeBankWithdraw']);

    return await bankMatcherWithdrawService.updateWithdrawExecutionByApi(metadata, Number(event.pathParameters?.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postSolveWithdrawExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    // Check admin authorization
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['withdraw:executeBankWithdraw']);

    return await bankMatcherWithdrawService.solveWithdrawRequestByApi(metadata, Number(event.pathParameters?.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postRevalidateWithdrawExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    // Check admin authorization
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['withdraw:executeBankWithdraw']);

    return await bankMatcherWithdrawService.revalidateWithdrawRequestByApi(metadata, Number(event.pathParameters?.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postExecuteWithdrawExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['withdraw:executeBankWithdraw']);
    return await bankMatcherWithdrawService.executeWithdrawRequestByApi(metadata, Number(event.pathParameters?.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const getWithdrawExecutions = middyfy(getWithdrawExecutionsFunc);
export const getWithdrawExecutionsCount = middyfy(getWithdrawExecutionsCountFunc);
export const getWithdrawExecutionById = middyfy(getWithdrawExecutionByIdFunc);
export const refreshWithdrawExecution = middyfy(getRefreshWithdrawExecutionFunc);
export const putWithdrawExecution = middyfy(putWithdrawExecutionFunc);
export const postSolveWithdrawExecution = middyfy(postSolveWithdrawExecutionFunc);
export const postRevalidateWithdrawExecution = middyfy(postRevalidateWithdrawExecutionFunc);
export const postExecuteWithdrawExecution = middyfy(postExecuteWithdrawExecutionFunc);
