import { z } from 'zod';

export const DemoMastersPriceDetailSchema = z.object({
  currentPriceInUsd: z.number(),
  actualPriceInUsd: z.number()
});

export type DemoMastersPriceDetail = z.infer<typeof DemoMastersPriceDetailSchema>;
