import { createDefaultFunc, createUserAuthApiGatewayFunc } from '@motforex/global-libs';

export const getCryptoBalanceByApi = createUserAuthApiGatewayFunc(
  __dirname,
  'getCryptoBalanceByApi',
  'get',
  '/v1/crypto'
);

export const updateCryptoBalancePrivately = createDefaultFunc(__dirname, 'updateCryptoBalancePrivately');
