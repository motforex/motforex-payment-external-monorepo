import type { AWS } from '@serverless/typescript';
import { postCreateQpayInvoice, postCheckQpayInvoice, getCallbackQpayInvoice } from '@/functions/qpay';
import {
  createGolomtMerchInvoice,
  createSocialPayInvoice,
  checkGolomtMerchInvoice,
  checkSocialpayInvoice,
  receiveMerchantNotification
} from '@/functions/golomt-merchant';
import { checkApplePayInvoice, createApplePayInvoice, processApplePayPayment } from '@/functions/applepay';

const serverlessConfig: AWS = {
  service: 'motforex-client-merchant',
  frameworkVersion: '4',
  app: 'motforex-client-merchant',
  plugins: ['serverless-offline', 'serverless-prune-plugin'],
  provider: {
    name: 'aws',
    stage: "${opt:stage, 'prod'}",
    runtime: 'nodejs20.x',
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
          rateLimit: 100
        }
      }
    },
    iam: { role: 'arn:aws:iam::786487424160:role/payments-service-role' },
    environment: {
      MOTFOREX_GOLOMT_MERCHANT_SECRET: '${ssm:/motforex/payments/golomt/card-merchant/secret-key}',
      MOTFOREX_GOLOMT_MERCHANT_TOKEN: '${ssm:/motforex/payments/golomt/card-merchant/token}',
      MOTFOREX_QPAY_USERNAME: '${ssm:/motforex/payments/qpay/username}',
      MOTFOREX_QPAY_PASSWORD: '${ssm:/motforex/payments/qpay/password}',
      MOTFOREX_APPLEPAY_MERCHANT_KEY: '${ssm:/motforex/payments/applepay/merchant/secret-key}'
    }
  },

  functions: {
    // Client qpay functions
    postCreateQpayInvoice,
    postCheckQpayInvoice,
    getCallbackQpayInvoice,
    // Golomt merchant functions
    createGolomtMerchInvoice,
    createSocialPayInvoice,
    checkGolomtMerchInvoice,
    checkSocialpayInvoice,
    receiveMerchantNotification,
    // Applepay functions
    createApplePayInvoice,
    processApplePayPayment,
    checkApplePayInvoice
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
