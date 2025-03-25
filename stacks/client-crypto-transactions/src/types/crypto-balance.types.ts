import { z } from 'zod';

export const CryptoBalanceRecordSchema = z.object({
  email: z.string(),
  userId: z.string(),
  balanceInUsd: z.number(),
  lastProcessedItemOperation: z.enum(['DEPOSIT', 'WITHDRAWAL']),
  lastProcessedItemId: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  updatedBy: z.string()
});

export type CryptoBalanceRecord = z.infer<typeof CryptoBalanceRecordSchema>;

export const UpdateCryptoBalanceRequestSchema = z.object({
  userId: z.string(),
  email: z.string(),
  operation: z.enum(['DEPOSIT', 'WITHDRAWAL']),
  amountInUsd: z.number(),
  updatedBy: z.number()
});

export type UpdateCryptoBalanceRequest = z.infer<typeof UpdateCryptoBalanceRequestSchema>;
