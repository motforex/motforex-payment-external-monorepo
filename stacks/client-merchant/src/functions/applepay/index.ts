import { createUserAuthApiGatewayFunc } from '@motforex/global-libs';

/**
 * Creates an Apple Pay invoice session for a specific invoice ID.
 * Requires user authentication.
 */
export const createApplePayInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'createApplePayInvoice', // Corresponds to the exported function name in handler.ts
  'post',
  '/v1/invoice/applepay/{id}' // Path to create the Apple Pay session
);

/**
 * Processes the payment token received from Apple Pay for a specific invoice ID.
 * Requires user authentication (implicitly, as it operates on a user's invoice).
 */
export const processApplePayPayment = createUserAuthApiGatewayFunc(
  __dirname,
  'processApplePayPayment', // Corresponds to the exported function name in handler.ts
  'post',
  '/v1/invoice/applepay/{id}/process' // Path to submit the payment token
);

export const checkApplePayInvoice = createUserAuthApiGatewayFunc(
  __dirname,
  'checkApplePayInvoice', // Corresponds to the exported function name in handler.ts
  'post',
  '/v1/invoice/applepay/{id}/check' // Path to check the invoice status
);
