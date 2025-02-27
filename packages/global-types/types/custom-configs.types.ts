import { z } from 'zod';

export const CustomConfigValueTypeSchema = z.enum(['string', 'boolean', 'number', 'object', 'array']);
export type CustomConfigValueType = z.infer<typeof CustomConfigValueTypeSchema>;

export const CustomConfigSchema = z.object({
  code: z.string(),
  periodCode: z.number().nullable(),
  description: z.string(),
  value: z.string(),
  valueType: CustomConfigValueTypeSchema,
  helperType: z.string().nullable(),
  parentCode: z.string(),
  isEditable: z.boolean(),
  isActive: z.boolean(),
  postDate: z.string(),
  createdAt: z.number(),
  createdBy: z.string(),
  updatedAt: z.number().nullable(),
  updatedBy: z.string().nullable()
});

export type CustomConfig = z.infer<typeof CustomConfigSchema>;

export const CreateCustomConfigRequestSchema = z.object({
  code: z.string(),
  periodCode: z.number().nullable(),
  description: z.string(),
  value: z.string(),
  valueType: CustomConfigValueTypeSchema,
  helperType: z.string().nullable(),
  parentCode: z.string(),
  isEditable: z.boolean(),
  isActive: z.boolean()
});

export type CreateCustomConfigRequest = z.infer<typeof CreateCustomConfigRequestSchema>;

export const CreateCurrencyRateRequestSchema = z.object({
  currency: z.string(),
  amount: z.number(),
  type: z.enum(['BUY', 'SELL']),
  description: z.string().optional()
});

export type CreateCurrencyRateRequest = z.infer<typeof CreateCurrencyRateRequestSchema>;
