import { createEventPurchase } from '@/repository/demo-masters-repository';
import { getPurchasesByUserIdAndEvent } from './demo-masters-utils';
import { EventPurchase, EventPurchaseSchema } from '@motforex/global-types';
import { getCurrentDateString, getDayStartTimestamp, shuffleString } from '../utils/date-utils';
import { createSimpleQpayInvoice, QpayCreateInvoiceRequestSchema } from '@motforex/global-services';
import {
  MOTFOREX_DEMO_MASTERS_DAY_LIMIT,
  MOTFOREX_DEMO_MASTERS_PURCHASE_FIXED_PRICE,
  MOTFOREX_QPAY_INVOICE_CODE,
  MOTFOREX_QPAY_TOKEN_PARAMETER
} from '@/constants';
import { CustomError, getParameterStoreVal, logger } from '@motforex/global-libs';
import { getUsdMntBuyRate } from '../custom-config/rate-config-service';

/**
 *  Create new event purchase for demo-masters event.
 *
 * @param userId - User id
 * @returns - Event purchase
 */
export async function createDemoMastersPurchase(userId: string, email?: string): Promise<EventPurchase> {
  const eventPurchases = await getPurchasesByUserIdAndEvent(userId, 'demo-masters');

  // Check if user has reached the limit of purchases per day
  if (eventPurchases.length >= MOTFOREX_DEMO_MASTERS_DAY_LIMIT) {
    logger.info(`User ${userId} has reached the limit of ${MOTFOREX_DEMO_MASTERS_DAY_LIMIT} purchases per day`);
    throw new CustomError(
      `User ${userId} has reached the limit of ${MOTFOREX_DEMO_MASTERS_DAY_LIMIT} purchases per day`,
      400
    );
  }
  logger.info(`User ${userId} has ${eventPurchases.length} purchases for demo-masters event`);

  // Create new event purchase
  return await createNewEventPurchase(userId, email);
}

/**
 *  Create new event purchase for demo-masters event.
 *
 * @param userId - User id
 * @returns - Event purchase
 */
export async function createNewEventPurchase(userId: string, email?: string): Promise<EventPurchase> {
  // Calculating amount
  const currentDateAsString = getCurrentDateString();
  const dayStartTimestamp = getDayStartTimestamp();
  const conversionRate = await getUsdMntBuyRate();
  logger.info(`Current USD to MNT buy rate: ${conversionRate}`);
  const amountInTransactionCurrency = Number(MOTFOREX_DEMO_MASTERS_PURCHASE_FIXED_PRICE * conversionRate);
  // const amountInTransactionCurrency = 10;
  // Sending request to Qpay
  const id = shuffleString(`${currentDateAsString}${userId.substring(0, 5)}`);
  const createQpayInvoiceRequest = QpayCreateInvoiceRequestSchema.parse({
    invoice_code: MOTFOREX_QPAY_INVOICE_CODE,
    sender_invoice_no: id,
    invoice_receiver_code: id,
    invoice_description: `MOTFOREX DEMO MASTERS ${id}`,
    sender_branch_code: 'MAIN',
    amount: amountInTransactionCurrency,
    callback_url: `https://api.motforex.com/events-purchase/v1/demo-masters/invoice/${id}/callback`
  });

  const qpayAuthToken = await getParameterStoreVal(MOTFOREX_QPAY_TOKEN_PARAMETER);
  if (!qpayAuthToken) {
    logger.error('QPAY token is not found in the parameter store!');
    throw new CustomError('QPAY token is not found in the parameter store!', 500);
  }
  logger.info(`Creating new Qpay invoice for deposit request: ${id}`);

  const { invoice_id, qPay_shortUrl, qr_text, qr_image, urls } = await createSimpleQpayInvoice(
    qpayAuthToken,
    createQpayInvoiceRequest
  );
  logger.info(`Qpay invoice created successfully: ${JSON.stringify(invoice_id)}`);

  //
  return await createEventPurchase(
    EventPurchaseSchema.parse({
      id,
      userId,
      email,
      eventName: 'demo-masters',
      invoice: invoice_id,
      invoiceReference: invoice_id,
      conversionRate,
      transactionCurrency: 'MNT',
      amountInUsd: MOTFOREX_DEMO_MASTERS_PURCHASE_FIXED_PRICE,
      amountInTransactionCurrency,
      referenceDate: dayStartTimestamp,
      metadata: { qPay_shortUrl, qr_text, qr_image, urls },
      // General config props
      userIdEventName: `${userId}~demo-masters`,
      userIdReferenceDate: `${userId}~${dayStartTimestamp}`,
      userIdReferenceDateEventName: `${userId}~${dayStartTimestamp}~demo-masters`,
      // General config props
      status: 'PENDING',
      message: `Invoice created successfully!`,
      postDate: new Date().toISOString(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
  );
}
