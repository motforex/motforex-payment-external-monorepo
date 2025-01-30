import { createAdminAuthApiGatewayFunc, createUserAuthApiGatewayFunc } from '@motforex/global-libs';

export const createQpayInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'createQpayInvoice',
  'post',
  '/qpay/invoice/{id}'
);

export const checkQpayInvoiceAsClient = createUserAuthApiGatewayFunc(
  __dirname,
  'checkQpayInvoiceAsClient',
  'get',
  '/qpay/invoice/{id}'
);

export const checkQpayInvoiceAsAdmin = createAdminAuthApiGatewayFunc(
  __dirname,
  'checkQpayInvoiceAsAdmin',
  'get',
  '/qpay/invoice/admin'
);
