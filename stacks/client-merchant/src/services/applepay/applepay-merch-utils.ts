import { createMerchantInvoice } from '@/repository/merchant-invoice';
import { logger } from '@motforex/global-libs';
import { getCurrentDateAsString } from '@motforex/global-services';
import { MerchantInvoice, MerchantInvoiceSchema, PaymentRequest, STATUS_PENDING } from '@motforex/global-types';
import { APPLEPAY_MERCHANT_EXPIRY_TIME, APPLEPAY_MERCHANT_REGENERATION_COUNT } from './applepay-merch-configs';

/**
 * Creates a new Apple Pay invoice for a deposit request.
 * @param depositRequest - The payment request details.
 * @param locale - The locale from request metadata (unused here but included for consistency).
 * @returns The created MerchantInvoice.
 */
export async function createApplePayInvoice(depositRequest: PaymentRequest, locale: string): Promise<MerchantInvoice> {
  const { id, userId, transactionCurrency, conversionRate, amountInUsd } = depositRequest;

  const transactionId = `${id}${getCurrentDateAsString()}`;

  const merchantInvoice = await createMerchantInvoice(
    MerchantInvoiceSchema.parse({
      id,
      referenceId: id,
      referenceType: 'DEPOSIT',
      merchantMethod: 'APPLEPAY',
      regenerationCount: APPLEPAY_MERCHANT_REGENERATION_COUNT,
      expiryDate: Date.now() + APPLEPAY_MERCHANT_EXPIRY_TIME,
      providerId: transactionId,
      providerInfo: 'BONUM',
      all: 1,
      userId,
      conversionRate,
      transactionAmount: amountInUsd,
      transactionCurrency,
      amountInUsd,
      invoiceStatus: STATUS_PENDING,
      executionStatus: STATUS_PENDING,
      message: 'Invoice created successfully!',
      metadata: null,
      postDate: new Date().toISOString(),
      createdAt: Date.now()
    })
  );

  logger.info(`Merchant invoice record created successfully: ${merchantInvoice.id}`);

  return merchantInvoice;
}

export const noRegenerateApplePayInvoice = async (merchantInvoice: MerchantInvoice): Promise<MerchantInvoice> =>
  merchantInvoice;
