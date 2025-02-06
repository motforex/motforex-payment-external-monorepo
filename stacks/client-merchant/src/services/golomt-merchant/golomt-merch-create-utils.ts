import { CustomError, logger } from '@motforex/global-libs';
import { createGolomtMerchInvoice, getCurrentDateAsString, GolomtCreateInvoiceSchema } from '@motforex/global-services';
import {
  MerchantInvoice,
  MerchantInvoiceSchema,
  PaymentRequest as Payment,
  STATUS_PENDING
} from '@motforex/global-types';
import {
  GOLOMT_MERCHANT_EXPIRY_TIME,
  GOLOMT_MERCHANT_REGENERATION_COUNT,
  GOLOMT_MERCHANT_SECRET,
  GOLOMT_MERCHANT_TOKEN
} from './golomt-merch-configs';
import { createMerchantInvoice, updateMerchantInvoice } from '@/repository/merchant-invoice';
import { isPaidOnGolomtMerch } from './golomt-merch-check-utils';
import { markPaymentInvoiceAsSuccessful, markPaymentInvoiceAsUnsuccessful } from '../merchant-invoice';

/**
 * Create a new Golomt merchant invoice.
 *
 * @param deposit - The deposit payment request.
 * @param locale - The locale string.
 */
export async function createNewGolomtMerchantInvoice(deposit: Payment, locale: string): Promise<MerchantInvoice> {
  return createInvoiceForDeposit(deposit, locale, 'MERCHANT', 'payments');
}

/**
 * Create a new Socialpay invoice.
 *
 * @param depositRequest - The deposit payment request.
 * @param locale - The locale string.
 */
export async function createNewSocialpayInvoice(depositRequest: Payment, locale: string): Promise<MerchantInvoice> {
  return createInvoiceForDeposit(depositRequest, locale, 'SOCIALPAY', 'socialpay');
}

/**
 * Regenerate a Golomt merchant invoice.
 *
 * @param merchantInvoice - The invoice to regenerate.
 */
export async function regenerateGolomtMerchantInvoice(merchantInvoice: MerchantInvoice): Promise<MerchantInvoice> {
  return regenerateInvoice(merchantInvoice, 'payment');
}

/**
 * Regenerate a Socialpay invoice.
 *
 * @param merchantInvoice - The invoice to regenerate.
 */
export async function regenerateSocialpayInvoice(merchantInvoice: MerchantInvoice): Promise<MerchantInvoice> {
  return regenerateInvoice(merchantInvoice, 'socialpay');
}

/**
 * Returns the locale extracted from a URL or defaults to 'mn'.
 */
function getLocaleFromUrl(url: string): string {
  if (!url || url.length < 3) return 'mn';
  const localeMatch = url.match(/\/[a-zA-Z]+\/([a-zA-Z]{2})\//);
  return localeMatch && localeMatch[1] ? localeMatch[1] : 'mn';
}

/**
 * A helper function for both creation endpoints. It prepares the invoice
 * creation request, calls the external service, then creates and returns a new MerchantInvoice.
 *
 * @param deposit - Payment request details.
 * @param locale - Locale string.
 * @param merchMethod - Either 'MERCHANT' or 'SOCIALPAY'.
 * @param redirectSegment - The URL segment for the redirect (e.g. 'payments' or 'socialpay').
 */
async function createInvoiceForDeposit(
  deposit: Payment,
  locale: string,
  merchMethod: 'MERCHANT' | 'SOCIALPAY',
  redirectSegment: string
): Promise<MerchantInvoice> {
  const { id, conversionRate, amountInUsd, amountWithCommission, transactionCurrency, userId } = deposit;
  // For now the amount is hardcoded as 10.
  const transactionAmount = 10;
  // const transactionAmount = amountWithCommission.amount * conversionRate;

  logger.info(`Initial amount: ${amountWithCommission.amount}, Conversion rate: ${conversionRate}`);
  logger.info(`The converted AmountInMNT: ${transactionAmount}`);

  // Validate the credentials
  if (!GOLOMT_MERCHANT_SECRET || !GOLOMT_MERCHANT_TOKEN) {
    logger.error('Golomt merchant secret or token is not found!');
    throw new CustomError('Unable to generate merchant invoice', 500);
  }

  // Prepare the request for Golomt
  const invoiceRequest = GolomtCreateInvoiceSchema.parse({
    amount: transactionAmount,
    transactionId: `${id}${getCurrentDateAsString()}`,
    callback: `https://dashboard.motforex.com/payments/deposit/${id}`
  });

  const { invoice, socialDeeplink, transactionId } = await createGolomtMerchInvoice(
    GOLOMT_MERCHANT_SECRET,
    GOLOMT_MERCHANT_TOKEN,
    invoiceRequest
  );
  logger.info(`Golomt merchant invoice created successfully: ${JSON.stringify(invoice)}`);

  // Prepare the merchant invoice record
  const merchantInvoice = await createMerchantInvoice(
    MerchantInvoiceSchema.parse({
      id,
      referenceId: id,
      referenceType: 'DEPOSIT',
      providerId: transactionId,
      providerInfo: invoice,
      regenerationCount: GOLOMT_MERCHANT_REGENERATION_COUNT,
      expiryDate: Date.now() + GOLOMT_MERCHANT_EXPIRY_TIME,
      merchantMethod: merchMethod,
      all: 1,
      userId,
      conversionRate,
      transactionAmount,
      transactionCurrency,
      amountInUsd,
      invoiceStatus: STATUS_PENDING,
      executionStatus: STATUS_PENDING,
      message: 'Invoice created successfully!',
      metadata: {
        socialDeeplink,
        redirectUrl: `https://ecommerce.golomtbank.com/${redirectSegment}/${locale}/${invoice}`
      },
      postDate: new Date().toISOString(),
      createdAt: Date.now()
    })
  );
  logger.info(`Merchant invoice record created successfully: ${merchantInvoice.id}`);

  return merchantInvoice;
}

/**
 * A helper function for regenerating invoices.
 *
 * @param merchantInvoice - The original MerchantInvoice.
 * @param redirectSegment - The URL segment for the redirect (e.g. 'payments' or 'socialpay').
 */
async function regenerateInvoice(merchantInvoice: MerchantInvoice, redirectSegment: string): Promise<MerchantInvoice> {
  try {
    const { id, providerId, transactionAmount, metadata } = merchantInvoice;
    logger.info(`Regenerating invoice for deposit request: ${id}`);

    // Validate the credentials
    if (!GOLOMT_MERCHANT_SECRET || !GOLOMT_MERCHANT_TOKEN) {
      logger.error('Golomt merchant secret or token is not found!');
      throw new CustomError('Unable to generate merchant invoice', 500);
    }

    // If the existing invoice is already paid, mark it as successful.
    if (await isPaidOnGolomtMerch(GOLOMT_MERCHANT_SECRET, GOLOMT_MERCHANT_TOKEN, providerId)) {
      return await markPaymentInvoiceAsSuccessful(merchantInvoice);
    }
    logger.info(`The existing invoice is not paid: ${providerId}`);

    // Create a new invoice
    logger.info(`Creating a new Golomt merchant invoice for deposit request: ${id}`);
    const invoiceRequest = GolomtCreateInvoiceSchema.parse({
      amount: transactionAmount,
      transactionId: `${id}${getCurrentDateAsString()}`,
      callback: `https://dashboard.motforex.com/payments/deposit/${id}`
    });
    const { invoice, socialDeeplink, transactionId } = await createGolomtMerchInvoice(
      GOLOMT_MERCHANT_SECRET,
      GOLOMT_MERCHANT_TOKEN,
      invoiceRequest
    );
    logger.info(`New Golomt merchant invoice created: ${JSON.stringify(invoice)}`);

    const locale = getLocaleFromUrl(metadata?.redirectUrl || '');
    const updatedInvoice = await updateMerchantInvoice(
      {
        ...merchantInvoice,
        regenerationCount: merchantInvoice.regenerationCount - 1,
        expiryDate: Date.now() + GOLOMT_MERCHANT_EXPIRY_TIME,
        providerId: transactionId,
        providerInfo: invoice,
        metadata: {
          socialDeeplink,
          redirectUrl: `https://ecommerce.golomtbank.com/${redirectSegment}/${locale}/${invoice}`
        }
      },
      'providerId = :oldProviderId',
      { ':oldProviderId': merchantInvoice.providerId }
    );

    logger.info(`Invoice regenerated successfully: ${updatedInvoice.id}`);
    return updatedInvoice;
  } catch (error: unknown) {
    logger.error(`Error regenerating invoice: ${JSON.stringify(error)}`);
    await markPaymentInvoiceAsUnsuccessful(merchantInvoice);
    throw new CustomError(`Unable to generate`, 500);
  }
}
