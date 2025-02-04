import { z } from 'zod';

export const GolomtCreateInvoiceSchema = z.object({
  amount: z.number(),
  callback: z.string(),
  transactionId: z.string()
});

export type GolomtCreateInvoice = z.infer<typeof GolomtCreateInvoiceSchema>;

export const GolomtCreateInvoiceRequestSchema = z.object({
  amount: z.string(),
  callback: z.string(),
  checksum: z.string(),
  genToken: z.string(),
  returnType: z.string(),
  transactionId: z.string(),
  socialDeeplink: z.string()
});

export type GolomtCreateInvoiceRequest = z.infer<typeof GolomtCreateInvoiceRequestSchema>;

export const GolomtInvoiceSchema = z.object({
  checksum: z.string(),
  transactionId: z.string(),
  invoice: z.string(),
  socialDeeplink: z.string()
});

export type GolomtInvoice = z.infer<typeof GolomtInvoiceSchema>;

// export type GolomtInvFinalRes = InvoiceRecord & GolomtInvRes;

export const GolomtInvoiceCheckSchema = z.object({
  status: z.string(),
  amount: z.string(),
  bank: z.string(),
  errorDesc: z.string(),
  checksum: z.string(),
  errorCode: z.string().optional(),
  cardHolder: z.string(),
  transactionId: z.string(),
  cardNumber: z.string(),
  token: z.string()
});

export type GolomtInvoiceCheck = z.infer<typeof GolomtInvoiceCheckSchema>;

export const GolomtPaymentInvResSchema = z.object({
  redirectUrl: z.string().optional(),
  socialDeeplink: z.string().optional(),
  status: z.string().optional(),
  amount: z.string().optional(),
  message: z.string().optional(),
  createdAt: z.number().optional()
});

export type GolomtPaymentInvRes = z.infer<typeof GolomtPaymentInvResSchema>;
