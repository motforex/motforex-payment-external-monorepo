import type { MerchantInvoice } from '@motforex/global-types';

import { executeDepositRequestById } from '@motforex/global-services';
import { STATUS_EXECUTED, STATUS_FAILED, STATUS_PENDING } from '@motforex/global-types';
import { updateMerchantInvoice } from '@/repository/merchant-invoice';
import { logger } from '@motforex/global-libs';

/**
 * Marks a merchant invoice as executed by updating its status and processing a deposit request.
 *
 * @param {MerchantInvoice} merchantInvoice - The merchant invoice to be marked as executed.
 * @returns {Promise<MerchantInvoice>} A promise that resolves to the updated merchant invoice.
 * @throws {Error} If updating the invoice or executing the deposit request fails.
 *
 * @example
 * const invoice = { id: '123', invoiceStatus: STATUS_PENDING, executionStatus: STATUS_PENDING };
 * const updatedInvoice = await markInvoiceAsExecuted(invoice);
 */
export async function markCoinsbuyInvoiceAsExecuted(merchantInvoice: MerchantInvoice): Promise<MerchantInvoice> {
  try {
    // Step 1: Update invoice status to EXECUTED if currently PENDING
    let updatedInvoice = await updateMerchantInvoice(
      { ...merchantInvoice, invoiceStatus: STATUS_EXECUTED },
      `invoiceStatus = :pending`,
      { ':pending': STATUS_PENDING }
    );

    // Step 2: Execute the deposit request and update execution status
    updatedInvoice = await executeDepositRequest(updatedInvoice);

    // Step 3: Return the final updated invoice (additional persistence can be added if needed)
    return await updateMerchantInvoice(
      { ...updatedInvoice },
      `invoiceStatus = :executed AND executionStatus = :pending`,
      {
        ':executed': STATUS_EXECUTED,
        ':pending': STATUS_PENDING
      }
    );
  } catch (error: unknown) {
    logger.error(`Failed to mark invoice as executed: ${JSON.stringify(error)}`);
    throw error; // Re-throw to allow caller to handle or log as needed
  }
}

/**
 * Executes a deposit request for a given invoice and updates its execution status and message.
 *
 * @param {MerchantInvoice} invoice - The merchant invoice for which to execute the deposit request.
 * @returns {Promise<MerchantInvoice>} A promise that resolves to the updated invoice with new execution status and message.
 *
 * @remarks
 * This function does not persist changes to a database; it only returns an updated object.
 * Errors are logged internally, but the function always returns an updated invoice object.
 *
 * @example
 * const invoice = { id: '123', invoiceStatus: STATUS_EXECUTED, executionStatus: STATUS_PENDING };
 * const result = await executeDepositRequest(invoice);
 */
async function executeDepositRequest(invoice: MerchantInvoice): Promise<MerchantInvoice> {
  try {
    // Attempt to execute the deposit request using the invoice ID
    await executeDepositRequestById(invoice.id, 'Qpay invoice is paid by CREATE-CHECK');

    // Return updated invoice with success status and message
    return {
      ...invoice,
      executionStatus: STATUS_EXECUTED,
      message: 'The payment is successfully paid'
    };
  } catch (error: unknown) {
    // Log the error for debugging purposes
    logger.error(`Error occurred on executeDepositRequest: ${JSON.stringify(error)}`);

    // Return updated invoice with failure status and message
    return {
      ...invoice,
      executionStatus: STATUS_FAILED,
      message: 'Failed to process payment'
    };
  }
}
