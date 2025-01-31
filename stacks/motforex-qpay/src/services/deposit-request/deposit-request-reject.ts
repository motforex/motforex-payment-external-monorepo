import { invokeLambdaFunc, logger } from '@motforex/global-libs';

/**
 * Mark deposit request as expired with private function invoke.
 *
 * @param id - Deposit request id
 * @param message - Message to be sent
 */
export async function markDepositRequestAsExpired(id: number, message: string): Promise<void> {
  try {
    const result = await invokeLambdaFunc('motforex-admin-deposit-request-prod-markDepositReqExpiredPrivate', {
      id,
      message,
      owner: 'MOTFOREX_QPAY_STACK'
    });

    if (!result) {
      logger.error('Failed to execute deposit request! No response from lambda function');
      throw new Error('Failed to execute deposit request! No response from lambda function');
    }

    if (result.statusCode !== 200) {
      logger.error(`Failed to execute deposit request! Lambda function returned status code: ${result.statusCode}`);
      logger.error(`Lambda function response: ${result.body}`);
      throw new Error(`Failed to execute deposit request! Lambda function returned status code: ${result.statusCode}`);
    }
  } catch (error) {
    logger.error(`Error occurred on rejectDepositRequest: ${JSON.stringify(error)}`);
    throw error;
  }
}

/**
 * Mark deposit request as failed with private function invoke.
 *
 * @param id - Deposit request id
 * @param message - Message to be sent
 */
export async function markDepositRequestAsFailed(id: number, message: string): Promise<void> {
  try {
    const result = await invokeLambdaFunc('motforex-admin-deposit-request-prod-markDepositReqFailedPrivate', {
      id,
      message,
      owner: 'MOTFOREX_QPAY_STACK'
    });

    if (!result) {
      logger.error('Failed to execute deposit request! No response from lambda function');
      throw new Error('Failed to execute deposit request! No response from lambda function');
    }

    if (result.statusCode !== 200) {
      logger.error(`Failed to execute deposit request! Lambda function returned status code: ${result.statusCode}`);
      logger.error(`Lambda function response: ${result.body}`);
      throw new Error(`Failed to execute deposit request! Lambda function returned status code: ${result.statusCode}`);
    }
  } catch (error) {
    logger.error(`Error occurred on markDepositRequestAsFailed: ${JSON.stringify(error)}`);
    throw error;
  }
}
/**
 *  Execute deposit request by id with private function invoke.
 *
 * @param id
 * @param message
 */
export async function executeDepositRequestById(id: number, message: string): Promise<void> {
  try {
    const result = await invokeLambdaFunc('motforex-admin-deposit-request-prod-executeDepositReqPrivate', {
      id,
      message,
      owner: 'MOTFOREX_QPAY_STACK'
    });

    if (!result) {
      logger.error('Failed to execute deposit request! No response from lambda function');
      throw new Error('Failed to execute deposit request! No response from lambda function');
    }

    if (result.statusCode !== 200) {
      logger.error(`Failed to execute deposit request! Lambda function returned status code: ${result.statusCode}`);
      logger.error(`Lambda function response: ${result.body}`);
      throw new Error(`Failed to execute deposit request! Lambda function returned status code: ${result.statusCode}`);
    }
  } catch (error) {
    logger.error(`Error occurred on executeDepositRequestById: ${JSON.stringify(error)}`);
    throw error;
  }
}
