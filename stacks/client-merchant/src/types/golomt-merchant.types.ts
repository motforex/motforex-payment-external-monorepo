import { z } from 'zod';

export const GolomtCallbackBodySchema = z.object({
  status: z.string(),
  amount: z.string(),
  bank: z.string(),
  errorDesc: z.string(),
  checksum: z.string(),
  errorCode: z.string().optional(),
  cardHolder: z.string(),
  transactionId: z.string(),
  cardNumber: z.string(),
  token: z.string()
});

export type GolomtCallbackBody = z.infer<typeof GolomtCallbackBodySchema>;
