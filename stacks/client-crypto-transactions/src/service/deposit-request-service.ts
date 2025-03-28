import { logger } from '@motforex/global-libs';
import { getValidDepositById } from './deposit-utils-service';
import { PaymentInvoiceResponse, STATUS_PENDING } from '@motforex/global-types';
import { createCoinbuysInvoice } from './coinbuys';

export async function createCoinbuysInvoiceByDepositId(id: number): Promise<PaymentInvoiceResponse> {
  try {
    const depositRequest = await getValidDepositById(id, [STATUS_PENDING]);

    const coinsBuyInvoice = await createCoinbuysInvoice(depositRequest);

    return {
      invoiceStatus: STATUS_PENDING,
      executionStatus: STATUS_PENDING,
      transactionAmount: depositRequest.amountWithCommission.amount,
      transactionCurrency: 'USDT',
      message: 'Invoice created successfully',
      metadata: {
        urlLink: coinsBuyInvoice.data.attributes.payment_page
      }
    };
  } catch (error: unknown) {
    logger.info(`Error occurred on createCryptoDeposit: ${error}`);
    throw error;
  }
}
