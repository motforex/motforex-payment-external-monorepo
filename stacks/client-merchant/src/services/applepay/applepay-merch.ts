import type { MerchantInvoice } from '@motforex/global-types';
import { getMerchantInvoiceById, updateMerchantInvoice } from '@/repository/merchant-invoice';
import { processApplePayPayment as processPayment } from '@motforex/global-services/applepay';
import { CustomError, logger } from '@motforex/global-libs';
import { STATUS_EXECUTED, STATUS_FAILED } from '@motforex/global-types';
import { createApplePayInvoice, noRegenerateApplePayInvoice } from './applepay-merch-utils';
import { handleInvoiceCreation } from '../merchant-invoice';

import { checkApplePayPayment as checkPayment } from '@motforex/global-services/applepay';
import { markPaymentInvoiceAsSuccessful, markPaymentInvoiceAsUnsuccessful } from '../merchant-invoice';
import { getValidatedInvoiceAndRequest } from '../merchant-invoice';
import { MOTFOREX_APPLEPAY_MERCHANT_KEY } from './applepay-merch-configs';

export async function createMotforexApplepayInvoice(
  id: number,
  email: string,
  locale: string
): Promise<MerchantInvoice> {
  return handleInvoiceCreation({
    id,
    email,
    locale,
    createNewInvoice: createApplePayInvoice,
    regenerateInvoice: noRegenerateApplePayInvoice,
    invoiceType: 'APPLEPAY'
  });
}

export async function processMotforexApplepayPayment(
  invoiceId: number,
  paymentToken: string
): Promise<MerchantInvoice> {
  const invoice = await getMerchantInvoiceById(invoiceId);
  if (!invoice || invoice.invoiceStatus !== 'PENDING') {
    throw new CustomError('Invalid invoice status', 400);
  }

  try {
    if (!MOTFOREX_APPLEPAY_MERCHANT_KEY) {
      logger.error('BONUM_MERCHANT_KEY env variable is missing');
      throw new CustomError('Unable to process ApplePay invoice', 500);
    }

    const result = await processPayment(MOTFOREX_APPLEPAY_MERCHANT_KEY, paymentToken, invoice.id.toString());

    if (result.success) {
      invoice.invoiceStatus = STATUS_EXECUTED;
      invoice.executionStatus = STATUS_EXECUTED;
      invoice.message = 'Payment successful';
      invoice.metadata = result;
    } else {
      invoice.invoiceStatus = STATUS_FAILED;
      invoice.executionStatus = STATUS_FAILED;
      invoice.message = result.description || 'Payment failed';
    }
  } catch (error) {
    invoice.invoiceStatus = STATUS_FAILED;
    invoice.executionStatus = STATUS_FAILED;
    invoice.message = 'Payment processing error';
    if (error instanceof Error) invoice.metadata = { error: error.message };
  }

  await updateMerchantInvoice(invoice);
  return invoice;
}

/**
 * Checks an Apple Pay invoice against Bonum PSP, updating its status locally.
 *
 * @param id    Deposit-request / invoice id.
 * @param email E-mail of the authenticated user (used for validation).
 * @returns     The (possibly updated) MerchantInvoice.
 */
export async function checkMotforexApplepayInvoice(id: number, email: string): Promise<MerchantInvoice> {
  // ---------------------------------------------------------------------------
  // 1. Validate ownership & fetch invoice / deposit-request metadata
  // ---------------------------------------------------------------------------
  const { merchantInvoice } = await getValidatedInvoiceAndRequest(id, email, 'APPLEPAY');

  if (!merchantInvoice) {
    logger.info(`ApplePay invoice does not exist for deposit request: ${id}`);
    throw new CustomError(`ApplePay invoice does not exist for deposit request: ${id}`, 404);
  }

  // Fast-path: already finalised
  if (merchantInvoice.invoiceStatus !== 'PENDING') {
    logger.info(`ApplePay invoice already in ${merchantInvoice.invoiceStatus} status for deposit request: ${id}`);
    return merchantInvoice;
  }

  // ---------------------------------------------------------------------------
  // 2. Query Bonum PSP for the latest transaction status
  // ---------------------------------------------------------------------------

  if (!MOTFOREX_APPLEPAY_MERCHANT_KEY) {
    logger.error('BONUM_MERCHANT_KEY env variable is missing');
    throw new CustomError('Unable to process ApplePay invoice', 500);
  }

  // NB:  we used invoice.id as order_id when creating / processing the payment
  const pspRes = await checkPayment(MOTFOREX_APPLEPAY_MERCHANT_KEY, merchantInvoice.id.toString());

  logger.info(`ApplePay invoice check response from Bonum PSP: ${JSON.stringify(pspRes)}`);
  // ---------------------------------------------------------------------------
  // 3. Interpret PSP response
  // ---------------------------------------------------------------------------
  /*  Bonum’s response shape (ApplePayInvoiceCheckRes) is still evolving.
      We therefore check a few common fields ­ defensively. */

  const paid =
    (pspRes as any).success === true ||
    (pspRes as any).paid === true ||
    ['SUCCESS', 'COMPLETED', 'PAID', 'EXECUTED'].includes(((pspRes as any).status || '').toString().toUpperCase());

  const failed = ['FAIL', 'FAILED', 'DECLINED', 'CANCELLED'].includes(
    ((pspRes as any).status || '').toString().toUpperCase()
  );

  if (paid) {
    logger.info(`ApplePay invoice PAID on Bonum PSP: ${merchantInvoice.providerId}`);
    return await markPaymentInvoiceAsSuccessful({
      ...merchantInvoice,
      metadata: pspRes
    });
  }

  if (failed) {
    logger.info(`ApplePay invoice FAILED on Bonum PSP: ${merchantInvoice.providerId}`);
    return await markPaymentInvoiceAsUnsuccessful({
      ...merchantInvoice,
      metadata: pspRes
    });
  }

  // Still pending – attach the latest PSP payload for transparency
  merchantInvoice.metadata = pspRes;
  logger.info(`ApplePay invoice still pending on Bonum PSP: ${merchantInvoice.providerId}`);
  return merchantInvoice;
}
