import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata, WithdrawExecution } from '@motforex/global-types';
import { checkAuthorization, formatApiResponse, handleApiFuncError, logger, sendRequest } from '@motforex/global-libs';
import { BANK_MATCHER_ADDRESS } from '@/constants';
import { getWithdrawExecutionRaw } from './bank-matcher-withdraw-get';

export async function solveWithdrawRequestByApi(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    const { email } = checkAuthorization(metadata, 'solve-Withdraw-Execution');
    logger.info(`User ${email} is solving deposit execution with id ${id}`);

    const withdrawExecution = await getWithdrawExecutionRaw(id);

    if (!withdrawExecution) {
      logger.error(`Withdraw execution with id ${id} not found`);
      return formatApiResponse({}, 404);
    }
    logger.info(`Withdraw execution with id ${id} found`);

    if (!['PROCESSING', 'FAILED', 'PENDING'].includes(withdrawExecution.status)) {
      logger.error(`Withdraw execution with id ${id} is not in a valid state`);
      return formatApiResponse({}, 400);
    }
    logger.info(`Withdraw execution with id ${id} is in a valid state`);

    const body = {
      ...withdrawExecution,
      status: 'SOLVED',
      message: metadata.body.message || `Solved by user ${email}`
    };

    const { data } = await sendRequest<WithdrawExecution>({
      url: `${BANK_MATCHER_ADDRESS}/api/withdraw-executions/${id}`,
      method: 'PUT',
      data: body
    });
    return formatApiResponse(data || {});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function revalidateWithdrawRequestByApi(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
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
    const { data } = await sendRequest<WithdrawExecution[]>({
      url: `${BANK_MATCHER_ADDRESS}/api/v1/withdraw-executions/${id}/execute`,
      method: 'POST'
    });
    return formatApiResponse(data || {});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
