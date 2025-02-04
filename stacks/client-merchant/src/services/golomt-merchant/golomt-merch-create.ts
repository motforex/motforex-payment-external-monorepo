import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata } from '@motforex/global-types';

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
export async function createMotforexGolomtMerchantInvoice(metadata: Metadata, id: number): Promise<APIResponse> {
  return handleInvoiceCreation({
    metadata,
    id,
    createNewInvoice: createNewGolomtMerchantInvoice,
    regenerateInvoice: regenerateGolomtMerchantInvoice,
    invoiceType: 'Card'
  });
}

/**
 * Create Motforex Socialpay invoice for the deposit request.
 *
 * @param metadata - Request metadata
 * @param id - Invoice ID
 * @returns - API response
 */
export async function createMotforexSocialpayInvoice(metadata: Metadata, id: number): Promise<APIResponse> {
  return handleInvoiceCreation({
    metadata,
    id,
    createNewInvoice: createNewSocialpayInvoice,
    regenerateInvoice: regenerateSocialpayInvoice,
    invoiceType: 'Socialpay'
  });
}
