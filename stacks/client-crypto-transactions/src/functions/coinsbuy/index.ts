import { createUserAuthApiGatewayFunc } from '@motforex/global-libs';

export const createCoinbuysInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'createCoinbuysInvoice',
  'post',
  '/v1/crypto-invoice/{id}'
);

export const checkCoinsbuyInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'checkCoinsbuyInvoice',
  'post',
  '/v1/crypto-invoice/{id}'
);

export const callbackCoinbuysInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'callbackCoinbuysInvoice',
  'post',
  '/v1/crypto-invoice/{id}/callback'
);
