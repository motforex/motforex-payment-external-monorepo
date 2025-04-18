import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import type { LbdFuncResponse } from '@motforex/global-types';

import CustomError from './custom-error';
import axios, { AxiosError } from 'axios';
import { formatApiResponse, formatResponse } from '../functions';
import { logger } from '../utils';
import { ZodError } from 'zod';

function handleApiFuncError(error: unknown): APIGatewayProxyResultV2 {
  if (error instanceof Error) logger.error(`${error.message}`);
  if (axios.isAxiosError(error)) return handleAxiosApiError(error);
  if (error instanceof CustomError) return formatApiResponse({ error: { message: error.message } }, error.statusCode);
  if (error instanceof ZodError) return handleZodError(error);
  return formatApiResponse({ error: { message: 'Unexpected error occurred' } }, 500);
}

function handleDefaultError(error: unknown): LbdFuncResponse {
  if (error instanceof Error) logger.error(`Function Error occurred: ${error.message}`);
  if (axios.isAxiosError(error)) return handleAxiosFuncError(error);
  if (error instanceof CustomError) return formatResponse({ error: { message: error.message } }, error.statusCode);
  if (error instanceof ZodError) return handleZodFuncError(error);
  return formatResponse({ error: { message: 'Unexpected error occurred' } }, 500);
}

function handleZodError(error: ZodError): APIGatewayProxyResultV2 {
  const missingFields = error.errors.map((err) => err.path.join('.') || 'unknown field');
  const formattedMessage = `Missing or invalid fields: ${missingFields.join(', ')}`;
  return formatApiResponse({ error: { message: formattedMessage } }, 400);
}

function handleZodFuncError(error: ZodError): LbdFuncResponse {
  const missingFields = error.errors.map((err) => err.path.join('.') || 'unknown field');
  const formattedMessage = `Missing or invalid fields: ${missingFields.join(', ')}`;
  return formatResponse({ error: { message: formattedMessage } }, 400);
}

function handleAxiosApiError(error: AxiosError): APIGatewayProxyResultV2 {
  logger.error('Axios error in API function:', error);
  const status = error.response?.status || 500;
  const errorData = error.response?.data || { message: 'Unknown API error' };
  return formatApiResponse({ error: errorData }, status);
}

const handleAxiosFuncError = (error: AxiosError): LbdFuncResponse => {
  logger.error('Axios error in function:', error);
  const status = error.response?.status || 500;
  const errorData = error.response?.data || { message: 'Unknown function error' };
  return formatResponse({ error: errorData }, status);
};

export { handleApiFuncError, handleDefaultError };
