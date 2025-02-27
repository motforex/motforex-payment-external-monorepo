import { z } from 'zod';

export const InvoiceReferenceSchema = z.object({});

export const EventPurchaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  // invoice info
  eventName: z.string(),
  invoice: z.string(),
  invoiceReference: z.string(),
  conversionRate: z.number(),
  transactionCurrency: z.string(),
  amountInUsd: z.number(),
  amountInTransactionCurrency: z.number(),
  referenceDate: z.number(),
  metadata: z.record(z.any()).nullable(),
  // search keys
  userIdEventName: z.string(), // email + eventName
  userIdReferenceDate: z.string(), // email + referenceDate
  userIdReferenceDateEventName: z.string(), // email + referenceDate + eventName
  // status
  status: z.enum(['PENDING', 'PAID', 'FAILED']),
  message: z.string(),
  postDate: z.string(),
  createdAt: z.number(),
  updatedAt: z.number()
});

export type EventPurchase = z.infer<typeof EventPurchaseSchema>;
