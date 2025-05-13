import type { CoinsbuyDeposit } from '@/types/coinsbuy.types';
import type { MerchantInvoice } from '@motforex/global-types';

import { markCoinsbuyInvoiceAsExecuted, getValidMerchantInvoiceById } from '../merchant-invoice';
import { STATUS_PENDING } from '@motforex/global-types';
import { logger } from '@motforex/global-libs';

/**
 *  Callback service for handling Coinsbuy deposit status updates.
 *
 * @param id
 * @param coinsbuyDeposit
 * @returns
 */
export async function coinsbuyDepositCallbackService(id: number, coinsbuyDeposit: CoinsbuyDeposit): Promise<void> {
  try {
    logger.info(`Current coinsbuy deposit status: ${coinsbuyDeposit.data.attributes.status}`);
    const statusNumber = coinsbuyDeposit.data.attributes.status;

    const merchantInvoice = await getValidMerchantInvoiceById(id, [STATUS_PENDING]);

    if (statusNumber === 3) {
      logger.info('Coinsbuy deposit invoice is paid');
      await validateCallbackAndExecute(merchantInvoice, coinsbuyDeposit);
      return;
    }

    logger.info(`Coinsbuy deposit invoice status is invalid to process: ${statusNumber}`);
  } catch (error: unknown) {
    logger.error(`Error in coinsbuyDepositCallbackService: ${error}`);
  }
}

export async function validateCallbackAndExecute(inv: MerchantInvoice, coinsbuy: CoinsbuyDeposit): Promise<void> {
  try {
    if (inv.transactionAmount !== Number(coinsbuy.data.attributes.target_paid)) {
      logger.info(`Coinsbuy amount is invalid: ${inv.transactionAmount} != ${coinsbuy.data.attributes.target_paid}`);
      return;
    }
    logger.info(`Coinsbuy amount is valid: ${inv.transactionAmount} == ${coinsbuy.data.attributes.target_paid}`);

    logger.info(`Coinsbuy invoice is valid to process: ${inv.id} EXECUTING!`);
    await markCoinsbuyInvoiceAsExecuted(inv);
  } catch (error: unknown) {
    logger.error(`Error in validateCallbackAndExecute: ${error}`);
  }
}
