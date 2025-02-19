import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { WithdrawExecution, RequestMetadata as Metadata } from '@motforex/global-types';

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
import { WithdrawExecutionSchema } from '@motforex/global-types';

export async function updateWithdrawExecutionByApi(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    const { email } = checkAuthorization(metadata, 'update-withdraw-execution');
    logger.info(`User ${email} is updating deposit execution with id ${id}`);
    const withdrawExecution = await getWithdrawExecutionRaw(id);

    if (!withdrawExecution) {
      logger.error(`Deposit execution with id ${id} not found`);
      throw new CustomError('Bad request! Deposit execution not found', 400);
    }

    if (['EXECUTED', 'REJECTED', 'SOLVED'].includes(withdrawExecution.status)) {
      logger.error(`Deposit execution with id ${id} is not in a valid state`);
      throw new CustomError('Bad request! Deposit execution is not in a valid state', 400);
    }

    const body = WithdrawExecutionSchema.parse(metadata.body);
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
