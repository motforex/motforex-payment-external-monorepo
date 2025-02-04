import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata } from '@motforex/global-types';

import { formatApiResponse, handleApiFuncError } from '@motforex/global-libs';

export async function handleMotforexGolomtMerchCallback(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    return formatApiResponse({ message: 'Qpay callback handled successfully' });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
