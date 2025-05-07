import { createMerchantInvoice, updateMerchantInvoice } from '@/repository/merchant-invoice';
import { CustomError, logger } from '@motforex/global-libs';
import { getCurrentDateAsString } from '@motforex/global-services';
import { MerchantInvoice, MerchantInvoiceSchema, PaymentRequest, STATUS_PENDING } from '@motforex/global-types';
import { markPaymentInvoiceAsSuccessful, markPaymentInvoiceAsUnsuccessful } from '../merchant-invoice';
import {
  APPLEPAY_MERCHANT_EXPIRY_TIME,
  APPLEPAY_MERCHANT_REGENERATION_COUNT,
  MOTFOREX_APPLEPAY_MERCHANT_KEY
} from './applepay-merch-configs';
import { checkApplePayPayment } from '@motforex/global-services/applepay';

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

/**
 * Regenerates an Apple Pay invoice if the existing one is not paid or if the paid amount doesn't match.
 * @param merchantInvoice - The original MerchantInvoice.
 * @returns The regenerated or updated MerchantInvoice.
 */
export async function regenerateApplePayInvoice(merchantInvoice: MerchantInvoice): Promise<MerchantInvoice> {
  try {
    const { id, providerId, transactionAmount, regenerationCount } = merchantInvoice;
    logger.info(`Regenerating Apple Pay invoice for deposit request: ${id}`);

    if (MOTFOREX_APPLEPAY_MERCHANT_KEY) {
      const paymentStatus = await checkApplePayPayment(MOTFOREX_APPLEPAY_MERCHANT_KEY, providerId);

      logger.info(`BONUM: Payment status for invoice ${providerId}: ${JSON.stringify(paymentStatus)}`);

      // Check if the payment was successful and the amount matches
      if (paymentStatus?.success && paymentStatus.amount === transactionAmount) {
        logger.info(`Existing invoice is already paid with correct amount: ${providerId}`);
        return await markPaymentInvoiceAsSuccessful(merchantInvoice);
      } else if (paymentStatus?.success && paymentStatus.amount !== transactionAmount) {
        logger.error(
          `Payment amount mismatch for invoice: ${providerId}. Expected: ${transactionAmount}, Received: ${paymentStatus.amount}`
        );
        throw new CustomError('Payment amount mismatch', 400);
      }
    } else {
      logger.error('Apple Pay merchant key is missing');
      throw new CustomError('Unable to check payment status', 500);
    }

    logger.info(`The existing invoice is not paid: ${providerId}`);

    const newTransactionId = `${id}${getCurrentDateAsString()}`;
    const newExpiryDate = Date.now() + APPLEPAY_MERCHANT_EXPIRY_TIME;

    const newRegenerationCount = regenerationCount - 1;
    if (newRegenerationCount < 0) {
      throw new CustomError('Regeneration count exhausted', 400);
    }

    const updatedInvoice = await updateMerchantInvoice({
      ...merchantInvoice,
      regenerationCount: newRegenerationCount,
      expiryDate: newExpiryDate,
      providerId: newTransactionId,
      invoiceStatus: STATUS_PENDING,
      executionStatus: STATUS_PENDING,
      message: 'Invoice regenerated successfully'
    });

    logger.info(`Invoice regenerated successfully: ${updatedInvoice.id}`);
    return updatedInvoice;
  } catch (error: unknown) {
    logger.error(`Error regenerating Apple Pay invoice: ${JSON.stringify(error)}`);
    await markPaymentInvoiceAsUnsuccessful(merchantInvoice);
    throw new CustomError(`Unable to regenerate invoice`, 500);
  }
}
