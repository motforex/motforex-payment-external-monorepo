import { z } from 'zod';

export const ConfigurationRecordSchema = z.object({
  code: z.string(),
  value: z.number(),
  description: z.string(),
  isActive: z.boolean(),
  priority: z.number(),
  dependencies: z.array(z.string()),
  message: z.string(),
  createdBy: z.string(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
});

export type ConfigurationRecord = z.infer<typeof ConfigurationRecordSchema>;

export const USDtoMNTCurrencyRateSchema = z.object({
  currency: z.string(),
  minRate: z.number(),
  buyRate: z.number(),
  sellRate: z.number(),
  cashBuyRate: z.number(),
  cashSellRate: z.number(),
  name: z.string(),
  number: z.number(),
});

export type USDtoMNTCurrencyRate = z.infer<typeof USDtoMNTCurrencyRateSchema>;
