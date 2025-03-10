import { createAdminAuthApiGatewayFunc, createDefaultApiGatewayFunc } from '@motforex/global-libs';

export const postCheckGolomtMerch = createAdminAuthApiGatewayFunc(
  __dirname,
  'postCheckGolomtMerch',
  'post',
  '/v1/invoice/golomt-merch/{id}/check'
);

export const postReceiveGolomtMerchCallback = createDefaultApiGatewayFunc(
  __dirname,
  'postReceiveGolomtMerchCallback',
  'post',
  '/v1/invoice/golomt-merch/callback'
);
