import { getMerchantInvoiceById } from '@/repository/merchant-invoice';
import { getValidDepositById } from '../deposit-utils-service';
import { MerchantInvoice, PaymentRequest, STATUS_PENDING } from '@motforex/global-types';

type ValidatedResponse = { depositRequest: PaymentRequest; merchantInvoice?: MerchantInvoice };

export async function getValidatedInvoiceAndRequest(id: number, email: string): Promise<ValidatedResponse> {
  const [depositRequest, merchantInvoice] = await Promise.all([
    getValidDepositById(id, [STATUS_PENDING], email),
    getMerchantInvoiceById(id)
  ]);

  return { depositRequest, merchantInvoice };
}
