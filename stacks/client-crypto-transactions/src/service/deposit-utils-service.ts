import type { PaymentRequest } from '@motforex/global-types';

import { getDepositReqById } from '@/repository/deposit-request-repository';
import { CustomError, logger } from '@motforex/global-libs';

export async function getValidDepositById(id: number, statusArr?: string[], email?: string): Promise<PaymentRequest> {
  const result = await getDepositReqById(id);

  if (!result) {
    logger.warn(`DEPOSIT-REQ:${id} is not found!`);
    throw new CustomError(`financeMessageErrorBadRequestDepositRequestNotFound`, 400);
  }

  if (statusArr && !statusArr.includes(result.status)) {
    logger.warn(`DEPOSIT-REQ:${id} status:${result.status}`);
    throw new CustomError(`financeMessageErrorStatusNotAcceptable`);
  }

  if (email && result.email !== email) {
    logger.warn(`DEPOSIT-REQ:${id} email:${result.email}`);
    throw new CustomError(`financeMessageErrorBadRequestDepositRequestNotFound ${result.email}`);
  }

  return result;
}
