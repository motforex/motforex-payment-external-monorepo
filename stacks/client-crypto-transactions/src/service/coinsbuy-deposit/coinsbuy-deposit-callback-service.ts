import type { CoinsbuyDeposit, CoinsbuyTransferIncluded } from '@/types/coinsbuy.types';

import { logger } from '@motforex/global-libs';
import { getValidMerchantInvoiceById } from '../merchant-invoice';
import { MerchantInvoice, STATUS_PENDING } from '@motforex/global-types';
import { markCoinsbuyInvoiceAsExecuted } from '../merchant-invoice';

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

    // If the status is 2(Created but hasn't been paid yet), we need to update the invoice
    if (statusNumber === 2) {
      logger.info('Coinsbuy deposit invoice is created but not paid yet');
      await handlePartialPayment(merchantInvoice, coinsbuyDeposit);
      return;
    }

    // If the status is 3(Paid), mark invoice as a success
    if (statusNumber === 3) {
      logger.info('Coinsbuy deposit invoice is paid');
      await markCoinsbuyInvoiceAsExecuted(merchantInvoice);
      return;
    }

    logger.info(`Coinsbuy deposit invoice status is invalid to process: ${statusNumber}`);
  } catch (error: unknown) {
    logger.error(`Error in coinsbuyDepositCallbackService: ${error}`);
  }
}

/**
 * Handles partial payment for a Coinsbuy deposit by marking the invoice as executed.
 *
 * @param invoice
 * @param coinsbuyDeposit
 * @returns
 */
export async function handlePartialPayment(invoice: MerchantInvoice, coinsbuyDeposit: CoinsbuyDeposit): Promise<void> {
  const transfers = coinsbuyDeposit.included?.filter((item) => item.type === 'transfer') as CoinsbuyTransferIncluded[];

  if (!transfers || transfers.length === 0) {
    logger.error('Coinsbuy deposit transfer not found');
    return;
  }

  const largestTransfer = transfers.reduce((max, current) => {
    return parseFloat(current.attributes.amount) > parseFloat(max.attributes.amount) ? current : max;
  });
  logger.info(`Coinsbuy deposit transfer: ${JSON.stringify(largestTransfer)}`);

  await markCoinsbuyInvoiceAsExecuted(invoice);
}
