import { createAdminAuthApiGatewayFunc, createDefaultFunc, createUserAuthApiGatewayFunc } from '@motforex/global-libs';

export const handleQpayToken = createDefaultFunc(__dirname, 'handleQpayToken');
export const createQpayInvoice = createUserAuthApiGatewayFunc(__dirname, 'createQpayInvoice', 'post', '/invoice/{id}');

export const checkQpayInvoiceAsClient = createUserAuthApiGatewayFunc(
  __dirname,
  'checkQpayInvoiceAsClient',
  'get',
  '/invoice/{id}'
);

export const checkQpayInvoiceAsAdmin = createAdminAuthApiGatewayFunc(
  __dirname,
  'checkQpayInvoiceAsAdmin',
  'get',
  '/invoice/admin/{id}'
);
