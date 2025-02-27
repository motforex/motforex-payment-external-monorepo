import { handleDefaultError, logger } from '@motforex/global-libs';
import { checkDemoMastersInvoice } from './demo-masters-check';

/**
 *  Handle demo masters qpay callback
 *
 * @param id
 *
 */
export async function handleDemoMastersQpayCallback(id: string): Promise<void> {
  try {
    logger.info(`Handling demo masters qpay callback for invoice ${id}`);
    await checkDemoMastersInvoice(id);
  } catch (error: unknown) {
    logger.error(`Error handling demo masters qpay callback for invoice ${id}:`, error);
    handleDefaultError(error);
  }
}
