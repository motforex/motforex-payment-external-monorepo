import { createDefaultApiGatewayFunc } from '@motforex/global-libs';

export const postTestFunction = createDefaultApiGatewayFunc(__dirname, 'postTestFunction', 'post', '/test/test');
