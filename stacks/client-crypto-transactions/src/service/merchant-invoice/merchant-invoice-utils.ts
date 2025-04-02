import { MerchantInvoice, PaymentInvoiceResponse } from '@motforex/global-types';

export function formatMerchantInvoiceForUser(merchantInvoice: MerchantInvoice): PaymentInvoiceResponse {
  const { invoiceStatus, executionStatus, transactionAmount, message, metadata } = merchantInvoice;

  return {
    invoiceStatus,
    executionStatus,
    transactionAmount,
    message,
    metadata
  };
}
