import type { MerchantInvoice } from '@motforex/global-types';

import {
  createNewGolomtMerchantInvoice,
  createNewSocialpayInvoice,
  regenerateGolomtMerchantInvoice,
  regenerateSocialpayInvoice
} from './golomt-merch-create-utils';
import { handleInvoiceCreation } from '../merchant-invoice';

/**
 * Create Motforex Golomt Merchant invoice for the deposit request.
 *
 * @param metadata - Request metadata
 * @param id - Invoice ID
 * @returns - API response
 */
export async function createMotforexGolomtMerchantInvoice(
  id: number,
  email: string,
  locale: string
): Promise<MerchantInvoice> {
  return handleInvoiceCreation({
    id,
    email,
    locale,
    createNewInvoice: createNewGolomtMerchantInvoice,
    regenerateInvoice: regenerateGolomtMerchantInvoice,
    invoiceType: 'CARD'
  });
}

/**
 * Create Motforex Socialpay invoice for the deposit request.
 *
 * @param metadata - Request metadata
 * @param id - Invoice ID
 * @returns - API response
 */
export async function createMotforexSocialpayInvoice(
  id: number,
  email: string,
  locale: string
): Promise<MerchantInvoice> {
  return handleInvoiceCreation({
    id,
    email,
    locale,
    createNewInvoice: createNewSocialpayInvoice,
    regenerateInvoice: regenerateSocialpayInvoice,
    invoiceType: 'SOCIALPAY'
  });
}
