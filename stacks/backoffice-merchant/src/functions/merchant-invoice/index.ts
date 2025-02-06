import { createAdminAuthApiGatewayFunc } from '@motforex/global-libs';

export const getMerchantInvoiceTableDesc = createAdminAuthApiGatewayFunc(
  __dirname,
  'getMerchantInvoiceTableDesc',
  'get',
  '/v1/invoice/table-desc'
);

export const getMerchantInvoiceByQuery = createAdminAuthApiGatewayFunc(
  __dirname,
  'getMerchantInvoiceByQuery',
  'get',
  '/v1/invoice'
);
