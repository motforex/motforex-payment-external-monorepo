import { CognitoIdToken, QueryParams, RequestMetadata } from '@motforex/global-types';
import { APIGatewayProxyEvent } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { CustomError } from '../error';
import { logger } from '../utils';

interface ExtendedAPIGatewayProxyEvent extends Omit<APIGatewayProxyEvent, 'body'> {
  body?: any;
}

export type AuthorizationData = {
  sub: string;
  email: string;
  ipAddress: string;
};

export type AdminAuthorizationData = AuthorizationData & { permission: string };

export const extractMetadata = (event: ExtendedAPIGatewayProxyEvent): RequestMetadata => {
  try {
    const ipAddress = event.requestContext.identity.sourceIp;
    const token = event.headers.Authorization?.replace('Bearer ', '');
    const queryParams = event.queryStringParameters as QueryParams;
    const headers = event.headers;
    const body = event.body;
    return { ipAddress, token, headers, queryParams, body };
  } catch (error) {
    throw new Error('Unable to process request!');
  }
};

/**
 * Decodes JWT
 *
 * @param token
 * @returns
 */
export const extractJWTData = (token: string): object => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    // If the token is valid, return the payload
    if (decoded) return decoded.payload as object;

    throw new Error('Invalid token');
  } catch (error) {
    throw new Error('Failed to process TOKEN!');
  }
};

/**
 *  Extracts cognito token and parses the output
 *
 * @param cognitoToken
 * @returns
 */
export const extractCognitoToken = (cognitoToken: string): CognitoIdToken => {
  const res = extractJWTData(cognitoToken);
  return res as CognitoIdToken;
};

/**
 *  Extracts the user-data(client) from the token and validates the user's permission
 *
 * @param metadata
 * @param funcName
 * @returns
 */
export function checkAuthorization(metadata: RequestMetadata, funcName = 'Function'): AuthorizationData {
  // Validating metadata
  const { ipAddress, token } = metadata;
  if (!token || !ipAddress) throw new CustomError('financeMessageErrorUnauthorized', 400);

  // Validating user data
  const { email, sub } = extractCognitoToken(token);
  if (!email || !sub) throw new CustomError('financeMessageErrorUnauthorized', 400);

  logger.info(`${funcName.toUpperCase()} email:${email} IP:${ipAddress}`);
  return { email, sub, ipAddress };
}

/**
 *  Extracts the user-data(admin) from the token and validates the user's permission
 *
 * @param metadata
 * @param funcName
 * @returns
 */
export function checkAdminAuthorization(metadata: RequestMetadata, funcName = 'Function'): AdminAuthorizationData {
  // Validating metadata
  const { ipAddress, token, headers } = metadata;
  if (!token || !ipAddress) throw new CustomError('Unable to process! Missing token or IP address', 400);

  const permission = headers['permission'] as string;

  // Validating user data
  const { email, sub } = extractCognitoToken(token);
  if (!email || !sub) throw new CustomError('User credentials are missing!', 400);

  logger.info(`${funcName.toUpperCase()} email:${email} IP:${ipAddress}`);
  return { email, sub, ipAddress, permission };
}
