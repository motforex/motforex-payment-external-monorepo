import type { PaymentInvoiceResponse } from '@motforex/global-types';

import { STATUS_PENDING } from '@motforex/global-types';
import {
  formatMerchantInvoiceForUser,
  getValidatedInvoiceAndRequest,
  markMerchantInvoiceAsFailed
} from '../merchant-invoice';
import { createNewCryptoDepositInvoice, regenerateCoinsbuyInvoice } from './coinsbuy-deposit-utils-service';
import { CustomError, logger } from '@motforex/global-libs';

/**
 * Validates the deposit request and creates a new CoinsBuy invoice.
 *
 * @param id
 * @returns
 */
export async function createCoinbuysInvoiceByDepositId(id: number, email: string): Promise<PaymentInvoiceResponse> {
  try {
    const { depositRequest, merchantInvoice } = await getValidatedInvoiceAndRequest(id, email);

    if (depositRequest.paymentMethodId !== 1014) {
      logger.info(`Invalid paymentMethodId: ${depositRequest.paymentMethodId}`);
      throw new CustomError('financeMessageErrorInvalidPaymentMethod', 400);
    }

    if (!merchantInvoice) {
      logger.info(`CoinsBuy invoice does not exist for deposit request: ${id}`);
      logger.info(`Creating new CoinsBuy invoice for deposit request: ${id}`);
      return formatMerchantInvoiceForUser(await createNewCryptoDepositInvoice(depositRequest));
    }
    logger.info(`CoinsBuy invoice already exists for deposit request: ${id}`);

    // If the invoice request already exists and status is not PENDING
    if (merchantInvoice.invoiceStatus !== STATUS_PENDING) {
      logger.info(`Invoice status is not pending! Current status: ${merchantInvoice.invoiceStatus}`);
      return formatMerchantInvoiceForUser(merchantInvoice);
    }

    // if the invoice request has expired
    const currentDate = Date.now();
    if (merchantInvoice.expiryDate > currentDate) {
      logger.info(`Invoice hasn't expired yet for deposit request: ${id}`);
      return formatMerchantInvoiceForUser(merchantInvoice);
    }

    // If the invoice request regeneration count is zero
    if (merchantInvoice.regenerationCount <= 0) {
      logger.info(`Invoice regeneration count is zero for deposit request: ${id}`);
      return formatMerchantInvoiceForUser(await markMerchantInvoiceAsFailed(merchantInvoice));
    }

    const newMerchantInvoice = await regenerateCoinsbuyInvoice(merchantInvoice);
    logger.info(`Regenerated CoinsBuy invoice successfully: ${JSON.stringify(newMerchantInvoice)}`);
    return formatMerchantInvoiceForUser(newMerchantInvoice);
  } catch (error: unknown) {
    logger.info(`Error occurred on createCoinbuysInvoiceByDepositId: ${error}`);
    throw error;
  }
}
