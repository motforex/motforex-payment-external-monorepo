import type { CryptoBalanceRecord, UpdateCryptoBalanceRequest } from '@/types/crypto-balance.types';

import { CryptoBalanceRecordSchema, UpdateCryptoBalanceRequestSchema } from '@/types/crypto-balance.types';
import {
  createCryptoBalanceRecord,
  getCryptoBalanceRecordByUserId,
  updateCryptoBalanceRecord
} from '@/repository/crypto-balance-request-repository';
import { CustomError, logger } from '@motforex/global-libs';

/**
 *  Get crypto balance for a user.
 *
 * @param userId - user id
 * @param email - user email
 * @returns
 */
export async function getCryptoBalance(userId: string, email: string): Promise<CryptoBalanceRecord> {
  try {
    const cryptoBalanceRecord = await getCryptoBalanceRecordByUserId(userId);
    if (!cryptoBalanceRecord) {
      return await createCryptoBalanceRecord(
        CryptoBalanceRecordSchema.parse({
          userId,
          email,
          balanceInUsd: 0,
          lastProcessedItemOperation: 'DEPOSIT',
          lastProcessedItemId: 0,
          createdAt: new Date(),
          updatedAt: null,
          updatedBy: email
        })
      );
    }
    return cryptoBalanceRecord;
  } catch (error: unknown) {
    logger.error(`Error occurred on getCryptoBalance: ${error}`);
    throw new CustomError('Failed to get crypto balance');
  }
}

/**
 * Update crypto balance for a user.
 *
 * @param request {UpdateCryptoBalanceRequest} - request object
 * @returns
 */
export async function updateCryptoBalance(request: UpdateCryptoBalanceRequest): Promise<CryptoBalanceRecord> {
  const { id, userId, email, operation, amountInUsd, updatedBy } = UpdateCryptoBalanceRequestSchema.parse(request);
  logger.info(`Updating crypto balance for user: ${userId}-${email}, operation: ${operation}, amount: ${amountInUsd}`);
  try {
    const cryptoBalanceRecord = await getCryptoBalanceRecordByUserId(userId);

    if (!cryptoBalanceRecord) {
      if (operation === 'WITHDRAWAL') throw new CustomError('No balance record exists for withdrawal', 400);

      return await createCryptoBalanceRecord(
        CryptoBalanceRecordSchema.parse({
          userId,
          email,
          balanceInUsd: amountInUsd,
          lastProcessedItemOperation: 'DEPOSIT',
          lastProcessedItemId: id,
          createdAt: new Date(),
          updatedAt: null,
          updatedBy
        })
      );
    }
    logger.info(`Crypto balance record found for user: ${userId}-${email}`);

    let newBalance: number = 0;
    if (operation === 'DEPOSIT') {
      newBalance = cryptoBalanceRecord.balanceInUsd + amountInUsd;
    } else {
      newBalance = cryptoBalanceRecord.balanceInUsd - amountInUsd;
      if (newBalance < 0) {
        logger.info(`Insufficient balance, balance: ${cryptoBalanceRecord.balanceInUsd}, amount: ${amountInUsd}`);
        throw new CustomError('Insufficient balance for withdrawal', 400);
      }
    }
    logger.info(`New balance calculated for user: ${userId}-${email}, new balance: ${newBalance}`);

    const result = await updateCryptoBalanceRecord(
      CryptoBalanceRecordSchema.parse({
        ...cryptoBalanceRecord,
        balanceInUsd: newBalance,
        lastProcessedItemOperation: operation,
        lastProcessedItemId: id,
        updatedAt: new Date()
      })
    );
    logger.info(`Record updated successfully!`);
    return result;
  } catch (error: unknown) {
    logger.error(`Error occurred on updateCryptoBalance: ${error}`);
    throw new CustomError('Failed to update crypto balance');
  }
}
