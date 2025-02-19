import { createAdminAuthApiGatewayFunc } from '@motforex/global-libs';

export const getWithdrawExecutions = createAdminAuthApiGatewayFunc(
  __dirname,
  'getWithdrawExecutions',
  'GET',
  '/v1/withdraw-executions'
);

export const getWithdrawExecutionsCount = createAdminAuthApiGatewayFunc(
  __dirname,
  'getWithdrawExecutionsCount',
  'GET',
  '/v1/withdraw-executions/count'
);

export const getWithdrawExecutionById = createAdminAuthApiGatewayFunc(
  __dirname,
  'getWithdrawExecutionById',
  'GET',
  '/v1/withdraw-executions/{id}'
);

export const refreshWithdrawExecution = createAdminAuthApiGatewayFunc(
  __dirname,
  'refreshWithdrawExecution',
  'POST',
  '/v1/withdraw-executions/refresh'
);

export const putWithdrawExecution = createAdminAuthApiGatewayFunc(
  __dirname,
  'putWithdrawExecution',
  'PUT',
  '/v1/withdraw-executions/{id}'
);

export const postSolveWithdrawExecution = createAdminAuthApiGatewayFunc(
  __dirname,
  'postSolveWithdrawExecution',
  'POST',
  '/v1/withdraw-executions/{id}/solve'
);

export const postRevalidateWithdrawExecution = createAdminAuthApiGatewayFunc(
  __dirname,
  'postRevalidateWithdrawExecution',
  'POST',
  '/v1/withdraw-executions/{id}/revalidate'
);

export const postExecuteWithdrawExecution = createAdminAuthApiGatewayFunc(
  __dirname,
  'postExecuteWithdrawExecution',
  'POST',
  '/v1/withdraw-executions/{id}/execute'
);
