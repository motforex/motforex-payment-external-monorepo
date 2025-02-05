import {
  createAdminAuthApiGatewayFunc,
  createScheduledFunc,
  createUserAuthApiGatewayFunc
} from '@motforex/global-libs';

export const handleQpayToken = createScheduledFunc(__dirname, 'handleQpayToken', ['cron(0 0/12 * * ? *)']);

export const postCheckQpayInvoice = createAdminAuthApiGatewayFunc(
  __dirname,
  'postCheckQpayInvoice',
  'post',
  '/v1/qpay/invoice/{id}/check'
);

export const getHandleQpayCallback = createUserAuthApiGatewayFunc(
  __dirname,
  'getHandleQpayCallback',
  'get',
  '/v1/qpay/invoice/{id}/callback'
);
