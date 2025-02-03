import { checkAuthorization, CustomError, logger } from '@motforex/global-libs';
import { PaymentInvoice, PaymentRequest, RequestMetadata, STATUS_PENDING } from '@motforex/global-types';
import { getValidDepositRequest } from '../utility';
import { getPaymentInvoiceById } from '@/repository/invoice-record';

interface ValidatedResponse {
  email: string;
  depositRequest: PaymentRequest;
  invoice: PaymentInvoice | undefined;
}

export async function getValidatedInvoiceAndRequest(metadata: RequestMetadata, id: number): Promise<ValidatedResponse> {
  const { email } = checkAuthorization(metadata, 'create-Motforex-Qpay-Invoice');
  const [depositRequest, invoice] = await Promise.all([
    getValidDepositRequest(id, [STATUS_PENDING], email),
    getPaymentInvoiceById(id)
  ]);

  if (depositRequest.status !== STATUS_PENDING) {
    logger.error(`Invalid status for Qpay invoice creation!`);
    throw new CustomError('Invalid status for Qpay invoice creation!', 400);
  }

  if (depositRequest.paymentMethodTitle && !depositRequest.paymentMethodTitle.toLowerCase().includes('qpay')) {
    logger.error(`Invalid payment method for Qpay invoice creation!`);
    throw new CustomError('Invalid payment method for Qpay invoice creation!', 400);
  }

  return { email, depositRequest, invoice };
}
