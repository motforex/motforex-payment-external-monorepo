import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import {
  checkAdminAuthorization,
  CustomError,
  extractMetadata,
  handleApiFuncError,
  logger,
  middyfy
} from '@motforex/global-libs';
import * as bankMatcherDeService from '@/services/bank-matcher-deposit';
import { verifyPermission } from '@motforex/global-services';
import { DepositExecutionSchema } from '@motforex/global-types';

const getDepositExecutionsFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:readBankDeposit']);

    return await bankMatcherDeService.getDepositExecutions(metadata.queryParams);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getDepositExecutionsCountFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const metadata = extractMetadata(event);
    const { permission } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:readBankDeposit']);

    return await bankMatcherDeService.getDepositExecutionsCount(metadata.queryParams);
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
    const { permission, email } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:updateBankDeposit']);
    const id = Number(event.pathParameters.id);

    logger.info(`User ${email} is updating deposit execution with id ${id}`);
    const body = DepositExecutionSchema.parse(metadata.body);

    return await bankMatcherDeService.updateDepositExecution(id, body);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postSolveDepositExecutionFunc: ApiFuncType<{ message: string }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);

    const metadata = extractMetadata(event);
    const { permission, email } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:updateBankDeposit']);
    const id = Number(event.pathParameters.id);

    const message = event.body?.message || `Rejected by user ${email}`;
    return await bankMatcherDeService.solveDepositExecutionByApi(id, message);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postReprocessDepositExecutionFunc: ApiFuncType<{ id: number }> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id)
      throw new CustomError(`Bad request, missing path parameter!`, 400);
    const metadata = extractMetadata(event);
    const { permission, email } = checkAdminAuthorization(metadata);
    await verifyPermission(permission, ['deposit:executeBankDeposit']);
    const id = Number(event.pathParameters.id);

    logger.info(`User ${email} is reprocessing deposit execution with id ${id}`);

    return await bankMatcherDeService.reprocessDepositExecution(id);
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
