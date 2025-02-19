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
  // Statement item information
  statementItemId: z.number(), // Long (required)
  statementDescription: z.string(), // required
  statementAmount: z.number(), // BigDecimal (required)
  statementCurrency: z.string(), // required
  statementAmountInUsd: z.number().optional(), // BigDecimal (optional)
  statementOwnerAccount: z.string().optional(),
  userEmail: z.string().optional(),

  // Deposit request information
  depositRequestId: z.number().optional(), // Long (optional)
  depositAmountInUsd: z.number().optional(), // BigDecimal (optional)
  depositAmount: z.number().optional(), // BigDecimal (optional)
  fixedAmount: z.number().optional(), // BigDecimal (optional)
  conversionRate: z.string().optional(),
  isAmountMatched: z.boolean().optional(),

  // Status information
  status: ProcessStatusSchema, // required
  message: z.string().max(255).optional(),
  createdAt: z.date(), // Instant (required)
  updatedAt: z.date().optional() // Instant (optional)
});

export type DepositExecution = z.infer<typeof DepositExecutionSchema>;

// WithdrawExecution Schema
export const WithdrawExecutionSchema = z.object({
  // Withdraw request Data
  withdrawId: z.number(), // Long (required)
  withdrawAmount: z.number(), // BigDecimal (required)
  withdrawAccountNumber: z.string().optional(),
  withdrawAccountName: z.string().optional(),
  withdrawBankName: BankTypeSchema.optional(),
  userEmail: z.string(), // required

  // Withdraw execution data
  checkedAccountOwner: z.string().optional(),
  conversionRate: z.number().optional(), // BigDecimal (optional)
  amountInMnt: z.number().optional(), // BigDecimal (optional)
  transactionBankName: BankTypeSchema.optional(),

  // Status information
  status: ProcessStatusSchema, // required
  message: z.string().max(255).optional(),
  createdAt: z.date(), // Instant (required)
  updatedAt: z.date().optional() // Instant (optional)
});

export type WithdrawExecution = z.infer<typeof WithdrawExecutionSchema>;
