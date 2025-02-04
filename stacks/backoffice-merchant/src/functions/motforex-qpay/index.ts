import {
  createAdminAuthApiGatewayFunc,
  createScheduledFunc,
  createUserAuthApiGatewayFunc
} from '@motforex/global-libs';

export const handleQpayToken = createScheduledFunc(__dirname, 'handleQpayToken', ['cron(0 0/12 * * ? *)']);

export const postCheckQpayInvoiceAsAdmin = createAdminAuthApiGatewayFunc(
  __dirname,
  'checkQpayInvoice',
  'post',
  '/v1/qpay/invoice/admin/{id}/check'
);

export const getHandleQpayInvoiceCallback = createUserAuthApiGatewayFunc(
  __dirname,
  'getHandleQpayInvoiceCallback',
  'get',
  '/v1/qpay/invoice/{id}/callback'
);
