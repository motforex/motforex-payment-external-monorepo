import {
  createAdminAuthApiGatewayFunc,
  createScheduledFunc,
  createUserAuthApiGatewayFunc
} from '@motforex/global-libs';

export const handleQpayToken = createScheduledFunc(__dirname, 'handleQpayToken', ['cron(0 0/12 * * ? *)']);

export const postCreateQpayInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'createQpayInvoice',
  'post',
  '/v1/invoice/{id}'
);

export const postCheckQpayInvoiceAsClient = createUserAuthApiGatewayFunc(
  __dirname,
  'checkQpayInvoiceAsClient',
  'post',
  '/v1/invoice/{id}/check'
);

export const postCheckQpayInvoiceAsAdmin = createAdminAuthApiGatewayFunc(
  __dirname,
  'checkQpayInvoiceAsAdmin',
  'post',
  '/b1/invoice/admin/{id}/check'
);

export const getHandleQpayInvoiceCallback = createUserAuthApiGatewayFunc(
  __dirname,
  'getHandleQpayInvoiceCallback',
  'get',
  '/invoice/{id}/callback'
);
