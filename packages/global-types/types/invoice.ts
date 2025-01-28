import { z } from 'zod';

export const InvoiceStatusSchema = z.enum(['INITIAL', 'PENDING', 'SUCCESSFUL', 'UNSUCCESSFUL', 'EXPIRED']);

export const InvoiceSchema = z.object({
  // General config props
  id: z.string(),
  referenceId: z.number(),
  method: z.string(),
  regenerationCount: z.number(),
  // Amount props
  transactionAmount: z.number(),
  transactionCurrency: z.string(),
  amountInUsd: z.number(),
  // Status props
  invoiceStatus: InvoiceStatusSchema,
  executionStatus: InvoiceStatusSchema,
  message: z.string(),
  postDate: z.string(),
  createdAt: z.number()
});

export type Invoice = z.infer<typeof InvoiceSchema>;
