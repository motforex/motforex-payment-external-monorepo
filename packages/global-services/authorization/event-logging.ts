import {
  checkAuthorization,
  extractMetadata,
  invokeLambdaFunc,
  logger,
  ValidatedAPIGatewayProxyEvent
} from '@motforex/global-libs';
import { z } from 'zod';

const ActionDetailSchema = z.object({
  adminUser: z.string().optional(),
  action: z.string(),
  message: z.string(),
  status: z.string(),
  postDate: z.string()
});

const EventLogDataSchema = z.object({
  email: z.string(),
  actionType: z.string(),
  actionDetails: ActionDetailSchema,
  isAdmin: z.boolean()
});

const AdminLogDataSchema = z.object({
  email: z.string(),
  actionDetails: ActionDetailSchema
});

export type Params = {
  event: ValidatedAPIGatewayProxyEvent<any>;
  actionType: 'AdminAction' | 'UserAction';
  isAdmin: boolean;
  action: string;
  message: string;
  status: string;
};

/**
 * Log user related events. This function is used to log user related events.
 * @param params
 * @returns
 */
export async function logUserRelatedEvent(params: Params): Promise<void> {
  try {
    const { event, action, message, status, isAdmin } = params;
    const { email } = checkAuthorization(extractMetadata(event));

    const data = EventLogDataSchema.parse({
      email: email,
      actionType: isAdmin ? 'AdminAction' : 'UserAction',
      actionDetails: {
        postDate: new Date().toISOString(),
        action,
        message,
        status,
        ...(isAdmin && { adminUser: email })
      },
      isAdmin
    });

    await invokeLambdaFunc(
      'motforex-admin-authentication-prod-eventLogsInvoke',
      {
        body: { identity: event.requestContext.identity, data }
      },
      'Event'
    );
  } catch (error: unknown) {
    logger.error(`Error in logEvent: ${JSON.stringify(error)}`);
  }
}

/**
 * Log admin related events. This function is used to log admin related events.
 *
 * @param params
 * @returns
 */
export async function logAdminRelatedEvents(params: Params): Promise<void> {
  try {
    const { event, action, message, status } = params;
    const { email } = checkAuthorization(extractMetadata(event));

    const data = AdminLogDataSchema.parse({
      email: email,
      actionDetails: {
        postDate: new Date().toISOString(),
        action,
        message,
        status
      }
    });

    await invokeLambdaFunc(
      'motforex-admin-authentication-prod-adminEventLogsInvoke',
      {
        body: { identity: event.requestContext.identity, data }
      },
      'Event'
    );
  } catch (error: unknown) {
    logger.error(`Error in logEvent: ${JSON.stringify(error)}`);
  }
}
