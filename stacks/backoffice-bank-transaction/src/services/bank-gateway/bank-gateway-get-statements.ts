import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata } from '@motforex/global-types';

import { formatApiResponse, handleApiFuncError, sendRequest } from '@motforex/global-libs';

export async function getStatementItems(metadata: Metadata): Promise<APIResponse> {
  try {
    const { queryParams } = metadata;
    const { data } = await sendRequest({
      url: 'http://52.76.74.131:8087/api/statement-items',
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
      url: 'http://52.76.74.131:8087/api/statement-items/count',
      method: 'GET',
      params: queryParams
    });
    return formatApiResponse({ count: data });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
