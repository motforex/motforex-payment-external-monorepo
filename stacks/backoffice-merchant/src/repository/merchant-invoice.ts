import type { MerchantInvoice } from '@motforex/global-types';

import {
  DescribeTableCommandOutput,
  getRecordByKey,
  getTableDescription,
  queryRecords,
  QueryRequest,
  updateRecord
} from '@motforex/dynamo';
import { omit } from 'lodash';

const INVOICE_RECORD_TABLE_NAME = 'motforex-merchant-invoice';

export async function getPaymentMethodTableDescription(): Promise<DescribeTableCommandOutput> {
  return await getTableDescription(INVOICE_RECORD_TABLE_NAME);
}

export async function getMerchantInvoiceById(id: number, projection?: string): Promise<MerchantInvoice | undefined> {
  return await getRecordByKey<MerchantInvoice>({
    tableName: INVOICE_RECORD_TABLE_NAME,
    key: { id },
    projectionExpression: projection
  });
}

export async function getMerchantInvoiceByQuery(queryRequest: QueryRequest, projection?: string) {
  return await queryRecords<MerchantInvoice>({
    tableName: INVOICE_RECORD_TABLE_NAME,
    queryRequest: queryRequest,
    projectionExpression: projection
  });
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
