import { logger, sendRequest } from '@motforex/global-libs';
import { PaymentRequest } from '@motforex/global-types';
import { getCoinbuysAuthToken } from './coinbuys-auth-service';
import { API_COINBUYS_BASE } from '@/constants';

export async function createCoinbuysInvoice(depositRequest: PaymentRequest): Promise<object> {
  try {
    const coinsBuyAuthToken = await getCoinbuysAuthToken();

    const response = await sendRequest({
      url: `${API_COINBUYS_BASE}/deposit/`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json'
      },
      data: {
        data: {
          type: 'deposit',
          attributes: {
            tracking_id: '',
            callback_url: '',
            payment_page_redirect_url: '',
            payment_page_button_text: ''
          }
        }
      }
    });

    return {};
  } catch (error: unknown) {
    logger.info(`Error occurred on createCryptoDeposit: ${error}`);
    throw error;
  }
}
