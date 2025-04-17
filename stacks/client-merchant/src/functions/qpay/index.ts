import { createUserAuthApiGatewayFunc } from '@motforex/global-libs';

export const postCreateQpayInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'createQpayInvoice',
  'post',
  '/v1/invoice/qpay/{id}'
);

export const postCheckQpayInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'checkQpayInvoice',
  'post',
  '/v1/invoice/qpay/{id}/check'
);

export const getCallbackQpayInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'getCallbackQpayInvoice',
  'get',
  '/v1/invoice/qpay/{id}/callback'
);
