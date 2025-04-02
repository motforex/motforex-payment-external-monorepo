import { createDefaultApiGatewayFunc, createUserAuthApiGatewayFunc } from '@motforex/global-libs';

export const createCoinbuysInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'createCoinbuysInvoice',
  'post',
  '/v1/deposit/{id}'
);

export const checkCoinsbuyInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'checkCoinsbuyInvoice',
  'post',
  '/v1/deposit/{id}/check'
);

export const callbackCoinbuysInvoice = createDefaultApiGatewayFunc(
  __dirname,
  'callbackCoinbuysInvoice',
  'post',
  '/v1/deposit/{id}/callback'
);
