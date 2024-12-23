import {
  COMMISSION_TYPE_ADDITIONAL,
  COMMISSION_TYPE_FIXED,
  COMMISSION_TYPE_INCLUDED,
  COMMISSION_TYPE_PERCENT,
} from '@constants/status.constants';
import { z } from 'zod';

export type LbdFuncResponse = {
  statusCode: number;
  body: object | string;
};

export const LbdFuncResponseSchema = z.object({
  statusCode: z.number(),
  body: z.union([z.object({}).passthrough(), z.string()]),
});

export type QueryParams = {
  [key: string]: string;
};

export const QueryParamsSchema = z.record(z.string());

export type RequestMetadata = {
  token?: string;
  ipAddress?: string;
  headers: object;
  queryParams?: QueryParams | undefined;
  body?: object | string | number | null;
};

export const RequestMetadataSchema = z.object({
  token: z.string().optional(),
  ipAddress: z.string().optional(),
  headers: z.object({}).passthrough(), // Allows any object
  queryParams: QueryParamsSchema.optional(),
  body: z.union([z.object({}).passthrough(), z.string(), z.number(), z.null()]).optional(),
});

export type CognitoIdToken = {
  sub: string;
  email_verified: boolean;
  iss: string;
  'cognito:username': string;
  origin_jti: string;
  aud: string;
  event_id: string;
  token_use: string;
  auth_time: number;
  exp: number;
  iat: number;
  jti: string;
  email: string;
};

export const CognitoIdTokenSchema = z.object({
  sub: z.string(),
  email_verified: z.boolean(),
  iss: z.string(),
  'cognito:username': z.string(),
  origin_jti: z.string(),
  aud: z.string(),
  event_id: z.string(),
  token_use: z.string(),
  auth_time: z.number(),
  exp: z.number(),
  iat: z.number(),
  jti: z.string(),
  email: z.string(),
});

export const AccountSchema = z.object({
  platform: z.string(),
  login: z.string(),
});

export type Account = z.infer<typeof AccountSchema>;

export const AmountSchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

export type Amount = z.infer<typeof AmountSchema>;

export const TradingAccountDataSchema = z.object({
  balance: z.number(),
  credit: z.number(),
  account: AccountSchema,
});

export type TradingAccountData = z.infer<typeof TradingAccountDataSchema>;

export const CommissionSchema = AmountSchema.extend({
  type: z.enum([COMMISSION_TYPE_FIXED, COMMISSION_TYPE_PERCENT]),
  additionType: z.enum([COMMISSION_TYPE_ADDITIONAL, COMMISSION_TYPE_INCLUDED]),
}).nullable();

export type Commission = z.infer<typeof CommissionSchema>;

export const OptionsSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export type Options = z.infer<typeof OptionsSchema>;
