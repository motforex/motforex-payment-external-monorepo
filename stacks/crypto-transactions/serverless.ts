import type { AWS } from '@serverless/typescript';

const serverlessConfig: AWS = {
  service: 'crypto-transactions',
  frameworkVersion: '4',
  app: 'crypto-transactions',
  plugins: ['serverless-offline', 'serverless-prune-plugin'],
  provider: {
    name: 'aws',
    stage: "${opt:stage, 'prod'}",
    runtime: 'nodejs20.x',
    region: 'ap-southeast-1',
    profile: 'default',
    logRetentionInDays: 365,
    timeout: 29,
    memorySize: 512,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
      usagePlan: {
        throttle: {
          burstLimit: 150,
          rateLimit: 100 // Average number of requests per second
        }
      }
    },
    iam: { role: 'arn:aws:iam::786487424160:role/payments-service-role' },
    environment: {}
  },
  functions: {},
  package: { individually: true },
  custom: {
    prune: {
      automatic: true,
      number: 2
    },
    function_timeout: {
      ain: 29
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk', 'pg-hstore'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10
    }
  }
};

module.exports = serverlessConfig;
