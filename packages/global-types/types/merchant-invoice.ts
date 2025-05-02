// /packages/merchant-invoice/src/merchant-invoice.ts

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
import { z } from 'zod';

export const InvoiceStatusSchema = z.enum([
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

export const MerchantInvoiceSchema = z.object({
  // General config props
  id: z.number(),
  referenceId: z.number(),
  referenceType: z.string(),
  merchantMethod: z.enum(['QPAY', 'SOCIALPAY', 'MERCHANT', 'COINSBUY', 'APPLEPAY']),
  userId: z.string(),
  // Invoice props
  providerId: z.string(),
  providerInfo: z.string().nullable(),
  regenerationCount: z.number(),
  expiryDate: z.number(),
  // Amount props
  conversionRate: z.number(),
  transactionAmount: z.number(),
  transactionCurrency: z.string(),
  amountInUsd: z.number(),
  all: z.number(),
  // Status props
  invoiceStatus: InvoiceStatusSchema,
  executionStatus: InvoiceStatusSchema,
  message: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  postDate: z.string(),
  createdAt: z.number()
});

export type MerchantInvoice = z.infer<typeof MerchantInvoiceSchema>;

export const PaymentInvoiceResponseSchema = z.object({
  invoiceStatus: InvoiceStatusSchema,
  executionStatus: InvoiceStatusSchema,
  transactionAmount: z.number(),
  // transactionCurrency: z.string(),
  message: z.string().nullable(),
  metadata: z.record(z.any()).nullable()
});

export type PaymentInvoiceResponse = z.infer<typeof PaymentInvoiceResponseSchema>;
