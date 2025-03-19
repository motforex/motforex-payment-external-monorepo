import type { CustomConfig } from '@motforex/global-types';
import type { CustomQueryCommandOutput as QueryOutput, QueryRequest, ReturnValue } from '@motforex/dynamo';

import { createRecord, updateRecord, getRecordByKey, queryRecords } from '@motforex/dynamo';
import { omit } from 'lodash';

const CUSTOM_CONFIG_TABLE = 'motforex-custom-configs';
type QueryResponse = QueryOutput<Partial<CustomConfig>>;

export async function getCustomConfigByCode(code: string, projection?: string): Promise<CustomConfig | undefined> {
  return await getRecordByKey<CustomConfig>({
    tableName: CUSTOM_CONFIG_TABLE,
    key: { code },
    projectionExpression: projection
  });
}

export async function getCustomConfigByQuery(
  query: QueryRequest,
  projection?: string,
  scanIdxForward = false
): Promise<QueryResponse> {
  return await queryRecords<CustomConfig>({
    tableName: CUSTOM_CONFIG_TABLE,
    queryRequest: query,
    projectionExpression: projection,
    scanIdxForward
  });
}

export async function createCustomConfig(config: CustomConfig): Promise<CustomConfig> {
  await createRecord<CustomConfig>({
    tableName: CUSTOM_CONFIG_TABLE,
    item: config
  });
  return config;
}

export async function updateCustomConfig(
  config: CustomConfig,
  conditionExpression?: string,
  extra?: Record<string, any>,
  returnValues = 'NONE' as ReturnValue
): Promise<CustomConfig> {
  await updateRecord<CustomConfig>({
    tableName: CUSTOM_CONFIG_TABLE,
    key: { code: config.code },
    item: { ...omit(config, ['code']) },
    conditionExpression,
    extraExpressionAttributeValues: extra,
    returnValues
  });
  return config;
}

export async function updateCustomConfigByCustomUpdateQuery(
  config: CustomConfig,
  updateExpression: string,
  expAttributeValues: Record<string, any>,
  conditionExpression?: string,
  returnValues = 'UPDATED_NEW' as ReturnValue
): Promise<CustomConfig | undefined> {
  return await updateRecord<CustomConfig>({
    tableName: CUSTOM_CONFIG_TABLE,
    key: { code: config.code },
    item: config,
    conditionExpression,
    updateExpression,
    extraExpressionAttributeValues: expAttributeValues,
    returnValues
  });
}
