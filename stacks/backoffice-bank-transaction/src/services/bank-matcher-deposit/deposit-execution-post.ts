import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { DepositExecution } from '@motforex/global-types';

import { CustomError, formatApiResponse, handleApiFuncError, logger, sendRequest } from '@motforex/global-libs';
import { getDepositExecutionRaw } from './deposit-execution-get';
import { BANK_MATCHER_ADDRESS } from '@/constants';

/**
 *  Reprocess deposit execution.
 *
 * @param metadata - Request metadata
 * @param id - Path variable id
 * @returns
 */
export async function reprocessDepositExecution(id: number): Promise<APIResponse> {
  try {
    const { data } = await sendRequest<DepositExecution>({
      url: `${BANK_MATCHER_ADDRESS}/api/v1/deposit-executions/${id}/reprocess`,
      method: 'POST'
    });
    return formatApiResponse(data || {});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

/**
 * Solve deposit if the deposit execution is in a valid state.
 *
 * @param metadata
 * @param id
 * @returns
 */
export async function solveDepositExecutionByApi(id: number, message: string): Promise<APIResponse> {
  try {
    const depositExecution = await getDepositExecutionRaw(id);

    if (!depositExecution) {
      logger.error(`Deposit execution with id ${id} not found`);
      throw new CustomError('Bad request! Deposit execution not found', 400);
    }
    logger.info(`Deposit execution with id ${id} found`);

    if (!['PROCESSING', 'FAILED', 'PENDING', 'PAYOUT'].includes(depositExecution.status)) {
      logger.error(`Deposit execution with id ${id} is not in a valid state`);
      throw new CustomError('Bad request! Deposit execution is not in a valid state', 400);
    }
    logger.info(`Deposit execution with id ${id} is in a valid state`);

    const body = {
      ...depositExecution,
      status: 'SOLVED',
      message
    };

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
