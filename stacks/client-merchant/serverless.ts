import type { AWS } from '@serverless/typescript';
import { postCreateQpayInvoice, postCheckQpayInvoice } from '@/functions/qpay';
import { createGolomtMerchInvoice, createSocialPayInvoice, checkGolomtMerchInvoice } from '@/functions/golomt-merchant';
import { postTestFunction } from '@/functions/test';

const serverlessConfig: AWS = {
  service: 'motforex-client-merchant',
  frameworkVersion: '4',
  app: 'motforex-client-merchant',
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
      MOTFOREX_GOLOMT_MERCHANT_SECRET: '${ssm:/motforex/payments/golomt/card-merchant/secret-key}',
      MOTFOREX_GOLOMT_MERCHANT_TOKEN: '${ssm:/motforex/payments/golomt/card-merchant/token}',
      MOTFOREX_QPAY_USERNAME: '${ssm:/motforex/payments/qpay/username}',
      MOTFOREX_QPAY_PASSWORD: '${ssm:/motforex/payments/qpay/password}'
    }
  },

  functions: {
    // Client qpay functions
    postCreateQpayInvoice,
    postCheckQpayInvoice,
    // Golomt merchant functions
    createGolomtMerchInvoice,
    createSocialPayInvoice,
    checkGolomtMerchInvoice,
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
