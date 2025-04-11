import type { MerchantInvoice } from '@motforex/global-types';

import { createNewQpayInvoice, regenerateQpayInvoice } from './motforex-qpay-create-utils';
import { handleInvoiceCreation } from '../merchant-invoice';

/**
 * Create Motforex Qpay invoice for the deposit request.
 *
 * @param metadata
 * @param id
 * @returns
 */
export async function createMotfxQpayInvoice(id: number, email: string, locale: string): Promise<MerchantInvoice> {
  return handleInvoiceCreation({
    id,
    email,
    locale,
    createNewInvoice: createNewQpayInvoice,
    regenerateInvoice: regenerateQpayInvoice,
    invoiceType: 'QPAY'
  });
}
