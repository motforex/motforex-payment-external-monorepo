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
  const { id, userId, transactionCurrency, conversionRate, amountInUsd, amountWithCommission } = depositRequest;

  // const transactionAmount = amountWithCommission.amount * conversionRate;
  // For Apple Pay, the amount is in MNT.
  // We are using a fixed transaction amount of 1 for the sake of this example.
  const transactionAmount = 1;

  const transactionId = `${id}${getCurrentDateAsString()}`;

  logger.info(`Initial amount: ${amountWithCommission.amount}, Conversion rate: ${conversionRate}`);
  logger.info(`The converted AmountInMNT: ${transactionAmount}`);

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
      transactionAmount,
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
