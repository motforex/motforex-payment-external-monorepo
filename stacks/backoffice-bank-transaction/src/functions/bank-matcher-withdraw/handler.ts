import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { CustomError, extractMetadata, handleApiFuncError, middyfy } from '@motforex/global-libs';
import * as bankMatcherWithdrawService from '@/services/bank-matcher-withdraw';

const getWithdrawExecutionsFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return await bankMatcherWithdrawService.getWithdrawExecutions(extractMetadata(event));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getWithdrawExecutionsCountFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return await bankMatcherWithdrawService.getWithdrawExecutionsCount(extractMetadata(event));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getWithdrawExecutionByIdFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    return await bankMatcherWithdrawService.getWithdrawExecutionById(Number(event.pathParameters?.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getRefreshWithdrawExecutionFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return await bankMatcherWithdrawService.refreshWithdrawExecution();
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const putWithdrawExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    return await bankMatcherWithdrawService.updateWithdrawExecutionByApi(
      extractMetadata(event),
      Number(event.pathParameters?.id)
    );
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postSolveWithdrawExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    return await bankMatcherWithdrawService.solveWithdrawRequestByApi(
      extractMetadata(event),
      Number(event.pathParameters?.id)
    );
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postRevalidateWithdrawExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    return await bankMatcherWithdrawService.revalidateWithdrawRequestByApi(
      extractMetadata(event),
      Number(event.pathParameters?.id)
    );
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postExecuteWithdrawExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    return await bankMatcherWithdrawService.executeWithdrawRequestByApi(
      extractMetadata(event),
      Number(event.pathParameters?.id)
    );
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
