import type { Invoice } from '@motforex/global-types';

import { createRecord, getRecordByKey, updateRecord } from '@motforex/dynamo';
import { omit } from 'lodash';

const INVOICE_RECORD_TABLE_NAME = '';

export async function getInvoiceRecordById(id: number, projection?: string): Promise<Invoice | undefined> {
  return await getRecordByKey<Invoice>({
    tableName: INVOICE_RECORD_TABLE_NAME,
    key: { id },
    projectionExpression: projection
  });
}

export async function createInvoice(invoice: Invoice): Promise<Invoice> {
  await createRecord<Invoice>({ tableName: INVOICE_RECORD_TABLE_NAME, item: invoice });
  return invoice;
}

export async function updateInvoice(
  invoice: Invoice,
  condition?: string,
  extra?: Record<string, any>
): Promise<Invoice> {
  await updateRecord<Invoice>({
    tableName: INVOICE_RECORD_TABLE_NAME,
    key: { id: invoice.id },
    item: { ...omit(invoice, 'id') },
    conditionExpression: condition,
    extraExpressionAttributeValues: extra,
    returnValues: 'NONE'
  });
  return invoice;
}
