import { getCryptoBalanceRecordByUserId } from '@/repository/crypto-balance-request-repository';
import type { CryptoBalanceRecord, UpdateCryptoBalanceRequest } from '@/types/crypto-balance.types';

import { CryptoBalanceRecordSchema } from '@/types/crypto-balance.types';
import { CustomError, logger } from '@motforex/global-libs';

export async function updateCryptoBalance(request: UpdateCryptoBalanceRequest): Promise<CryptoBalanceRecord> {
  const { userId, operation, amountInUsd, updatedBy } = request;

  const cryptoBalanceRecord = await getCryptoBalanceRecordByUserId(userId);
  if (!cryptoBalanceRecord) {
    throw new CustomError('Crypto balance record not found');
  }
  logger.info(`Crypto balance record found: ${JSON.stringify(cryptoBalanceRecord)}`);

  return CryptoBalanceRecordSchema.parse({});
}
