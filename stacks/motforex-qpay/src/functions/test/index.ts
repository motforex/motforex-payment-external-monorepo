import { createDefaultApiFunction } from '@motforex/global-libs';

export const postTestFunction = createDefaultApiFunction(__dirname, 'postTestFunction', 'post', '/test/test');
