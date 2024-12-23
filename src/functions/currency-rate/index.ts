import { createClientAuthApiFunc } from '@libs/generate';

export const getUsdToMntRates = createClientAuthApiFunc(__dirname, 'getUsdToMntRates', 'get', '/v1/rate');
