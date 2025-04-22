import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { DepositExecution } from '@motforex/global-types';

import { CustomError, formatApiResponse, handleApiFuncError, logger, sendRequest } from '@motforex/global-libs';
import { BANK_MATCHER_ADDRESS } from '@/constants';
import { getDepositExecutionRaw } from './deposit-execution-get';

export async function updateDepositExecution(id: number, body: DepositExecution): Promise<APIResponse> {
  try {
    const depositExecution = await getDepositExecutionRaw(id);

    if (!depositExecution) {
      logger.error(`Deposit execution with id ${id} not found`);
      throw new CustomError('Bad request! Deposit execution not found', 400);
    }

    if (['EXECUTED', 'REJECTED', 'SOLVED'].includes(depositExecution.status)) {
      logger.error(`Deposit execution with id ${id} is not in a valid state`);
      throw new CustomError('Bad request! Deposit execution is not in a valid state', 400);
    }

    if (body.status === 'EXECUTED') {
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
