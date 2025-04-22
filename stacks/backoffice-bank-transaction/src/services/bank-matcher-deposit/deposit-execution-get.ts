import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { DepositExecution, RequestMetadata as Metadata } from '@motforex/global-types';

import { formatApiResponse, handleApiFuncError, handleDefaultError, sendRequest } from '@motforex/global-libs';
import { BANK_MATCHER_ADDRESS } from '@/constants';

export async function getDepositExecutions(queryParams: Record<string, string> | undefined): Promise<APIResponse> {
  try {
    const { data } = await sendRequest<DepositExecution[]>({
      url: `${BANK_MATCHER_ADDRESS}/api/deposit-executions`,
      method: 'GET',
      params: queryParams
    });
    return formatApiResponse(data || {});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function getDepositExecutionsCount(queryParams: Record<string, string> | undefined): Promise<APIResponse> {
  try {
    const { data } = await sendRequest<number>({
      url: `${BANK_MATCHER_ADDRESS}/api/deposit-executions/count`,
      method: 'GET',
      params: queryParams
    });
    return formatApiResponse({ count: data });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function getDepositExecutionById(id: number): Promise<APIResponse> {
  try {
    const { data } = await sendRequest<DepositExecution>({
      url: `${BANK_MATCHER_ADDRESS}/api/deposit-executions/${id}`,
      method: 'GET'
    });
    return formatApiResponse(data || {});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function getDepositExecutionRaw(id: number): Promise<DepositExecution | null> {
  try {
    const { data } = await sendRequest<DepositExecution>({
      url: `${BANK_MATCHER_ADDRESS}/api/deposit-executions/${id}`,
      method: 'GET'
    });
    return data;
  } catch (error: unknown) {
    handleDefaultError(error);
    return null;
  }
}
