import type { PaymentInvoice } from '@motforex/global-types';

import { createRecord, getRecordByKey, updateRecord } from '@motforex/dynamo';
import { omit } from 'lodash';

const INVOICE_RECORD_TABLE_NAME = 'motforex-payment-invoice';

export async function getPaymentInvoiceById(id: number, projection?: string): Promise<PaymentInvoice | undefined> {
  return await getRecordByKey<PaymentInvoice>({
    tableName: INVOICE_RECORD_TABLE_NAME,
    key: { id },
    projectionExpression: projection
  });
}

export async function createPaymentInvoice(invoice: PaymentInvoice): Promise<PaymentInvoice> {
  await createRecord<PaymentInvoice>({ tableName: INVOICE_RECORD_TABLE_NAME, item: invoice });
  return invoice;
}

export async function updatePaymentInvoice(
  invoice: PaymentInvoice,
  condition?: string,
  extra?: Record<string, any>
): Promise<PaymentInvoice> {
  await updateRecord<PaymentInvoice>({
    tableName: INVOICE_RECORD_TABLE_NAME,
    key: { id: invoice.id },
    item: { ...omit(invoice, 'id') },
    conditionExpression: condition,
    extraExpressionAttributeValues: extra,
    returnValues: 'NONE'
  });
  return invoice;
}
