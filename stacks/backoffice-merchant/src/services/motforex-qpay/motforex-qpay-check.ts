import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { MerchantInvoice, RequestMetadata as Metadata } from '@motforex/global-types';

import {
  checkAuthorization,
  CustomError,
  getParameterStoreVal,
  handleApiFuncError,
  logger
} from '@motforex/global-libs';
import { formatInvoiceAsResponse } from '@motforex/global-services';
import { getValidInvoicePayment, markMerchantInvoiceAsSuccessful } from '../merchant-invoice';
import { isQpayInvoicePaid } from '../qpay';
import { MOTFOREX_QPAY_TOKEN_PARAMETER } from './motforex-qpay-constants';

/**
 * Checks the status of a Motforex Qpay invoice.
 *
 * @param metadata - Metadata containing request information.
 * @param id - The ID of the invoice to check.
 * @returns A promise that resolves to an APIResponse indicating the status of the invoice.
 *
 */
export async function checkMotforexQpayInvoice(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    const { email } = checkAuthorization(metadata, 'check-motforex-qpay-invoice');
    const merchantInvoice = await getValidInvoicePayment(id, ['qpay'], email);

    // Check MerchantInvoice status
    if (merchantInvoice.invoiceStatus !== 'PENDING') {
      logger.info(`Invoice is not in PENDING status!`);
      return formatInvoiceAsResponse(merchantInvoice);
    }

    return formatInvoiceAsResponse(await checkValidMotforexQpayInvoice(merchantInvoice));
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

/**
 * Checks the status of a Motforex Qpay invoice.
 *
 * @param metadata - Metadata containing request information.
 * @param id - The ID of the invoice to check.
 * @returns A promise that resolves to an APIResponse indicating the status of the invoice.
 *
 */
export async function checkValidMotforexQpayInvoice(merchantInvoice: MerchantInvoice): Promise<MerchantInvoice> {
  try {
    // Check if the MerchantInvoice is paid
    const qpayAuthToken = await getParameterStoreVal(MOTFOREX_QPAY_TOKEN_PARAMETER);
    if (!qpayAuthToken) {
      logger.error('QPAY token is not found in the parameter store!');
      throw new CustomError('QPAY token is not found in the parameter store!', 500);
    }

    if (await isQpayInvoicePaid(qpayAuthToken, merchantInvoice)) {
      logger.info(`Qpay invoice is paid!`);
      return await markMerchantInvoiceAsSuccessful(merchantInvoice);
    }

    logger.info(`Qpay invoice is not paid yet!`);
    return merchantInvoice;
  } catch (error: unknown) {
    logger.error(`Error occurred while checking invoice from Qpay: ${JSON.stringify(error)}`);
    throw new CustomError('Error occurred while checking invoice!', 500);
  }
}
