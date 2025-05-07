import { z } from 'zod';

export const ApplePayCreateInvoiceSchema = z.object({
  amount: z.number(),
  callback: z.string(),
  transactionId: z.string()
});

export type ApplePayCreateInvoice = z.infer<typeof ApplePayCreateInvoiceSchema>;

export const ApplePayCreateInvoiceRequestSchema = z.object({
  amount: z.string(),
  callback: z.string(),
  checksum: z.string(),
  genToken: z.string(),
  returnType: z.string(),
  transactionId: z.string(),
  socialDeeplink: z.string()
});

export type ApplePayCreateInvoiceRequest = z.infer<typeof ApplePayCreateInvoiceRequestSchema>;

export const ProcessResponseSchema = z.object({
  success: z.boolean(),
  status_code: z.number(),
  orderId: z.string(),
  description: z.string()
});

export const ApplePayProcessBodySchema = z.object({
  paymentToken: z.string().min(1, 'Missing payment token')
});

/**
 * Schema for a single transaction in the /api/payment-log/read response.
 */
export const TransactionSchema = z.object({
  merchant_order_id: z.string(),
  amount: z.number(),
  success: z.boolean(),
  createdAt: z.string()
});

/**
 * Schema for the /api/payment-log/read endpoint response.
 */
export const CheckResponseSchema = z.array(TransactionSchema);

/**
 * Inferred types from the schemas.
 */
export type ApplePayProcessRes = z.infer<typeof ProcessResponseSchema>;
export type ApplePayInvoiceCheckRes = z.infer<typeof TransactionSchema>;
