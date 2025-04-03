import { logger, sendRequest } from '@motforex/global-libs';
import { getCoinbuysAuthToken } from './coinsbuy-auth-service';
import { API_COINBUYS_BASE } from '@/constants';
import { CoinsbuyDepositRequestResponse, CoinsbuyDepositRequestResponseSchema } from '@/types/coinsbuy.types';

export async function createCoinbuysInvoice(id: number, amount: number): Promise<CoinsbuyDepositRequestResponse> {
  try {
    const coinsBuyAuthToken = await getCoinbuysAuthToken();

    const { data } = await sendRequest<object>({
      url: `${API_COINBUYS_BASE}/deposit/`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${coinsBuyAuthToken}`,
        'Content-Type': 'application/vnd.api+json'
      },
      data: {
        data: {
          type: 'deposit',
          attributes: {
            label: 'MOTFOREX_DASHBOARD_DEPOSIT',
            tracking_id: `${id}`,
            target_amount_requested: `${amount}`,
            confirmations_needed: 2,
            callback_url: `https://api.motforex.com/crypto/v1/deposit/${id}/callback`,
            payment_page_redirect_url: `https://dashboard.motforex.com/payments/deposit/${id}`,
            payment_page_button_text: 'Back to dashboard'
          },
          relationships: {
            wallet: {
              data: {
                type: 'wallet',
                id: '1177'
              }
            }
          }
        }
      }
    });

    return CoinsbuyDepositRequestResponseSchema.parse(data);
  } catch (error: unknown) {
    logger.info(`Error occurred on createCryptoDeposit: ${error}`);
    throw error;
  }
}
