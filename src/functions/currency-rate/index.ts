import { createAuthApiGatewayFunc } from '@libs/generate';

export const getUsdToMntRates = createAuthApiGatewayFunc(__dirname, 'getUsdToMntRates', 'get', '/v1/usd-rate');
