import { getMerchantInvoiceById } from '@/repository/merchant-invoice';
import { getValidDepositById } from '../deposit-utils-service';
import { MerchantInvoice, PaymentRequest, STATUS_PENDING } from '@motforex/global-types';
import { CustomError } from '@motforex/global-libs';

type ValidatedResponse = { depositRequest: PaymentRequest; merchantInvoice?: MerchantInvoice };

export async function getValidatedInvoiceAndRequest(id: number, email: string): Promise<ValidatedResponse> {
  const [depositRequest, merchantInvoice] = await Promise.all([
    getValidDepositById(id, [STATUS_PENDING], email),
    getMerchantInvoiceById(id)
  ]);

  return { depositRequest, merchantInvoice };
}

export async function getValidMerchantInvoiceById(id: number, statusArr: string[]): Promise<MerchantInvoice> {
  const merchantInvoice = await getMerchantInvoiceById(id);

  if (!merchantInvoice) {
    throw new CustomError(`Merchant invoice not found for ID: ${id}`);
  }

  if (!statusArr.includes(merchantInvoice.invoiceStatus)) {
    throw new CustomError(`Invalid status for merchant invoice ID: ${id}`);
  }

  return merchantInvoice;
}
