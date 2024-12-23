import type { AWS } from '@serverless/typescript';

import { getUsdToMntRates } from '@functions/currency-rate';
import { getUserPaymentMethodById, getUserPaymentMethodsByType } from '@functions/payment-methods';

const serverlessConfig: AWS = {
  service: 'motforex-client-configs',
  frameworkVersion: '4',
  app: 'motforex-client-configs',
  plugins: ['serverless-offline', 'serverless-prune-plugin'],
  provider: {
    name: 'aws',
    stage: "${opt:stage, 'prod'}",
    runtime: 'nodejs18.x',
    region: 'ap-southeast-1',
    profile: 'default',
    logRetentionInDays: 365,
    timeout: 29,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    iam: { role: 'arn:aws:iam::786487424160:role/payments-service-role' },
    environment: {},
  },
  functions: {
    getUsdToMntRates,
    getUserPaymentMethodById,
    getUserPaymentMethodsByType,
  },
  package: { individually: true },
  resources: {
    Resources: {
      GatewayResponseDefault4XX: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
    },
  },
  custom: {
    prune: {
      automatic: true,
      number: 2,
    },
    function_timeout: {
      ain: 29,
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk', 'pg-hstore'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfig;
