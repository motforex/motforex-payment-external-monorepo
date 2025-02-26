import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';
import type { RequestMetadata as Metadata } from '@motforex/global-types';

import { CustomError, handleApiFuncError, logger } from '@motforex/global-libs';
import { getValidatedInvoiceAndRequest } from '../motforex-qpay';
import { formatInvoiceAsResponse } from '@motforex/global-services';
import { isPaidOnGolomtMerch } from './golomt-merch-check-utils';
import { GOLOMT_MERCHANT_SECRET, GOLOMT_MERCHANT_TOKEN } from './golomt-merch-configs';
import { markPaymentInvoiceAsSuccessful } from '../merchant-invoice';

export async function checkMotforexGolomtMerchInvoice(metadata: Metadata, id: number): Promise<APIResponse> {
  try {
    const { email, depositRequest, merchantInvoice } = await getValidatedInvoiceAndRequest(metadata, id);
    // Check if the email is valid
    if (depositRequest.email !== email) {
      logger.error(`Invalid email for Qpay invoice creation!`);
      throw new CustomError('Invalid request for Qpay invoice creation!', 400);
    }

    if (!merchantInvoice) {
      logger.info(`Golomt-Merchant-Invoice does not exist for deposit request: ${id}`);
      throw new CustomError(`Golomt-Merchant-Invoice does not exist for deposit request: ${id}`, 404);
    }

    if (merchantInvoice.invoiceStatus !== 'PENDING') {
      logger.info(`Golomt-Merchant-Invoice is not in PENDING status for deposit request: ${id}`);
      return formatInvoiceAsResponse(merchantInvoice);
    }

    if (!GOLOMT_MERCHANT_SECRET || !GOLOMT_MERCHANT_TOKEN) {
      logger.error('Golomt-Merchant secret or token is not found!');
      throw new CustomError('Unable to process Golomt-Merchant-Invoice', 500);
    }

    // Check if the invoice is paid
    if (await isPaidOnGolomtMerch(GOLOMT_MERCHANT_SECRET, GOLOMT_MERCHANT_TOKEN, merchantInvoice.providerId)) {
      return formatInvoiceAsResponse(await markPaymentInvoiceAsSuccessful(merchantInvoice));
    }

    return formatInvoiceAsResponse(merchantInvoice);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
}
