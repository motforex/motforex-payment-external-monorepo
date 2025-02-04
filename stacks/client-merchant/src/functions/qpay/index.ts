import { createUserAuthApiGatewayFunc } from '@motforex/global-libs';

export const postCreateQpayInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'createQpayInvoice',
  'post',
  '/v1/qpay/invoice/{id}'
);

export const postCheckQpayInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'checkQpayInvoice',
  'post',
  '/v1/qpay/invoice/{id}/check'
);
