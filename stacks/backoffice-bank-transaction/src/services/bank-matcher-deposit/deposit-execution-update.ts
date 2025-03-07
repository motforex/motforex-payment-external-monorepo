import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { DepositExecution, RequestMetadata as Metadata } from '@motforex/global-types';

import {
  checkAuthorization,
  CustomError,
  formatApiResponse,
  handleApiFuncError,
  logger,
  sendRequest
} from '@motforex/global-libs';
import { BANK_MATCHER_ADDRESS } from '@/constants';
import { getDepositExecutionRaw } from './deposit-execution-get';
import { DepositExecutionSchema } from '@motforex/global-types';

export async function updateDepositExecution(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    const { email } = checkAuthorization(metadata, 'update-deposit-execution');
    logger.info(`User ${email} is updating deposit execution with id ${id}`);
    const depositExecution = await getDepositExecutionRaw(id);

    if (!depositExecution) {
      logger.error(`Deposit execution with id ${id} not found`);
      throw new CustomError('Bad request! Deposit execution not found', 400);
    }

    if (['EXECUTED', 'REJECTED', 'SOLVED'].includes(depositExecution.status)) {
      logger.error(`Deposit execution with id ${id} is not in a valid state`);
      throw new CustomError('Bad request! Deposit execution is not in a valid state', 400);
    }

    const body = DepositExecutionSchema.parse(metadata.body);
    if (body.status === 'EXECUTED') {
      logger.warn(`User:${email} is trying to update the status to 'EXECUTED'`);
      throw new CustomError('Bad request! You cannot update the status to EXECUTED', 400);
    }

    const { data } = await sendRequest<DepositExecution>({
      url: `${BANK_MATCHER_ADDRESS}/api/deposit-executions/${id}`,
      method: 'PUT',
      data: body
    });

    return formatApiResponse(data);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
