import { createUserAuthApiGatewayFunc } from '@motforex/global-libs';

export const createGolomtMerchInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'createGolomtMerchInvoice',
  'post',
  '/v1/invoice/golomt-merchant/{id}'
);

export const createSocialPayInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'createSocialPayInvoice',
  'post',
  '/v1/invoice/socialpay/{id}'
);

export const checkGolomtMerchInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'checkGolomtMerchInvoice',
  'post',
  '/v1/invoice/golomt-merchant/{id}/check'
);

export const checkSocialpayInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'checkSocialpayInvoice',
  'post',
  '/v1/invoice/socialpay/{id}/check'
);
