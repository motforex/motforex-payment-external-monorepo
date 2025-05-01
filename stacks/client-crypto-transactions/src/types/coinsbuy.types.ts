import { z } from 'zod';

//------------------------------------- INVOICE REQUEST -----------------------------------------------
export const CoinsbuyAuthTokenDataSchema = z.object({
  type: z.string().optional(),
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
  type: z.string(),
  id: z.string()
});

// Updated RelationshipsSchema to match API structure
const RelationshipsSchema = z.object({
  currency: z.object({ data: WalletDataSchema.nullable() }).optional(),
  transfer: z.object({ data: WalletDataSchema.nullable() }).optional(),
  wallet: z.object({ data: WalletDataSchema.nullable() }).optional(),
  parent: z.object({ data: WalletDataSchema.nullable() }).optional() // Allow null for parent.data
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
  assets: z.record(z.any()),
  destination: z.null(),
  payment_page_redirect_url: z.string().url(),
  payment_page_button_text: z.string(),
  is_active: z.boolean()
});

// Main schema for invoice request
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

export const CoinsbuyCurrencyIncludeSchema = z.object({
  type: z.string(),
  id: z.string(),
  attributes: z.object({
    blockchain_name: z.string(),
    iso: z.number(),
    name: z.string(),
    alpha: z.string(),
    alias: z.string(),
    tags: z.string(),
    exp: z.number(),
    confirmation_blocks: z.number(),
    minimal_transfer_amount: z.string(),
    block_delay: z.number()
  })
});

// Updated CoinsbuyTransferIncludedSchema to allow null for risk
export const CoinsbuyTransferIncludedSchema = z.object({
  type: z.string(),
  id: z.string(),
  attributes: z.object({
    op_id: z.number(),
    op_type: z.number(),
    amount: z.string(),
    rate_target: z.string(),
    commission: z.string(),
    fee: z.string(),
    txid: z.string(),
    status: z.number(),
    user_message: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    confirmations: z.number(),
    risk: z.number().nullable(), // Allow null for risk
    risk_personal: z.any().nullable(),
    risk_personal_status: z.number(),
    risk_status: z.number(),
    amount_target: z.string(),
    commission_target: z.string(),
    amount_cleared: z.string()
  }),
  relationships: z.object({
    currency: z.object({ data: WalletDataSchema.nullable() }), // Simplified to match API
    parent: z.object({ data: WalletDataSchema.nullable() }) // Allow null for parent.data
  })
});

export type CoinsbuyTransferIncluded = z.infer<typeof CoinsbuyTransferIncludedSchema>;

// Updated CoinsbuyDepositSchema with corrected included union
export const CoinsbuyDepositSchema = z.object({
  data: CoinsbuyDepositDataSchema,
  included: z.array(z.union([CoinsbuyCurrencyIncludeSchema, CoinsbuyTransferIncludedSchema])).optional(),
  meta: z
    .object({
      time: z.string(),
      sign: z.string()
    })
    .optional()
});

export type CoinsbuyDeposit = z.infer<typeof CoinsbuyDepositSchema>;
