import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata, WithdrawExecution } from '@motforex/global-types';

import { formatApiResponse, handleApiFuncError, handleDefaultError, sendRequest } from '@motforex/global-libs';
import { BANK_MATCHER_ADDRESS } from '@/constants';

export async function getWithdrawExecutions(metadata: Metadata): Promise<APIResponse> {
  try {
    const { queryParams } = metadata;
    const { data } = await sendRequest<WithdrawExecution[]>({
      url: `${BANK_MATCHER_ADDRESS}/api/withdraw-executions`,
      method: 'GET',
      params: queryParams
    });
    return formatApiResponse(data || {});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function getWithdrawExecutionsCount(metadata: Metadata): Promise<APIResponse> {
  try {
    const { queryParams } = metadata;
    const { data } = await sendRequest<number>({
      url: `${BANK_MATCHER_ADDRESS}/api/withdraw-executions/count`,
      method: 'GET',
      params: queryParams
    });
    return formatApiResponse({ count: data });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function getWithdrawExecutionById(id: number): Promise<APIResponse> {
  try {
    const { data } = await sendRequest<WithdrawExecution>({
      url: `${BANK_MATCHER_ADDRESS}/api/withdraw-executions/${id}`,
      method: 'GET'
    });
    return formatApiResponse(data || {});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function refreshWithdrawExecution(): Promise<APIResponse> {
  try {
    const { data } = await sendRequest<WithdrawExecution>({
      url: `${BANK_MATCHER_ADDRESS}/api/v1/withdraw-executions/refresh`,
      method: 'POST'
    });
    return formatApiResponse(data);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function rejectWithdrawExecution(id: number, message: string): Promise<APIResponse> {
  try {
    const { data } = await sendRequest<WithdrawExecution>({
      url: `${BANK_MATCHER_ADDRESS}/api/v1/withdraw-executions/${id}/reject`,
      method: 'POST',
      data: { message }
    });
    return formatApiResponse(data || {});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function getWithdrawExecutionRaw(id: number): Promise<WithdrawExecution | null> {
  try {
    const { data } = await sendRequest<WithdrawExecution>({
      url: `${BANK_MATCHER_ADDRESS}/api/withdraw-executions/${id}`,
      method: 'GET'
    });
    return data;
  } catch (error: unknown) {
    handleDefaultError(error);
    return null;
  }
}
