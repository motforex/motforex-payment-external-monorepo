import { z } from 'zod';

export const CoinsbuyAuthTokenDataSchema = z.object({
  type: z.string().optional(), // Allow `type` to be undefined
  id: z.string().nullable().optional(),
  attributes: z.object({
    refresh: z.string(),
    access: z.string(),
    access_expired_at: z.string(),
    refresh_expired_at: z.string(),
    is_2fa_confirmed: z.boolean(),
    type_2fa: z.string().nullable()
  })
});

export type CoinsbuyAuthTokenData = z.infer<typeof CoinsbuyAuthTokenDataSchema>;

export const CoinsbuyAuthTokenResponseSchema = z.object({
  data: CoinsbuyAuthTokenDataSchema,
  meta: z.object({
    time: z.string(),
    sign: z.string()
  })
});

export type CoinsbuyAuthTokenResponse = z.infer<typeof CoinsbuyAuthTokenResponseSchema>;
