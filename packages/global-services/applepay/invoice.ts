import { sendRequest, logger } from '@motforex/global-libs';
import { BONUM_PSP_BASE } from './constants';
import { ApplePayInvoiceCheckRes, ApplePayProcessRes } from './applepay.types';

/**
 * Processes an Apple Pay payment by sending the payment token and orderId to Bonum PSP.
 * @param merchantKey The merchant key provided by Bonum PSP for authentication.
 * @param token The payment token received from the Apple Pay client.
 * @param orderId The internal invoice/order ID to associate with the payment.
 * @returns A promise resolving to the payment processing response.
 */
export async function processApplePayPayment(
  merchantKey: string,
  token: string,
  orderId: string
): Promise<ApplePayProcessRes> {
  let parsedToken;
  try {
    parsedToken = JSON.parse(token);
    logger.info('Parsed token successfully:', parsedToken);
    const { data } = await sendRequest<ApplePayProcessRes>({
      // url: `https://testpsp.bonum.mn/api/payment/process`,
      url: `${BONUM_PSP_BASE}/api/payment/process`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-merchant-key': merchantKey
      },
      data: {
        token: parsedToken, // Payment token from Apple Pay
        order_id: orderId // Our internal invoice ID
      }
    });

    return data;
  } catch (error: unknown) {
    logger.info(`Error occurred on processApplePayPayment(): ${JSON.stringify(error)}`);
    throw error;
  }
}

/**
 * Checks the status of an Apple Pay payment using the orderId.
 * @param merchantKey The merchant key provided by Bonum PSP for authentication.
 * @param orderId The internal invoice/order ID to check.
 * @returns A promise resolving to an array of transaction details.
 */
export async function checkApplePayPayment(merchantKey: string, orderId: string): Promise<ApplePayInvoiceCheckRes> {
  try {
    const { data } = await sendRequest<ApplePayInvoiceCheckRes>({
      url: `${BONUM_PSP_BASE}/api/payment-log/read?order_id=${orderId}`,
      // url: `https://testpsp.bonum.mn/api/payment-log/read?order_id=${orderId}`,
      method: 'GET',
      headers: {
        'x-merchant-key': merchantKey
      }
    });

    return data;
  } catch (error: unknown) {
    logger.info(`Error occurred on checkApplePayPayment(): ${JSON.stringify(error)}`);
    throw error;
  }
}
