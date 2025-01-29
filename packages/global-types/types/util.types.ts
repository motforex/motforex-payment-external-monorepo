import { z } from 'zod';
import { COMMISSION_TYPE_FIXED, COMMISSION_TYPE_PERCENT } from '../constants';

export const LbdFuncResponseSchema = z.object({
  statusCode: z.number(),
  body: z.any()
});

export type LbdFuncResponse = z.infer<typeof LbdFuncResponseSchema>;

export type GenericFuncResponse<T> = {
  statusCode: number;
  body: T;
};

export const AccountSchema = z.object({
  login: z.string(),
  platform: z.string()
});

export type Account = z.infer<typeof AccountSchema>;

export const AmountSchema = z.object({
  amount: z.number(),
  currency: z.string()
});

export type Amount = z.infer<typeof AmountSchema>;

export const CommissionSchema = AmountSchema.extend({
  type: z.enum([COMMISSION_TYPE_FIXED, COMMISSION_TYPE_PERCENT])
});

export type Commission = z.infer<typeof CommissionSchema>;

export const OptionsSchema = z.object({
  label: z.string(),
  value: z.string()
});

export type Options = z.infer<typeof OptionsSchema>;
