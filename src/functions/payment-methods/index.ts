import { createClientAuthApiFunc } from '@libs/generate';

export const getUserPaymentMethodById = createClientAuthApiFunc(
  __dirname,
  'getUserPaymentMethodById',
  'get',
  '/v1/payment-methods/{id}'
);

export const getUserPaymentMethodsByType = createClientAuthApiFunc(
  __dirname,
  'getUserPaymentMethodsByType',
  'get',
  '/v1/payment-methods'
);
