import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';
import type { CustomAPIGatewayEvent as ApiFuncType } from '@motforex/global-libs';

import {
  checkAuthorization,
  extractMetadata,
  formatApiResponse,
  formatResponse,
  handleApiFuncErrorWithI18n,
  handleDefaultErrorWithI18n,
  middyfy
} from '@motforex/global-libs';
import {
  GetCryptoBalanceRequest,
  GetCryptoBalanceRequestSchema,
  UpdateCryptoBalanceRequest,
  UpdateCryptoBalanceRequestSchema
} from '@/types/crypto-balance.types';
import { getCryptoBalance, updateCryptoBalance } from '@/service/crypto-balance';

const getCryptoBalanceByApiFunc: ApiFuncType<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const metadata = extractMetadata(event);
    const { sub: userId, email } = checkAuthorization(metadata, 'get-crypto-balance');
    const { balanceInUsd, updatedAt } = await getCryptoBalance(userId, email);
    return formatApiResponse({ balanceInUsd, updatedAt });
  } catch (error: unknown) {
    return handleApiFuncErrorWithI18n(error);
  }
};

export const getCryptoBalancePrivately = async (event: GetCryptoBalanceRequest) => {
  try {
    const { userId, email } = GetCryptoBalanceRequestSchema.parse(event);
    const { balanceInUsd, updatedAt } = await getCryptoBalance(userId, email);
    return formatResponse({ balanceInUsd, updatedAt });
  } catch (error: unknown) {
    return handleDefaultErrorWithI18n(error);
  }
};

export const updateCryptoBalancePrivately = async (event: UpdateCryptoBalanceRequest) => {
  try {
    const request = UpdateCryptoBalanceRequestSchema.parse(event);
    const result = await updateCryptoBalance(request);
    return formatResponse(result);
  } catch (error: unknown) {
    return handleDefaultErrorWithI18n(error);
  }
};

export const getCryptoBalanceByApi = middyfy(getCryptoBalanceByApiFunc);
