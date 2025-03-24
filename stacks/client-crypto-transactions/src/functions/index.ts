import { createUserAuthApiGatewayFunc } from '@motforex/global-libs';

export const createCoinbuysInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'createCoinbuysInvoice',
  'post',
  '/v1/crypto-invoice/{id}'
);
