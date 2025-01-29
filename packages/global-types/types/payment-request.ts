import {
  STATUS_CANCELLED,
  STATUS_EXECUTED,
  STATUS_EXPIRED,
  STATUS_FAILED,
  STATUS_HALTED,
  STATUS_INITIAL,
  STATUS_PAYOUT,
  STATUS_PENDING,
  STATUS_PROCESSING,
  STATUS_REJECTED
} from '../constants';
import { AccountSchema, AmountSchema, CommissionSchema } from './util.types';
import { z } from 'zod';

export const PaymentRequestStatusSchema = z.enum([
  STATUS_INITIAL,
  STATUS_PENDING,
  STATUS_CANCELLED,
  STATUS_EXPIRED,
  STATUS_PROCESSING,
  STATUS_PAYOUT,
  STATUS_HALTED,
  STATUS_FAILED,
  STATUS_EXECUTED,
  STATUS_REJECTED
]);

export type PaymentRequestStatus = z.infer<typeof PaymentRequestStatusSchema>;

export const UpdateHistorySchema = z.object({
  email: z.string(),
  change: z.string(),
  ipAddress: z.string(),
  postDate: z.string(),
  message: z.string()
});

export type UpdateHistory = z.infer<typeof UpdateHistorySchema>;

export const PaymentRequestSchema = z.object({
  id: z.number(),
  userId: z.string(),
  email: z.string(),
  account: AccountSchema,
  chargeAmount: AmountSchema,
  amountWithCommission: AmountSchema,
  amountInUsd: z.number(),
  commission: CommissionSchema.nullable(),
  conversionRate: z.number(),
  transactionCurrency: z.string(),
  // Proof props
  isRequireProof: z.boolean(),
  paymentProof: z.string().nullable(),
  // Amount edit props
  isMetadataRequired: z.boolean(),
  isAmountEditable: z.boolean(),
  isAmountEdited: z.boolean(),
  // Status props
  status: PaymentRequestStatusSchema,
  rejectionMessage: z.string().nullable(),
  paymentMethodId: z.number(),
  paymentMethodTitle: z.string(),
  paymentMethodProfileUrl: z.string(),
  expiryDate: z.number(),
  postDate: z.string(),
  message: z.string(),
  createdAt: z.number(),
  // History
  updateHistory: z.array(UpdateHistorySchema),
  // Search request
  statusSearchKey: z.string(), // dashpuntsag@motforex.com~PENDING
  methodSearchKey: z.string(), // dashpuntsag@motforex.com~1009
  amountSearchKey: z.string(), // dashpuntsag@motforex.com~1200000
  // Metadata
  metadata: z.record(z.any()).nullable()
});

export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;

export const CreatePaymentRequestSchema = z.object({
  amountWithCommission: AmountSchema,
  account: AccountSchema,
  paymentMethodId: z.number(),
  metadata: z.object({}).passthrough().optional()
});

export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;
