import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { QueryRequest } from '@motforex/dynamo';

import * as merchantInvoiceRepo from '@/repository/merchant-invoice';
import { CustomError, formatApiResponse, handleApiFuncError, logger } from '@motforex/global-libs';

export async function getMerchantInvoiceTableDesc(): Promise<APIResponse> {
  try {
    const response = await merchantInvoiceRepo.getPaymentMethodTableDescription();
    if (!response.Table) throw new CustomError('Unable to retrieve table desc!');
    const { AttributeDefinitions, GlobalSecondaryIndexes, KeySchema } = response.Table! || {};
    return formatApiResponse({ AttributeDefinitions, GlobalSecondaryIndexes, KeySchema });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function getMerchantInvoiceById(id: number): Promise<APIResponse> {
  try {
    const merchantInvoice = await merchantInvoiceRepo.getMerchantInvoiceById(id);
    if (!merchantInvoice) {
      logger.info(`Merchant invoice with id: ${id} not found`);
      return formatApiResponse({});
    }
    return formatApiResponse(merchantInvoice);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

export async function getMerchantInvoiceByQuery(queryRequest: QueryRequest): Promise<APIResponse> {
  try {
    const merchantInvoices = await merchantInvoiceRepo.getMerchantInvoiceByQuery(queryRequest);
    return formatApiResponse(merchantInvoices);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
