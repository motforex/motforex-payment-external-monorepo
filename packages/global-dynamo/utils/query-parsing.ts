import type { ValidatedAPIGatewayProxyEvent } from '@motforex/global-libs';
import type { QueryRequest } from '../types';

import { QueryRequestSchema } from '../types';
import { CustomError } from '@motforex/global-libs';

type EventType = ValidatedAPIGatewayProxyEvent<object | null>;

export function extractQueryParamsFromEvent(event: EventType, indexName: string, query: QueryRequest): QueryRequest {
  let parsedQueries = event.queryStringParameters || {};

  if (parsedQueries && parsedQueries.index === indexName) {
    parsedQueries = {
      indexName,
      pKey: parsedQueries.pKey || query.pKey,
      pKeyType: parsedQueries.pKeyType || query.pKeyType,
      pKeyProp: parsedQueries.pKeyProps || query.pKeyProp
    };
  }

  const parseResult = QueryRequestSchema.safeParse({
    indexName: parsedQueries.index,
    ...parsedQueries,
    limit: parsedQueries.limit || '10'
  });

  if (!parseResult.success) {
    throw new CustomError(`Bad request!,${parseResult.error.errors.map((err) => err.path).join(', ')}`, 400);
  }

  return parseResult.data;
}
