import type { GolomtMerchantCallbackRequest } from '@/types';
import { handleDefaultError, logger } from '@motforex/global-libs';
import { checkValidMotforexGolomtMerchInvoice } from './motforex-golomt-merch-check';
import { MerchantInvoiceSchema } from '@motforex/global-types';
import { getMerchantInvoiceByQuery } from '@/repository/merchant-invoice';
import { QueryRequest } from '@motforex/dynamo';

export async function receiveGolomtMerchPushNotification(body: GolomtMerchantCallbackRequest): Promise<void> {
  try {
    logger.info(`Received Golomt Merchant push notification: ${JSON.stringify(body)}`);
    const { errorCode, errorDesc, transactionId } = body;

    logger.info(`Push-notification errorCode:${errorCode} errorDesc:${errorDesc}`);

    // Check if the transactionId is valid
    const queryRequest: QueryRequest = {
      indexName: 'providerId-index',
      pKey: transactionId,
      pKeyProp: 'providerId',
      pKeyType: 'S'
    };
    const merchantInvoiceRes = await getMerchantInvoiceByQuery(queryRequest);
    if (merchantInvoiceRes.items.length !== 1) {
      logger.info(`Merchant Invoice not found for transactionId: ${transactionId}`);
      return;
    }

    const merchantInvoice = MerchantInvoiceSchema.parse({});
    // Check MerchantInvoice status
    if (merchantInvoice.invoiceStatus !== 'PENDING') {
      logger.info(`Merchant Invoice is not in PENDING status!`);
      return;
    }
    logger.info(`Merchant invoice is valid to check!`);

    await checkValidMotforexGolomtMerchInvoice(merchantInvoice);
  } catch (error: unknown) {
    handleDefaultError(error);
  }
}
