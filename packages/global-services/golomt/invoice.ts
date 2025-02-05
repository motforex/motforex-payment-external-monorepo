import type { GolomtCreateInvoice as CreateReq, GolomtInvoice, GolomtInvoiceCheck } from './golomt.types';

import { createBearerAuthHeader, logger, sendRequest } from '@motforex/global-libs';
import { generateSha256Checksum } from './utils';
import { GolomtInvoiceCheckSchema, GolomtInvoiceSchema } from './golomt.types';
import { GOLOMT_E_COMMERCE_BASE } from './constants';

const MERCH_RETURN_TYPE = 'GET';
const SOCIAL_DEEPLINK_FLAG = 'Y';

export async function createGolomtMerchInvoice(secret: string, tok: string, req: CreateReq): Promise<GolomtInvoice> {
  try {
    // Extract the required fields from the request
    const { transactionId, amount, callback } = req;
    const checksum = generateSha256Checksum(secret, [transactionId, `${amount}`, MERCH_RETURN_TYPE, callback]);
    console.log('checksum', checksum);
    // Send the request to the Golomt API
    const { data } = await sendRequest<GolomtInvoice>({
      url: `${GOLOMT_E_COMMERCE_BASE}/api/invoice`,
      method: 'POST',
      headers: createBearerAuthHeader(tok),
      data: {
        amount: `${amount}`,
        callback,
        checksum,
        genToken: 'N',
        returnType: MERCH_RETURN_TYPE,
        transactionId,
        socialDeeplink: SOCIAL_DEEPLINK_FLAG
      }
    });

    return GolomtInvoiceSchema.parse(data);
  } catch (error: unknown) {
    logger.info(`Error occurred on createGolomtMerchInvoice(): ${JSON.stringify(error)}`);
    throw error;
  }
}

export async function checkGolomtMerchInvoice(sKey: string, token: string, id: string): Promise<GolomtInvoiceCheck> {
  try {
    const checksum = generateSha256Checksum(sKey, [id, id]);
    const { data } = await sendRequest<GolomtInvoiceCheck>({
      url: `${GOLOMT_E_COMMERCE_BASE}/api/inquiry`,
      method: 'POST',
      headers: createBearerAuthHeader(token),
      data: { checksum, transactionId: id }
    });

    return GolomtInvoiceCheckSchema.parse(data);
  } catch (error: unknown) {
    logger.info(`Error occurred on checkGolomtMerchInvoice(): ${JSON.stringify(error)}`);
    throw error;
  }
}
