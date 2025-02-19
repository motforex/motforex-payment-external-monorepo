import { createAdminAuthApiGatewayFunc } from '@motforex/global-libs';

export const getStatementItems = createAdminAuthApiGatewayFunc(
  __dirname,
  'getStatementItems',
  'get',
  '/v1/statement-items'
);

export const getStatementItemsCount = createAdminAuthApiGatewayFunc(
  __dirname,
  'getStatementItemsCount',
  'get',
  '/v1/statement-items/count'
);
