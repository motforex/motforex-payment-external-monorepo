import type { MerchantInvoice } from '@motforex/global-types';

import { GOLOMT_MERCHANT_SECRET, GOLOMT_MERCHANT_TOKEN } from './golomt-merch-configs';
import { CustomError, logger } from '@motforex/global-libs';
import { markPaymentInvoiceAsSuccessful } from '../merchant-invoice';
import { getValidatedInvoiceAndRequest } from '../motforex-qpay';
import { isPaidOnGolomtMerch } from './golomt-merch-check-utils';

export async function checkMotfxSocialpayInvoice(
  id: number,
  email: string,
  invoiceType: string
): Promise<MerchantInvoice> {
  const { merchantInvoice } = await getValidatedInvoiceAndRequest(id, email, invoiceType);

  if (!merchantInvoice) {
    logger.info(`Golomt-Merchant-Invoice does not exist for deposit request: ${id}`);
    throw new CustomError(`Golomt-Merchant-Invoice does not exist for deposit request: ${id}`, 404);
  }

  if (merchantInvoice.invoiceStatus !== 'PENDING') {
    logger.info(`Golomt-Merchant-Invoice is not in PENDING status for deposit request: ${id}`);
    return merchantInvoice;
  }

  if (!GOLOMT_MERCHANT_SECRET || !GOLOMT_MERCHANT_TOKEN) {
    logger.error('Golomt-Merchant secret or token is not found!');
    throw new CustomError('Unable to process Golomt-Merchant-Invoice', 500);
  }

  // Check if the invoice is paid
  if (await isPaidOnGolomtMerch(GOLOMT_MERCHANT_SECRET, GOLOMT_MERCHANT_TOKEN, merchantInvoice.providerId)) {
    logger.info(`Golomt-Merchant invoice is paid: ${merchantInvoice.providerId}`);
    return await markPaymentInvoiceAsSuccessful(merchantInvoice);
  }

  logger.info(`Golomt-Merchant invoice is not paid: ${merchantInvoice.providerId}`);
  return merchantInvoice;
}
