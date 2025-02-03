import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata } from '@motforex/global-types';

import { formatApiResponse, handleApiFuncError } from '@motforex/global-libs';

export const REGENERATION_COUNT = 5;
export const EXPIRY_TIME = 600000;

export async function createMotforexGolomtMerchantInvoice(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    return formatApiResponse({ message: 'Qpay callback handled successfully' });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function createMotforexSocialpayInvoice(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    return formatApiResponse({ message: 'Qpay callback handled successfully' });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
