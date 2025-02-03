import type { PaymentInvoice } from '@motforex/global-types';

import { formatApiResponse } from '@motforex/global-libs';
import { PaymentInvoiceResponseSchema } from '@motforex/global-types';

export function formatInvoiceAsResponse(invoice: PaymentInvoice) {
  const { invoiceStatus, executionStatus, transactionAmount, transactionCurrency, metadata, message } = invoice;
  return formatApiResponse(
    PaymentInvoiceResponseSchema.parse({
      invoiceStatus,
      executionStatus,
      transactionAmount,
      transactionCurrency,
      message,
      metadata
    })
  );
}
