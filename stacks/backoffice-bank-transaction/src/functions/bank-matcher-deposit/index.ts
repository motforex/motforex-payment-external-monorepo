import { createAdminAuthApiGatewayFunc } from '@motforex/global-libs';

export const getDepositExecutions = createAdminAuthApiGatewayFunc(
  __dirname,
  'getDepositExecutions',
  'GET',
  '/v1/deposit-executions'
);

export const getDepositExecutionsCount = createAdminAuthApiGatewayFunc(
  __dirname,
  'getDepositExecutionsCount',
  'GET',
  '/v1/deposit-executions/count'
);

export const getDepositExecutionById = createAdminAuthApiGatewayFunc(
  __dirname,
  'getDepositExecutionById',
  'GET',
  '/v1/deposit-executions/{id}'
);

export const putDepositExecution = createAdminAuthApiGatewayFunc(
  __dirname,
  'putDepositExecution',
  'PUT',
  '/v1/deposit-executions/{id}'
);

export const postReprocessDepositExecution = createAdminAuthApiGatewayFunc(
  __dirname,
  'postReprocessDepositExecution',
  'POST',
  '/v1/deposit-executions/{id}/reprocess'
);

export const postSolveDepositExecution = createAdminAuthApiGatewayFunc(
  __dirname,
  'postSolveDepositExecution',
  'POST',
  '/v1/deposit-executions/{id}/solve'
);
