import type { AWS } from '@serverless/typescript';
import { postCheckGolomtMerch, postReceiveGolomtMerchCallback } from '@/functions/golomt-merchant';
import { handleQpayToken, postCheckQpayInvoice, getHandleQpayCallback } from '@/functions/qpay';
import { postTestFunction } from '@/functions/test';

const serverlessConfig: AWS = {
  service: 'motforex-backoffice-merchant',
  frameworkVersion: '4',
  app: 'motforex-backoffice-merchant',
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
      usagePlan: {
        throttle: {
          burstLimit: 150,
          rateLimit: 100 // Average number of requests per second
        }
      }
    },
    iam: { role: 'arn:aws:iam::786487424160:role/payments-service-role' },
    environment: {
      MOTFOREX_QPAY_USERNAME: '${ssm:/motforex/payments/qpay/username}',
      MOTFOREX_QPAY_PASSWORD: '${ssm:/motforex/payments/qpay/password}'
    }
  },

  functions: {
    // Golomt merchant functions
    postCheckGolomtMerch,
    postReceiveGolomtMerchCallback,
    // Qpay functions
    handleQpayToken,
    postCheckQpayInvoice,
    getHandleQpayCallback,
    // Test function
    postTestFunction
  },
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
