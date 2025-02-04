import type { MerchantInvoice } from '@motforex/global-types';

import { createRecord, getRecordByKey, updateRecord } from '@motforex/dynamo';
import { omit } from 'lodash';

const INVOICE_RECORD_TABLE_NAME = 'motforex-payment-invoice';

export async function getMerchantInvoiceById(id: number, projection?: string): Promise<MerchantInvoice | undefined> {
  return await getRecordByKey<MerchantInvoice>({
    tableName: INVOICE_RECORD_TABLE_NAME,
    key: { id },
    projectionExpression: projection
  });
}

export async function createMerchantInvoice(invoice: MerchantInvoice): Promise<MerchantInvoice> {
  await createRecord<MerchantInvoice>({ tableName: INVOICE_RECORD_TABLE_NAME, item: invoice });
  return invoice;
}

export async function updateMerchantInvoice(
  invoice: MerchantInvoice,
  condition?: string,
  extra?: Record<string, any>
): Promise<MerchantInvoice> {
  await updateRecord<MerchantInvoice>({
    tableName: INVOICE_RECORD_TABLE_NAME,
    key: { id: invoice.id },
    item: { ...omit(invoice, 'id') },
    conditionExpression: condition,
    extraExpressionAttributeValues: extra,
    returnValues: 'NONE'
  });
  return invoice;
}
