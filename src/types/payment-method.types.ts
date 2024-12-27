import { AmountSchema, CommissionSchema, OptionsSchema } from './util.types';
import { z } from 'zod';

export const PaymentMethodTypesSchema = z.enum(['DEPOSIT', 'WITHDRAW']);
export type PaymentMethodTypes = z.infer<typeof PaymentMethodTypesSchema>;

export const FormSchema = z.object({
  fieldName: z.string(),
  title: z.string(),
  type: z.string(),
  widget: z.string(),
  validators: z.string().nullable(),
  optionsSource: z.string().nullable(),
  options: z.array(OptionsSchema).nullable(),
});

export type FormSchemaType = z.infer<typeof FormSchema>;

export const PaymentMethodSchema = z.object({
  id: z.number(),
  title: z.string(),
  iconUrl: z.string(),
  type: PaymentMethodTypesSchema,
  // Amounts
  minAmount: AmountSchema,
  maxAmount: AmountSchema,
  commission: CommissionSchema.nullable(),
  transactionCurrency: z.string(),
  // Configs
  allowedCountries: z.array(z.string()).min(1, 'At least one country is required'),
  formSchema: z.array(FormSchema).nullable(),
  warning: z.string().nullable(),
  isRequireProof: z.boolean(),
  isAmountEditable: z.boolean(),
  isMetadataRequired: z.boolean(),
  instructions: z.string(),
  paymentProofInstructions: z.string().nullable(),
  expirationPeriod: z.number(),
  // Status
  isActive: z.boolean(),
  message: z.string(),
  postDate: z.string(),
  createdBy: z.string(),
  createdAt: z.number(),
  updatedBy: z.string().nullable(),
  updatedAt: z.number().nullable(),
});

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
