import { z } from 'zod';

export const InvoiceStatusSchema = z.enum(['INITIAL', 'PENDING', 'SUCCESSFUL', 'UNSUCCESSFUL', 'EXPIRED', 'CANCELLED']);

export const PaymentInvoiceSchema = z.object({
  // General config props
  id: z.string(),
  referenceId: z.number(),
  referenceType: z.enum(['DEPOSIT', 'WITHDRAWAL']),
  providerId: z.string(),
  regenerationCount: z.number(),
  expiryDate: z.number(),
  merchantMethod: z.enum(['QPAY', 'SOCIALPAY', 'MERCHANT']),
  userId: z.string(),
  // Amount props
  conversionRate: z.number(),
  transactionAmount: z.number(),
  transactionCurrency: z.string(),
  amountInUsd: z.number(),
  // Status props
  invoiceStatus: InvoiceStatusSchema,
  executionStatus: InvoiceStatusSchema,
  message: z.string().nullable(),
  metadata: z.string().nullable(),
  postDate: z.string(),
  createdAt: z.number()
});

export type PaymentInvoice = z.infer<typeof PaymentInvoiceSchema>;

export const PaymentInvoiceResponseSchema = z.object({
  invoiceStatus: InvoiceStatusSchema,
  executionStatus: InvoiceStatusSchema,
  transactionAmount: z.number(),
  transactionCurrency: z.string(),
  message: z.string().nullable(),
  metadata: z.string().nullable()
});
