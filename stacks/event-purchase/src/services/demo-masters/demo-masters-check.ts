import { MOTFOREX_QPAY_TOKEN_PARAMETER } from '@/constants';
import { getEventPurchaseById, updateEventPurchase } from '@/repository/demo-masters-repository';
import { CustomError, getParameterStoreVal, invokeLambdaFunc, logger } from '@motforex/global-libs';
import { checkQpayInvoice, QpayCheckPayment } from '@motforex/global-services';
import { EventPurchase } from '@motforex/global-types';

export async function checkDemoMastersInvoice(id: string): Promise<EventPurchase> {
  const eventPurchase = await getValidatedEventPurchaseById(id);

  // Validate the status of the event purchase
  if (eventPurchase.status !== 'PENDING') {
    logger.error(`EventPurchase:${id} is not pending! Cannot check the invoice`);
    return eventPurchase;
  }

  // Check if the MerchantInvoice is paid
  const qpayAuthToken = await getParameterStoreVal(MOTFOREX_QPAY_TOKEN_PARAMETER);
  if (!qpayAuthToken) {
    logger.error('QPAY token is not found in the parameter store!');
    throw new CustomError('QPAY token is not found in the parameter store!', 500);
  }

  // Check if the invoice is paid
  if (await isDemoMastersInvoicePaid(qpayAuthToken, eventPurchase)) {
    logger.info(`Event purchase is paid! EventPurchase:${id}`);
    const result = await invokeLambdaFunc('motforex-client-demo-competition-prod-purchase', {
      body: { userId: eventPurchase.userId, amountInUsd: eventPurchase.amountInTransactionCurrency }
    });
    if (result.statusCode !== 200) {
      logger.error(`Failed to update the purchase in the client! EventPurchase:${id}`);
      await updateEventPurchase({ ...eventPurchase, status: 'FAILED' });
      throw new CustomError('Failed assign trading account!', 500);
    }
    logger.info(`Event purchase is paid! Response:${result}`);
    return await updateEventPurchase({ ...eventPurchase, status: 'PAID' });
  }

  // Update the status of the event purchase
  logger.info(`Event purchase is not paid! EventPurchase:${id}`);
  return eventPurchase;
}

export async function getValidatedEventPurchaseById(id: string): Promise<EventPurchase> {
  const result = await getEventPurchaseById(id);

  if (!result) {
    logger.error('Event purchase not found');
    throw new CustomError('Bad request! Event purchase not found!', 400);
  }

  return result;
}

/**
 * Check if the invoice is paid
 *
 * @param qpayToken
 * @param eventPurchase
 * @returns
 */
async function isDemoMastersInvoicePaid(qpayToken: string, eventPurchase: EventPurchase): Promise<boolean> {
  const { invoice, amountInTransactionCurrency } = eventPurchase;
  logger.info(`Checking invoice from Qpay: ${eventPurchase.id}, QpayInvoice: ${invoice}`);
  const checkResponse: QpayCheckPayment = await checkQpayInvoice(qpayToken, `${invoice}`);

  if (checkResponse.count === 0) {
    logger.info(`Qpay invoice is not paid yet! QpayInvoice: ${invoice}`);
    return false;
  }

  logger.info(`Qpay invoice check found a match! QpayInvoice: ${invoice}`);
  logger.info(`Qpay invoice check response: ${JSON.stringify(checkResponse)}`);

  const roundedAmount = roundToTwoDecimalPlaces(amountInTransactionCurrency);
  logger.info(`Rounded amount: ${roundedAmount}`);
  logger.info(`Paid amount: ${checkResponse.paid_amount}`);
  const isPaid = checkResponse.paid_amount !== undefined && Math.abs(checkResponse.paid_amount - roundedAmount) <= 1;

  logger.info(`Qpay invoice is paid: ${isPaid}, QpayInvoice: ${invoice}`);
  return isPaid;
}

function roundToTwoDecimalPlaces(input: number): number {
  return Math.round((input + Number.EPSILON) * 100) / 100;
}
