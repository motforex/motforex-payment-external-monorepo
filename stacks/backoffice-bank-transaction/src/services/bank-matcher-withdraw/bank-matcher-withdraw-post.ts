import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import {
  STATUS_AUTO_PAYOUT,
  STATUS_AUTO_PROCESSING,
  STATUS_FAILED,
  STATUS_PAYOUT,
  STATUS_PENDING,
  STATUS_PROCESSING,
  type RequestMetadata as Metadata,
  type WithdrawExecution
} from '@motforex/global-types';
import {
  checkAuthorization,
  CustomError,
  formatApiResponse,
  handleApiFuncError,
  logger,
  sendRequest
} from '@motforex/global-libs';
import { BANK_MATCHER_ADDRESS } from '@/constants';
import { getWithdrawExecutionRaw } from './bank-matcher-withdraw-get';

export async function solveWithdrawRequestByApi(id: number, message: string): Promise<APIResponse> {
  try {
    const withdrawExecution = await getWithdrawExecutionRaw(id);

    if (!withdrawExecution) {
      logger.error(`Withdraw execution with id ${id} not found`);
      return formatApiResponse({}, 404);
    }
    logger.info(`Withdraw execution with id ${id} found`);

    if (
      ![
        STATUS_PROCESSING,
        STATUS_FAILED,
        STATUS_PENDING,
        STATUS_PAYOUT,
        STATUS_AUTO_PAYOUT,
        STATUS_AUTO_PROCESSING
      ].includes(withdrawExecution.status)
    ) {
      logger.error(`Withdraw execution with id ${id} is not in a valid state`);
      throw new CustomError('Bad request! Withdraw execution is not in a valid state', 400);
    }
    logger.info(`Withdraw execution with id ${id} is in a valid state`);

    const { data } = await sendRequest<WithdrawExecution>({
      url: `${BANK_MATCHER_ADDRESS}/api/withdraw-executions/${id}`,
      method: 'PUT',
      data: {
        ...withdrawExecution,
        status: 'SOLVED',
        message
      }
    });

    return formatApiResponse(data || {});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function revalidateWithdrawRequestByApi(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    const { email } = checkAuthorization(metadata, 'Revalidate-Withdraw-Execution');
    logger.info(`User ${email} is revalidating withdraw-execution with id ${id}`);

    const { data } = await sendRequest<WithdrawExecution[]>({
      url: `${BANK_MATCHER_ADDRESS}/api/v1/withdraw-executions/${id}/revalidate`,
      method: 'POST'
    });
    return formatApiResponse(data || {});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function executeWithdrawRequestByApi(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    const { email } = checkAuthorization(metadata, 'Execute-Withdraw-Execution');
    logger.info(`User ${email} is executing withdraw-execution with id ${id}`);

    const { data } = await sendRequest<WithdrawExecution[]>({
      url: `${BANK_MATCHER_ADDRESS}/api/v1/withdraw-executions/${id}/execute`,
      method: 'POST'
    });

    return formatApiResponse(data);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
