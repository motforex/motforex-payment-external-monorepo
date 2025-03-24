import { sendRequest } from '@motforex/global-libs';
import { API_COINBUYS_BASE } from '@/constants';
import { CoinsbuyAuthTokenResponse, CoinsbuyAuthTokenResponseSchema } from '@/types/coinsbuy.types';

const COINSBUY_USERNAME = process.env.COINSBUY_USERNAME || 'username';
const COINSBUY_PASSWORD = process.env.COINSBUY_PASSWORD || 'password';

export async function getCoinbuysAuthToken() {
  const { data } = await sendRequest<CoinsbuyAuthTokenResponse>({
    url: `${API_COINBUYS_BASE}/token`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json'
    },
    data: {
      data: {
        type: 'auth-token',
        attributes: {
          login: COINSBUY_USERNAME,
          password: COINSBUY_PASSWORD
        }
      }
    }
  });

  const parsedData = CoinsbuyAuthTokenResponseSchema.parse(data);
  return parsedData;
}

export async function refreshCoinbuysAuthToken() {}
