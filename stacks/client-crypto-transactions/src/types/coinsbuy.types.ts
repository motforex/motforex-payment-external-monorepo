import { RequestMetadataSchema } from '@motforex/global-types';
import { z } from 'zod';

//------------------------------------- INVOICE REQUEST -----------------------------------------------
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

const WalletDataSchema = z.object({
  type: z.literal('wallet'),
  id: z.string()
});

const RelationshipsSchema = z.object({
  currency: z.object({ data: WalletDataSchema.nullable() }),
  wallet: z.object({ data: WalletDataSchema.nullable() }),
  transfer: z.object({ data: WalletDataSchema.nullable() })
});

const AttributesSchema = z.object({
  status: z.number(),
  address: z.null(),
  address_type: z.string(),
  label: z.string(),
  tracking_id: z.string(),
  confirmations_needed: z.number(),
  time_limit: z.null(),
  callback_url: z.string().url(),
  inaccuracy: z.string(),
  target_amount_requested: z.string(),
  rate_requested: z.null(),
  rate_expired_at: z.null(),
  invoice_updated_at: z.null(),
  payment_page: z.string().url(),
  target_paid: z.string(),
  source_amount_requested: z.string(),
  target_paid_pending: z.string(),
  assets: z.record(z.any()), // Empty object
  destination: z.null(),
  payment_page_redirect_url: z.string().url(),
  payment_page_button_text: z.string(),
  is_active: z.boolean()
});

// Main schema
export const CoinsbuyDepositRequestResponseSchema = z.object({
  data: z.object({
    type: z.string(),
    id: z.string(),
    attributes: AttributesSchema,
    relationships: RelationshipsSchema
  })
});

export type CoinsbuyDepositRequestResponse = z.infer<typeof CoinsbuyDepositRequestResponseSchema>;

//------------------------------------- DEPOSIT REQUEST -----------------------------------------------
const destinationSchema = z.object({
  address_type: z.string().nullable(),
  address: z.string()
});

export type Destination = z.infer<typeof destinationSchema>;

export const CoinsbuyDepositAttributesSchema = z.object({
  address: z.string(),
  created_at: z.string(),
  tracking_id: z.string(),
  target_paid: z.string(),
  source_amount_requested: z.string(),
  target_amount_requested: z.string(),
  status: z.number(),
  time_limit: z.any().nullable(),
  inaccuracy: z.string(),
  destination: destinationSchema
});

export type CoinsbuyDepositAttributes = z.infer<typeof CoinsbuyDepositAttributesSchema>;

export const CoinsbuyDepositDataSchema = z.object({
  type: z.string(),
  id: z.string(),
  attributes: CoinsbuyDepositAttributesSchema,
  relationships: RelationshipsSchema
});

export type CoinsbuyDepositData = z.infer<typeof CoinsbuyDepositDataSchema>;

export const CoinsbuyDepositSchema = z.object({
  data: CoinsbuyDepositDataSchema,
  metadata: RequestMetadataSchema
});

export type CoinsbuyDeposit = z.infer<typeof CoinsbuyDepositSchema>;
