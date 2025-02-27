import { createUserAuthApiGatewayFunc } from '@motforex/global-libs';

export const getDemoMastersInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'getDemoMastersInvoice',
  'GET',
  '/v1/demo-masters/invoice'
);

export const postCreateDemoMastersInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'postCreateDemoMastersInvoice',
  'POST',
  '/v1/demo-masters/invoice'
);

export const postCheckDemoMastersInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'postCheckDemoMastersInvoice',
  'POST',
  '/v1/demo-masters/invoice/{id}/check'
);

export const getHandleDemoMastersQpayCallback = createUserAuthApiGatewayFunc(
  __dirname,
  'getHandleDemoMastersQpayCallback',
  'GET',
  '/v1/demo-masters/invoice/{id}/callback'
);
