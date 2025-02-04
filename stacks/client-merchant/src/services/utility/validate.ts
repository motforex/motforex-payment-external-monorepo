import type { MerchantInvoice, PaymentRequest } from '@motforex/global-types';

import { CustomError, logger } from '@motforex/global-libs';
import { getDepositReqById } from '@/repository/deposit-requests';
import { getMerchantInvoiceById } from '@/repository/invoice-record';

/**
 * Get valid deposit request by id. If status is provided, it will check the status of the deposit request.
 *
 * @param id - Deposit request id
 * @param status - Deposit request status
 * @param email - Deposit request email
 * @returns - Valid deposit request
 */
export async function getValidDepositRequest(id: number, status: string[], email?: string): Promise<PaymentRequest> {
  try {
    const depositRequest = await getDepositReqById(id);
    if (!depositRequest) {
      logger.warn(`DEPOSIT-REQ:${id} is not found!`);
      throw new CustomError(`Bad request! Cannot find DepositRequest:${id}`, 400);
    }

    if (status && !status.includes(depositRequest.status)) {
      logger.warn(`DEPOSIT-REQ:${id} status:${depositRequest.status}`);
      throw new CustomError(`Status is not acceptable! ${depositRequest.status}`);
    }

    if (email && depositRequest.email !== email) {
      logger.warn(`DEPOSIT-REQ:${id} email:${depositRequest.email}`);
      throw new CustomError(`Deposit request does not found! ${depositRequest.email}`);
    }

    return depositRequest;
  } catch (error: unknown) {
    logger.error(`Error occurred on getValidDepositRequest: ${JSON.stringify(error)}`);
    throw error;
  }
}

/**
 * Get valid invoice record by id. If status is provided, it will check the status of the invoice record.
 * If userId is provided, it will check the userId of the invoice record.
 *
 * @param id - Invoice id
 * @param status - Invoice status
 * @param userId - Invoice userId
 * @returns
 *
 */
export async function getValidInvoiceRecord(id: number, status?: string[], userId?: string): Promise<MerchantInvoice> {
  try {
    const invoice = await getMerchantInvoiceById(id);
    if (!invoice) {
      logger.warn(`INVOICE:${id} is not found!`);
      throw new CustomError(`Bad request! Cannot find Invoice:${id}`, 400);
    }

    if (status && !status.includes(invoice.invoiceStatus)) {
      logger.warn(`INVOICE:${id} status:${invoice.invoiceStatus}`);
      throw new CustomError(`Status is not acceptable! ${invoice.invoiceStatus}`);
    }

    if (userId && invoice.userId !== userId) {
      logger.warn(`INVOICE:${id} email:${invoice.userId}`);
      throw new CustomError(`Invoice does not found! ${invoice.userId}`);
    }

    return invoice;
  } catch (error: unknown) {
    logger.error(`Error occurred on getValidInvoiceRecord: ${JSON.stringify(error)}`);
    throw error;
  }
}
