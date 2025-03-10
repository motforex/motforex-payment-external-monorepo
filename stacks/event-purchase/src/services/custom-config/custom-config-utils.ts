import { CustomConfig } from '@motforex/global-types';

export function getCustomConfigTypedValue(config: CustomConfig): string | boolean | number | object | any[] {
  const { value, valueType } = config;

  switch (valueType) {
    case 'string':
      return value;
    case 'boolean':
      return value.toLowerCase() === 'true' || value === '1';
    case 'number':
      const numValue = Number(value);
      return isNaN(numValue) ? 0 : numValue;
    case 'object':
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    case 'array':
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    default:
      return value; // Fallback to string if valueType is invalid
  }
}
