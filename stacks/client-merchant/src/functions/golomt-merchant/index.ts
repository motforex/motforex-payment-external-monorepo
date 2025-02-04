import { createUserAuthApiGatewayFunc } from '@motforex/global-libs';

export const createGolomtMerchInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'createGolomtMerchInvoice',
  'post',
  '/v1/golomt-merchant/invoice/{id}'
);

export const createSocialPayInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'createSocialPayInvoice',
  'post',
  '/v1/socialpay/invoice/{id}'
);

export const checkGolomtMerchInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'checkGolomtMerchInvoice',
  'post',
  '/v1/golomt-merchant/invoice/{id}/check'
);
