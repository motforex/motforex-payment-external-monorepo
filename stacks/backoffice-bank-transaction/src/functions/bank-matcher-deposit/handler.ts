import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { CustomError, extractMetadata, handleApiFuncError, middyfy } from '@motforex/global-libs';
import * as bankMatcherDeService from '@/services/bank-matcher-deposit';

const getDepositExecutionsFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return await bankMatcherDeService.getDepositExecutions(extractMetadata(event));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getDepositExecutionsCountFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    return await bankMatcherDeService.getDepositExecutionsCount(extractMetadata(event));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getDepositExecutionByIdFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    return await bankMatcherDeService.getDepositExecutionById(Number(event.pathParameters?.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const putDepositExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    return await bankMatcherDeService.updateDepositExecution(extractMetadata(event), Number(event.pathParameters?.id));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postReprocessDepositExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    return await bankMatcherDeService.reprocessDepositExecution(
      extractMetadata(event),
      Number(event.pathParameters?.id)
    );
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postSolveDepositExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    return await bankMatcherDeService.solveDepositExecutionByApi(
      extractMetadata(event),
      Number(event.pathParameters?.id)
    );
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
