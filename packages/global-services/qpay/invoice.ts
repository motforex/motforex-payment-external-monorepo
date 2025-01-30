import type { QpayCreateInvoiceRequest as CreateRequest, QpayCheckPayment, QpaySimpleInvoice } from './qpay.types';

import { createBearerAuthHeader, logger, sendRequest } from '@motforex/global-libs';
import {
  QpayCheckPaymentSchema,
  QpayGetPayment,
  QpayGetPaymentSchema,
  QpaySimpleInvoiceSchema,
  QpaySimpleResponse
} from './qpay.types';
import { QPAY_BASE_URL } from './constants';

export async function createSimpleQpayInvoice(authToken: string, invoice: CreateRequest): Promise<QpaySimpleInvoice> {
  try {
    // Send the request to the Qpay API
    const { data } = await sendRequest<QpaySimpleInvoice>({
      url: `${QPAY_BASE_URL}/invoice`,
      method: 'POST',
      headers: createBearerAuthHeader(authToken),
      data: invoice
    });
    // Return the response data
    return QpaySimpleInvoiceSchema.parse(data);
  } catch (error: unknown) {
    logger.info(`Error occurred on createSimpleQpayInvoice(): ${JSON.stringify(error)}`);
    throw error;
  }
}

export async function checkQpayInvoice(authToken: string, invoiceId: string): Promise<QpayCheckPayment> {
  try {
    // Create headers for the request, including the Bearer token for authorization
    const { data } = await sendRequest<QpayCheckPayment>({
      url: `${QPAY_BASE_URL}/payment/check`,
      method: 'GET',
      headers: createBearerAuthHeader(authToken),
      data: {
        object_type: 'INVOICE',
        object_id: invoiceId,
        offset: {
          page_number: 1,
          page_limit: 10
        }
      }
    });
    return QpayCheckPaymentSchema.parse(data);
  } catch (error: unknown) {
    logger.info(`Error occurred on checkQpayInvoiceStatus(): ${JSON.stringify(error)}`);
    throw error;
  }
}

export async function cancelQpayInvoice(authToken: string, invoiceId: string): Promise<QpaySimpleResponse> {
  try {
    const { data } = await sendRequest<QpaySimpleResponse>({
      url: `${QPAY_BASE_URL}/invoice/${invoiceId}`,
      method: 'DELETE',
      headers: createBearerAuthHeader(authToken)
    });
    return data;
  } catch (error: unknown) {
    logger.info(`Error occurred on cancelQpayInvoice(): ${JSON.stringify(error)}`);
    throw error;
  }
}

export async function getQpayInvoiceByInvoiceId(authToken: string, invoiceId: string): Promise<QpayGetPayment> {
  try {
    const { data } = await sendRequest<QpayGetPayment>({
      url: `${QPAY_BASE_URL}/payment/${invoiceId}`,
      method: 'GET',
      headers: createBearerAuthHeader(authToken)
    });
    return QpayGetPaymentSchema.parse(data);
  } catch (error: unknown) {
    logger.info(`Error occurred on getQpayInvoiceByInvoiceID(): ${JSON.stringify(error)}`);
    throw error;
  }
}

export async function refundQpayInvoiceById(authToken: string, invoiceId: string): Promise<object> {
  try {
    const { data } = await sendRequest<object>({
      url: `${QPAY_BASE_URL}/payment/refund/${invoiceId}`,
      method: 'POST',
      headers: createBearerAuthHeader(authToken)
    });
    return data;
  } catch (error: unknown) {
    logger.info(`Error occurred on refundQpayInvoiceById(): ${JSON.stringify(error)}`);
    throw error;
  }
}

export async function getQpayInvoicesByList(authToken: string): Promise<object> {
  try {
    const { data } = await sendRequest<object>({
      url: `${QPAY_BASE_URL}/payment/list`,
      method: 'GET',
      headers: createBearerAuthHeader(authToken)
    });
    return data;
  } catch (error: unknown) {
    logger.info(`Error occurred on getQpayInvoicesByList(): ${JSON.stringify(error)}`);
    throw error;
  }
}
