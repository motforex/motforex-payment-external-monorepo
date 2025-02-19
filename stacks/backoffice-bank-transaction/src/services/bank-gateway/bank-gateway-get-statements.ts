import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata } from '@motforex/global-types';

import { formatApiResponse, handleApiFuncError, sendRequest } from '@motforex/global-libs';
import { BANK_GATEWAY_ADDRESS } from '@/constants';

export async function getStatementItems(metadata: Metadata): Promise<APIResponse> {
  try {
    const { queryParams } = metadata;
    const { data } = await sendRequest({
      url: `${BANK_GATEWAY_ADDRESS}/api/statement-items`,
      method: 'GET',
      params: queryParams
    });
    return formatApiResponse(data || {});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function getStatementItemsCount(metadata: Metadata): Promise<APIResponse> {
  try {
    const { queryParams } = metadata;
    const { data } = await sendRequest({
      url: `${BANK_GATEWAY_ADDRESS}/api/statement-items/count`,
      method: 'GET',
      params: queryParams
    });
    return formatApiResponse({ count: data });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
