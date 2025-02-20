import { z } from 'zod';

// Enums
export const BankTypeSchema = z.enum([
  'KhanBank',
  'GolomtBank',
  'TDBBank',
  'XacBank',
  'KhasBank',
  'StateBank',
  'ArigBank',
  'CapitronBank',
  'BogdBank',
  'TransBank',
  'NationalInvestmentBank',
  'ChingisKhaanBank',
  'MBank'
]);

export type BankType = z.infer<typeof BankTypeSchema>;

export const ProcessStatusSchema = z.enum([
  'INITIAL',
  'PENDING',
  'CANCELLED',
  'EXPIRED',
  'PROCESSING',
  'PAYOUT',
  'HALTED',
  'FAILED',
  'EXECUTED',
  'REJECTED',
  'SOLVED'
]);

export type ProcessStatus = z.infer<typeof ProcessStatusSchema>;

// DepositExecution Schema
export const DepositExecutionSchema = z.object({
  id: z.number(),
  // Statement item information
  statementItemId: z.number(), // Long (required)
  statementDescription: z.string(), // required
  statementAmount: z.number(), // BigDecimal (required)
  statementCurrency: z.string(), // required
  statementAmountInUsd: z.number().nullable().optional(), // BigDecimal (optional)
  statementOwnerAccount: z.string().nullable().optional(),
  userEmail: z.string().nullable(),

  // Deposit request information
  depositRequestId: z.number().nullable().optional(), // Long (optional)
  depositAmountInUsd: z.number().nullable().optional(), // BigDecimal (optional)
  depositAmount: z.number().nullable().optional(), // BigDecimal (optional)
  fixedAmount: z.number().nullable().optional(), // BigDecimal (optional)
  conversionRate: z.string().nullable().optional(),
  isAmountMatched: z.boolean().nullable().optional(),

  // Status information
  status: ProcessStatusSchema, // required
  message: z.string().max(255).nullable(),
  createdAt: z.string(), // Instant (required)
  updatedAt: z.string().nullable().optional() // Instant (optional)
});

export type DepositExecution = z.infer<typeof DepositExecutionSchema>;

// WithdrawExecution Schema
export const WithdrawExecutionSchema = z.object({
  id: z.number(),
  // Withdraw request Data
  withdrawId: z.number(), // Long (required)
  withdrawAmount: z.number(), // BigDecimal (required)
  withdrawAccountNumber: z.string().nullable().optional(),
  withdrawAccountName: z.string().nullable().optional(),
  withdrawBankName: BankTypeSchema.nullable().optional(),
  userEmail: z.string(), // required

  // Withdraw execution data
  checkedAccountOwner: z.string().nullable().optional(),
  conversionRate: z.number().nullable().optional(), // BigDecimal (optional)
  amountInMnt: z.number().nullable().optional(), // BigDecimal (optional)
  transactionBankName: BankTypeSchema.optional(),

  // Status information
  status: ProcessStatusSchema, // required
  message: z.string().max(255).optional(),
  createdAt: z.string(), // Instant (required)
  updatedAt: z.string().nullable().optional() // Instant (optional)
});

export type WithdrawExecution = z.infer<typeof WithdrawExecutionSchema>;
