import { z } from 'zod';

export const QpayAuthTokenResponseSchema = z.object({
  token_type: z.string(),
  refresh_expires_in: z.number(),
  refresh_token: z.string(),
  access_token: z.string(),
  expires_in: z.number(),
  scope: z.string(),
  session_state: z.string()
});

export type QpayAuthTokenResponse = z.infer<typeof QpayAuthTokenResponseSchema>;

export const QpayCreateInvoiceRequestSchema = z.object({
  invoice_code: z.string(),
  sender_invoice_no: z.string(),
  invoice_receiver_code: z.string(),
  invoice_description: z.string(),
  sender_branch_code: z.string(),
  amount: z.number(),
  callback_url: z.string()
});

export type QpayCreateInvoiceRequest = z.infer<typeof QpayCreateInvoiceRequestSchema>;

export const QpaySimpleInvoiceSchema = z.object({
  invoice_id: z.string(),
  qr_text: z.string(),
  qr_image: z.string(),
  qPay_shortUrl: z.string(),
  urls: z.array(z.object({}))
});

export type QpaySimpleInvoice = z.infer<typeof QpaySimpleInvoiceSchema>;

export const QpayCardTransactionSchema = z.object({
  card_merchant_code: z.string(),
  card_terminal_code: z.string(),
  card_number: z.string(),
  card_type: z.string(),
  is_cross_border: z.boolean(),
  transaction_amount: z.string(),
  transaction_currency: z.string(),
  transaction_date: z.string(),
  transaction_status: z.string(),
  settlement_status: z.string(),
  settlement_status_date: z.string()
});

export type QpayCardTransaction = z.infer<typeof QpayCardTransactionSchema>;

export const QpayP2PTransactionSchema = z.object({
  transaction_bank_code: z.string(),
  account_bank_code: z.string(),
  account_bank_name: z.string(),
  account_number: z.string(),
  status: z.string(),
  amount: z.string(),
  currency: z.string(),
  settlement_status: z.string()
});

export type QpayP2PTransaction = z.infer<typeof QpayP2PTransactionSchema>;

export const QpayGetPaymentSchema = z.object({
  payment_id: z.string(),
  payment_status: z.string(),
  payment_fee: z.string(),
  payment_amount: z.string(),
  payment_currency: z.string(),
  payment_date: z.string(),
  payment_wallet: z.string(),
  object_type: z.string(),
  object_id: z.string(),
  next_payment_date: z.string().nullable(),
  next_payment_datetime: z.string().nullable(),
  transaction_type: z.string().optional(),
  card_transactions: z.array(QpayCardTransactionSchema),
  p2p_transactions: z.array(QpayP2PTransactionSchema)
});

export type QpayGetPayment = z.infer<typeof QpayGetPaymentSchema>;

export const QpayCheckPaymentSchema = z.object({
  count: z.number(),
  paid_amount: z.number().optional(),
  rows: z.array(QpayGetPaymentSchema)
});

export type QpayCheckPayment = z.infer<typeof QpayCheckPaymentSchema>;

export const QpaySimpleResponseSchema = z.object({
  error: z.string(),
  message: z.string()
});

export type QpaySimpleResponse = z.infer<typeof QpaySimpleResponseSchema>;
