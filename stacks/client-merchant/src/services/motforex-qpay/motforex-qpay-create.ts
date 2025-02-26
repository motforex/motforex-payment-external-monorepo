import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata } from '@motforex/global-types';

import { createNewQpayInvoice, regenerateQpayInvoice } from './motforex-qpay-create-utils';
import { handleInvoiceCreation } from '../merchant-invoice';

/**
 * Create Motforex Qpay invoice for the deposit request.
 *
 * @param metadata
 * @param id
 * @returns
 */
export async function createMotforexQpayInvoice(metadata: Metadata, id: number): Promise<APIResponse> {
  return handleInvoiceCreation({
    metadata,
    id,
    createNewInvoice: createNewQpayInvoice,
    regenerateInvoice: regenerateQpayInvoice,
    invoiceType: 'Qpay'
  });
}
