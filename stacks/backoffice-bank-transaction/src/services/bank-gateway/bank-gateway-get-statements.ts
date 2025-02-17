import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata } from '@motforex/global-types';

import { formatApiResponse, handleApiFuncError, logger, sendRequest } from '@motforex/global-libs';

export async function getStatementItems(metadata: Metadata): Promise<APIResponse> {
  try {
    const { queryParams } = metadata;
    const { data } = await sendRequest({
      url: 'http://52.76.74.131:8087/api/statement-items',
      method: 'GET',
      params: queryParams
    });
    logger.info(`Getting statement items for bank account: ${queryParams}`);
    return formatApiResponse(data || {});
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
