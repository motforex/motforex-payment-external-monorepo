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
import { getDepositExecutionRaw } from './deposit-execution-get';
import { BANK_MATCHER_ADDRESS } from '@/constants';

/**
 *  Reprocess deposit execution.
 *
 * @param metadata - Request metadata
 * @param id - Path variable id
 * @returns
 */
export async function reprocessDepositExecution(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    const { email } = checkAuthorization(metadata, 'reprocess-Deposit-Execution');
    logger.info(`User ${email} is reprocessing deposit execution with id ${id}`);
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
export async function solveDepositExecutionByApi(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    const { email } = checkAuthorization(metadata, 'solve-Deposit-Execution');
    logger.info(`User ${email} is solving deposit execution with id ${id}`);

    const depositExecution = await getDepositExecutionRaw(id);

    if (!depositExecution) {
      logger.error(`Deposit execution with id ${id} not found`);
      throw new CustomError('Bad request! Deposit execution not found', 400);
    }
    logger.info(`Deposit execution with id ${id} found`);

    if (!['PROCESSING', 'FAILED', 'PENDING'].includes(depositExecution.status)) {
      logger.error(`Deposit execution with id ${id} is not in a valid state`);
      throw new CustomError('Bad request! Deposit execution is not in a valid state', 400);
    }
    logger.info(`Deposit execution with id ${id} is in a valid state`);

    const body = {
      ...depositExecution,
      status: 'SOLVED',
      message: metadata.body.message || `Solved by user ${email}`
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
