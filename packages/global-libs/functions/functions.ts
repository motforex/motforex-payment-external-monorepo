import { adminHeader, defaultConfig, userHeader } from './constants';

export function generatePathname(context: string): string {
  return `${context.split(process.cwd())[1].substring(1).replace(/\\/g, '/')}`;
}

export function createDefaultFunc(dirname: string, handlerName: string, other: object = {}) {
  return {
    handler: `${generatePathname(dirname)}/handler.${handlerName}`,
    ...other
  };
}

export function createDefaultApiGatewayFunc(
  dirname: string,
  handler: string,
  method: string,
  url: string,
  other: object = {}
): object {
  return {
    handler: `${generatePathname(dirname)}/handler.${handler}`,
    events: [
      {
        http: {
          method: method,
          path: url,
          ...defaultConfig
        }
      }
    ],
    ...other
  };
}

export function createUserAuthApiGatewayFunc(
  dir: string,
  handler: string,
  method: string,
  url: string,
  other: object = {}
): object {
  return {
    handler: `${generatePathname(dir)}/handler.${handler}`,
    events: [
      {
        http: {
          method: method,
          path: url,
          ...userHeader
        }
      }
    ],
    ...other
  };
}

export function createAdminAuthApiGatewayFunc(
  dir: string,
  handler: string,
  method: string,
  url: string,
  other: object = {}
): object {
  return {
    handler: `${generatePathname(dir)}/handler.${handler}`,
    events: [
      {
        http: {
          method: method,
          path: url,
          ...adminHeader
        }
      }
    ],
    ...other
  };
}

export function createScheduledFunc(dir: string, handler: string, schedule: string[], other: object = {}) {
  return {
    handler: `${generatePathname(dir)}/handler.${handler}`,
    events: [
      {
        schedule: {
          rate: schedule, // Executes every 1 hour
          enabled: true,
          name: handler,
          description: 'Scheduled event for refreshing UT tokens',
          ...other
        }
      }
    ]
  };
}
