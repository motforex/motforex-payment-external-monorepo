import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { WithdrawExecution } from '@motforex/global-types';

import { CustomError, formatApiResponse, handleApiFuncError, logger, sendRequest } from '@motforex/global-libs';
import { BANK_MATCHER_ADDRESS } from '@/constants';
import { getWithdrawExecutionRaw } from './bank-matcher-withdraw-get';
import {
  STATUS_AUTO_EXECUTED,
  STATUS_AUTO_REJECTED,
  STATUS_AUTO_SOLVED,
  STATUS_EXECUTED,
  STATUS_REJECTED,
  WithdrawExecutionSchema
} from '@motforex/global-types';

export async function updateWithdrawExec(id: number, email: string, item: WithdrawExecution): Promise<APIResponse> {
  try {
    logger.info(`User ${email} is updating deposit execution with id ${id}`);
    const withdrawExecution = await getWithdrawExecutionRaw(id);

    if (!withdrawExecution) {
      logger.error(`Deposit execution with id ${id} not found`);
      throw new CustomError('Bad request! Deposit execution not found', 400);
    }

    if (
      [
        STATUS_EXECUTED,
        STATUS_REJECTED,
        STATUS_AUTO_SOLVED,
        STATUS_AUTO_REJECTED,
        STATUS_AUTO_EXECUTED,
        'SOLVED'
      ].includes(withdrawExecution.status)
    ) {
      logger.error(`Deposit execution with id ${id} is not in a valid state`);
      throw new CustomError('Bad request! Deposit execution is not in a valid state', 400);
    }

    const body = WithdrawExecutionSchema.parse(item);
    if (body.status === STATUS_EXECUTED) {
      logger.warn(`User:${email} is trying to update the status to 'EXECUTED'`);
      throw new CustomError('Bad request! You cannot update the status to EXECUTED', 400);
    }

    const { data } = await sendRequest<WithdrawExecution>({
      url: `${BANK_MATCHER_ADDRESS}/api/withdraw-executions/${id}`,
      method: 'PUT',
      data: body
    });

    return formatApiResponse(data);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
