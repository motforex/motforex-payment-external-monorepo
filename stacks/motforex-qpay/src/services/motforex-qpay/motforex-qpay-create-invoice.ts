import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata } from '@motforex/global-types';

import { formatApiResponse, handleApiFuncError } from '@motforex/global-libs';

export async function createMotforexQpayInvoice(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    return formatApiResponse(metadata);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
