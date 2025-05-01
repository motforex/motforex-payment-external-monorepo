import { invokeLambdaFunc, logger } from '@motforex/global-libs';
import { encryptSecret } from '../utility';

export const MOTFOREX_DEPOSIT_SECRET_KEY = 'bddfb8a2617eb1b0cbb077d79d5805695a5caa58bb74471234f3a8789a80d8e1';

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
      executor: 'MOTFOREX_MERCHANT_STACK',
      secret: encryptSecret(Date.now(), MOTFOREX_DEPOSIT_SECRET_KEY)
    });
    logger.info(`Id:${id} markDepositRequestAsExpired result: ${JSON.stringify(result)}`);

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
    logger.error(`Error occurred on markDepositRequestAsExpired: ${JSON.stringify(error)}`);
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
      executor: 'MOTFOREX_MERCHANT_STACK',
      secret: encryptSecret(Date.now(), MOTFOREX_DEPOSIT_SECRET_KEY)
    });
    logger.info(`Id:${id} markDepositRequestAsFailed result: ${JSON.stringify(result)}`);

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
      executor: 'MOTFOREX_MERCHANT_STACK',
      secret: encryptSecret(Date.now(), MOTFOREX_DEPOSIT_SECRET_KEY)
    });

    logger.info(`Id:${id} executeDepositRequestById result: ${JSON.stringify(result)}`);

    if (!result) {
      logger.error('Failed to execute deposit request! No response from lambda function');
      throw new Error('Failed to execute deposit request! No response from lambda function');
    }

    if (result.statusCode !== 200) {
      logger.error(`Failed to execute deposit request! Lambda function returned status code: ${result.statusCode}`);
      logger.error(`Lambda function response: ${result.body}`);
      throw new Error(`Failed to execute deposit request! Lambda function returned status code: ${result.statusCode}`);
    }
  } catch (error: unknown) {
    logger.error(`Error occurred on executeDepositRequestById: ${JSON.stringify(error)}`);
    throw error;
  }
}
