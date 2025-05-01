import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import {
  STATUS_EXECUTED,
  STATUS_PENDING,
  type MerchantInvoice,
  type RequestMetadata as Metadata
} from '@motforex/global-types';

import { checkAuthorization, CustomError, handleApiFuncError, logger } from '@motforex/global-libs';
import { getValidInvoicePayment, markMerchantInvoiceAsSuccessful, reexecuteDepositRequest } from '../merchant-invoice';
import { formatInvoiceAsResponse } from '@motforex/global-services';
import { isPaidOnGolomtMerch } from '../golomt-merch/golomt-merchant-check';
import { GOLOMT_MERCHANT_SECRET, GOLOMT_MERCHANT_TOKEN } from './motforex-golomt-merch-constants';

/**
 * Checks the status of a Motforex Golomt-Merchant invoice.
 *
 * @param metadata - Metadata containing request information.
 * @param id - The ID of the invoice to check.
 * @returns A promise that resolves to an APIResponse indicating the status of the invoice.
 *
 */
export async function checkMotforexGolomtMerchInvoice(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    checkAuthorization(metadata, 'check-motforex-qpay-invoice');
    const merchantInvoice = await getValidInvoicePayment(id, ['card', 'socialpay']);

    // Check MerchantInvoice status
    if (merchantInvoice.invoiceStatus === STATUS_PENDING) {
      return formatInvoiceAsResponse(await checkValidMotforexGolomtMerchInvoice(merchantInvoice));
    }

    // Handling case where the invoice is successful but the execution is not.
    if (merchantInvoice.invoiceStatus === STATUS_EXECUTED && merchantInvoice.executionStatus !== STATUS_EXECUTED) {
      return formatInvoiceAsResponse(await reexecuteDepositRequest(merchantInvoice));
    }

    logger.info(`Invoice:${id} is not in PENDING status!`);
    return formatInvoiceAsResponse(merchantInvoice);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}

/**
 * Checks the status of a validated motforex Golomt-Merchant invoice.
 *
 * @param merchantInvoice - The invoice to check.
 * @returns A promise that resolves to the status of the invoice.
 */
export async function checkValidMotforexGolomtMerchInvoice(merchantInvoice: MerchantInvoice): Promise<MerchantInvoice> {
  try {
    logger.info(`Checking Invoice: ${merchantInvoice.id}, Golomt-Merchant-Invoice: ${merchantInvoice.providerId}`);
    console.log('Golomt-Merchant secret:', GOLOMT_MERCHANT_SECRET);
    if (!GOLOMT_MERCHANT_SECRET || !GOLOMT_MERCHANT_TOKEN) {
      logger.error('Golomt-Merchant secret or token is not found!');
      throw new CustomError('Unable to process Golomt-Merchant-Invoice', 500);
    }
    // Check if the MerchantInvoice is paid
    if (await isPaidOnGolomtMerch(GOLOMT_MERCHANT_SECRET, GOLOMT_MERCHANT_TOKEN, merchantInvoice.providerId)) {
      logger.info(`Golomt Merch invoice is paid!`);
      return await markMerchantInvoiceAsSuccessful(merchantInvoice);
    }
    logger.info(`Golomt Merch invoice is not paid yet!`);
    return merchantInvoice;
  } catch (error: unknown) {
    logger.error(`Error occurred on checkValidMotforexGolomtMerchInvoice: ${JSON.stringify(error)}`);
    throw new CustomError('Error occurred while checking invoice!', 500);
  }
}
