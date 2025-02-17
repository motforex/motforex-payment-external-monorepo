import { createAdminAuthApiGatewayFunc } from '@motforex/global-libs';

export const getStatementItems = createAdminAuthApiGatewayFunc(
  __dirname,
  'getStatementItems',
  'get',
  '/v1/statement-items'
);
