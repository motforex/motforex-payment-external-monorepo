import { z } from 'zod';
import { CustomError, invokeLambdaFunc, logger } from '@motforex/global-libs';

const AUTHORIZATION_FUNCTION_NAME = 'motforex-admin-authentication-prod-verifyPermissionInvoke';

export const AuthorizationCheckResponseSchema = z.object({
  isAuthorized: z.boolean(),
  response: z.object({
    message: z.string(),
    statusCode: z.number()
  })
});

export type AuthorizationCheckResponse = z.infer<typeof AuthorizationCheckResponseSchema>;

export async function verifyPermission(token: string, requiredPermission: string[]): Promise<void> {
  try {
    const result = await invokeLambdaFunc(AUTHORIZATION_FUNCTION_NAME, { body: { token, requiredPermission } });

    if (result.statusCode !== 200) {
      logger.info(`Authorization check result: ${JSON.stringify(result)}`);
      logger.error(`Failed to get function authorization! Res:${JSON.stringify(result)}`);
      throw new CustomError('unauthorizedRequest', 401);
    }

    const { isAuthorized } = result.body as AuthorizationCheckResponse;

    if (!isAuthorized) {
      logger.error(`Unauthorized request! Res:${JSON.stringify(result)}`);
      throw new CustomError('unauthorizedRequest', 401);
    }
    logger.info(`Authorization check result: ${JSON.stringify(result)}`);
  } catch (error: unknown) {
    logger.warn(`Failed to get function authorization! Error:${JSON.stringify(error)}`);
    throw error;
  }
}
