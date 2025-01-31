import {
  createAdminAuthApiGatewayFunc,
  createScheduledFunc,
  createUserAuthApiGatewayFunc
} from '@motforex/global-libs';

export const handleQpayToken = createScheduledFunc(__dirname, 'handleQpayToken', ['cron(0 0/12 * * ? *)']);
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
