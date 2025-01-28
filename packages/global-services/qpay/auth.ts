import type { QpayAuthTokenResponse } from './qpay.types';
import { QPAY_BASE_URL } from './constants';
import { createBasicAuthHeader, createBearerAuthHeader, logger, sendRequest } from '@motforex/global-libs';

/**
 * Obtains an authentication token using Basic Auth.
 * @param username - The username for basic auth.
 * @param password - The password for basic auth.
 * @returns The authentication token response.
 */
export async function getQpayAuthToken(username: string, password: string): Promise<QpayAuthTokenResponse> {
  try {
    const { data } = await sendRequest<QpayAuthTokenResponse>({
      url: `${QPAY_BASE_URL}/auth/token`,
      method: 'POST',
      headers: createBasicAuthHeader(username, password)
    });
    return data;
  } catch (error: unknown) {
    logger.error(`Error occurred on getQpayAuthToken(): ${JSON.stringify(error)}`);
    throw error;
  }
}

/**
 * Refreshes the authentication token using the existing Bearer token.
 * @param token - The current Bearer token.
 * @returns The new authentication token response.
 */
export async function refreshQpayAuthToken(refreshToken: string): Promise<QpayAuthTokenResponse> {
  try {
    const { data } = await sendRequest<QpayAuthTokenResponse>({
      url: `${QPAY_BASE_URL}/auth/refresh`,
      method: 'POST',
      headers: createBearerAuthHeader('refresh_token', refreshToken)
    });
    return data;
  } catch (error: unknown) {
    logger.error(`Error occurred on refreshQpayAuthToken: ${JSON.stringify(error)}`);
    throw error;
  }
}
