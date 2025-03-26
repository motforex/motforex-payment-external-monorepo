import { createDefaultFunc, createUserAuthApiGatewayFunc } from '@motforex/global-libs';

export const getCryptoBalanceByApi = createUserAuthApiGatewayFunc(
  __dirname,
  'getCryptoBalanceByApi',
  'get',
  '/v1/balance'
);

export const updateCryptoBalancePrivately = createDefaultFunc(__dirname, 'updateCryptoBalancePrivately');

export const getCryptoBalancePrivately = createDefaultFunc(__dirname, 'getCryptoBalancePrivately');
