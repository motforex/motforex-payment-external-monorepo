import type { MerchantInvoice, PaymentRequest } from '@motforex/global-types';

import { MerchantInvoiceSchema, STATUS_PENDING } from '@motforex/global-types';
import { createCoinbuysInvoice } from '../coinbuys';
import { createMerchantInvoice, updateMerchantInvoice } from '@/repository/merchant-invoice';
import { COINSBUY_EXPIRY_TIME } from '@/constants';
import { logger } from '@motforex/global-libs';

/**
 *  Creates a new CoinsBuy invoice for the deposit request.
 *
 * @param depositRequest
 * @returns
 */
export async function createNewCryptoDepositInvoice(depositRequest: PaymentRequest): Promise<MerchantInvoice> {
  try {
    const { id, conversionRate, amountInUsd, amountWithCommission, transactionCurrency, userId } = depositRequest;
    const { data: coinsBuyInvoice } = await createCoinbuysInvoice(id, amountWithCommission.amount);
    logger.info(`CoinsBuy invoice created successfully: ${JSON.stringify(coinsBuyInvoice.id)}`);

    const merchantInvoice = await createMerchantInvoice(
      MerchantInvoiceSchema.parse({
        id: id,
        referenceId: id,
        referenceType: 'DEPOSIT',
        providerId: coinsBuyInvoice.id,
        providerInfo: `TRACKING_ID:${coinsBuyInvoice.attributes.tracking_id}`,
        regenerationCount: 10,
        expiryDate: Date.now() + COINSBUY_EXPIRY_TIME,
        merchantMethod: 'COINSBUY',
        userId: userId,
        all: 1,
        // Amount props
        conversionRate,
        transactionAmount: amountWithCommission.amount,
        transactionCurrency,
        amountInUsd,
        // Status props
        invoiceStatus: STATUS_PENDING,
        executionStatus: STATUS_PENDING,
        message: 'Qpay invoice created successfully',
        metadata: {
          urlLink: coinsBuyInvoice.attributes.payment_page
        },
        postDate: new Date().toISOString(),
        createdAt: Date.now()
      })
    );

    logger.info(`CoinsBuy invoice created successfully: ${JSON.stringify(merchantInvoice)}`);
    return merchantInvoice;
  } catch (error: unknown) {
    logger.info(`Error occurred on createNewCryptoDepositInvoice: ${error}`);
    throw error;
  }
}

export async function regenerateCoinsbuyInvoice(merchantInvoice: MerchantInvoice): Promise<MerchantInvoice> {
  try {
    const { id, transactionAmount, regenerationCount, providerId } = merchantInvoice;
    logger.info(`Regenerating CoinsBuy invoice for deposit request: ${id}`);

    const { data: coinsbuyInvoice } = await createCoinbuysInvoice(id, transactionAmount);
    logger.info(`CoinsBuy invoice regenerated successfully: ${JSON.stringify(coinsbuyInvoice.id)}`);

    const updatedMerchantInvoice = await updateMerchantInvoice(
      {
        ...merchantInvoice,
        providerId: providerId,
        providerInfo: `TRACKING_ID:${coinsbuyInvoice.attributes.tracking_id}`,
        regenerationCount: regenerationCount - 1,
        expiryDate: Date.now() + COINSBUY_EXPIRY_TIME,
        metadata: {
          urlLink: coinsbuyInvoice.attributes.payment_page
        }
      },
      `#status = :pending`,
      { ':pending': STATUS_PENDING }
    );
    logger.info(`CoinsBuy invoice updated successfully: ${JSON.stringify(updatedMerchantInvoice)}`);
    return updatedMerchantInvoice;
  } catch (error: unknown) {
    logger.info(`Error occurred on regenerateCoinsbuyInvoice: ${error}`);
    throw error;
  }
}
