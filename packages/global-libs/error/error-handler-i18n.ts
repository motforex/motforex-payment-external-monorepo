import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import type { LbdFuncResponse } from '@motforex/global-types';

import { ZodError } from 'zod';

import axios, { AxiosError } from 'axios';
import CustomError from './custom-error';
import { logger } from '../utils';
import { formatApiResponse, formatResponse } from '../functions';
export function handleApiFuncErrorWithI18n(error: unknown): APIGatewayProxyResultV2 {
  if (error instanceof Error) logger.error(`Error occurred!: ${JSON.stringify(error.message)}`);
  if (axios.isAxiosError(error)) return handleAxiosApiError(error);
  if (error instanceof CustomError) return formatApiResponse({ message: error.message }, error.statusCode);
  if (error instanceof ZodError) return handleZodError();
  return formatApiResponse({ message: 'financeMessageErrorUnexpectedError' }, 500);
}

export function handleDefaultErrorWithI18n(error: unknown): LbdFuncResponse {
  if (error instanceof Error) logger.error(`Error occurred!: ${JSON.stringify(error.message)}`);
  if (axios.isAxiosError(error)) return handleAxiosFuncError(error);
  if (error instanceof CustomError) return formatResponse({ message: error.message }, error.statusCode);
  if (error instanceof ZodError) return handleZodFuncError();
  return formatResponse({ message: 'financeMessageErrorUnexpectedError' }, 500);
}

function handleZodError(): APIGatewayProxyResultV2 {
  const formattedMessage = `financeMessageErrorMissingValues`;
  return formatApiResponse({ message: formattedMessage }, 400);
}

function handleZodFuncError(): LbdFuncResponse {
  const formattedMessage = `financeMessageErrorMissingValues`;
  return formatResponse({ message: formattedMessage }, 400);
}

function handleAxiosApiError(error: AxiosError): APIGatewayProxyResultV2 {
  logger.error('Axios error in API function:', error);
  const status = error.response?.status || 500;
  const message = error.response?.data || 'financeMessageErrorUnknownNetworkError';
  return formatApiResponse({ message }, status);
}

const handleAxiosFuncError = (error: AxiosError): LbdFuncResponse => {
  logger.error('Axios error in function:', error);
  const status = error.response?.status || 500;
  const message = error.response?.data || 'financeMessageErrorUnknownNetworkError';
  return formatResponse({ message }, status);
};
