import { createDefaultApiGatewayFunc, createUserAuthApiGatewayFunc } from '@motforex/global-libs';

export const getDemoMastersRate = createUserAuthApiGatewayFunc(
  __dirname,
  'getDemoMastersRate',
  'GET',
  '/v1/demo-masters/rate'
);

export const getDemoMastersInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'getDemoMastersInvoice',
  'GET',
  '/v1/demo-masters/invoice'
);

export const getDemoMastersPurchaseByQuery = createDefaultApiGatewayFunc(
  __dirname,
  'getDemoMastersPurchaseByQuery',
  'GET',
  '/v1/demo-masters/purchase'
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

export const postAdminCheckDemoMastersInvoice = createDefaultApiGatewayFunc(
  __dirname,
  'postAdminCheckDemoMastersInvoice',
  'POST',
  '/v1/demo-masters/invoice/{id}/admin-check'
);

export const getHandleDemoMastersQpayCallback = createDefaultApiGatewayFunc(
  __dirname,
  'getHandleDemoMastersQpayCallback',
  'GET',
  '/v1/demo-masters/invoice/{id}/callback'
);
