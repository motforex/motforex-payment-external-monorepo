import { createAdminAuthApiGatewayFunc, createDefaultApiGatewayFunc, createScheduledFunc } from '@motforex/global-libs';

export const handleQpayToken = createScheduledFunc(__dirname, 'handleQpayToken', ['cron(0 0/12 * * ? *)']);

export const postCheckQpayInvoice = createAdminAuthApiGatewayFunc(
  __dirname,
  'postCheckQpayInvoice',
  'post',
  '/v1/invoice/qpay/{id}/check'
);

export const getHandleQpayCallback = createDefaultApiGatewayFunc(
  __dirname,
  'getHandleQpayCallback',
  'get',
  '/v1/invoice/qpay/{id}/callback'
);
