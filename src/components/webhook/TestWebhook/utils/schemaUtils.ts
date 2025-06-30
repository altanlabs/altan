import { SchemaProperty, FormData } from '../types';

/**
 * Generates default form values from a JSON schema
 */
export const generateDefaultValues = (schema?: SchemaProperty): FormData => {
  if (!schema?.properties) return {};
  
  return Object.entries(schema.properties).reduce<FormData>((acc, [key, prop]) => {
    if ('default' in prop) {
      acc[key] = prop.default;
    } else if (prop.type === 'object') {
      acc[key] = generateDefaultValues(prop);
    } else if (prop.type === 'array') {
      acc[key] = [];
    } else if (prop.type === 'boolean') {
      acc[key] = false;
    } else if (prop.type === 'number' || prop.type === 'integer') {
      acc[key] = 0;
    } else if (prop.enum && prop.enum.length > 0) {
      acc[key] = prop.enum[0];
    } else {
      acc[key] = '';
    }
    return acc;
  }, {});
};

/**
 * Builds the complete request URL including base URL and route path
 */
export const buildRequestUrl = (baseUrl: string, routePath?: string): string => {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const path = routePath?.startsWith('/') ? routePath : `/${routePath || ''}`;
  return `${base}${path}`;
};

/**
 * Validates form data against the schema's required fields
 */
export const validateFormData = (
  data: FormData, 
  schema?: SchemaProperty
): { isValid: boolean; errors: string[] } => {
  if (!schema?.required?.length) return { isValid: true, errors: [] };
  
  const errors = schema.required
    .filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '' || 
             (Array.isArray(value) && value.length === 0);
    })
    .map(field => `"${schema.properties?.[field]?.title || field}" is required`);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
