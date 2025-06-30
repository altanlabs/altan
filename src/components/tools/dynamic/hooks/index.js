import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { getAltanAxiosInstance } from '../../../../utils/axios';
import { useFormParameter } from '../../form/FormPathContext';
import { getNested } from '../utils';

// 2a) useSetConstValue: If schema.type === 'string' && schema.const
export function useSetConstValue(schema, onChange) {
  useEffect(() => {
    if (schema?.type === 'string' && schema?.const !== undefined) {
      onChange(schema.const);
    }
  }, [schema?.type, schema?.const, onChange]);
}

// 2b) useSetDefaultValue: If value is undefined/null and expanded, set defaults
export function useSetDefaultValue(value, schema, expanded, onChange) {
  useEffect(() => {
    if ((value === undefined || value === null) && schema && expanded) {
      if (schema.default !== undefined) {
        onChange(schema.default);
      } else if (Array.isArray(schema.enum) && schema.enum.length > 0) {
        onChange(schema.enum[0]);
      } else if (schema.const !== undefined) {
        onChange(schema.const);
      }
    }
  }, [value, schema, expanded, onChange]);
}

const resolveTemplates = (template, context) => {
  if (typeof template === 'string') {
    return template.replace(/\{([\w.]+)\}/g, (_, key) => context[key] ?? '');
  } else if (Array.isArray(template)) {
    return template.map((item) => resolveTemplates(item, context));
  } else if (typeof template === 'object' && template !== null) {
    return Object.fromEntries(
      Object.entries(template).map(([k, v]) => [k, resolveTemplates(v, context)]),
    );
  }
  return template;
};

export const useDynamicFormLoaderSchema = (
  url,
  args = {},
  requestConfig = {},
  responseConfig = {},
) => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { control } = useFormContext();

  const axiosInstance = getAltanAxiosInstance(requestConfig.axios);

  const { path: formPath } = useFormParameter();
  console.log('formPath', formPath);

  // Process dynamic args with path replacements
  const processPath = (path) => {
    if (typeof path === 'string' && path.includes('[$]')) {
      return path.replace(/\[\$\]/g, formPath || '');
    }
    return path;
  };

  // Identify dynamic args and process their paths
  const dynamicKeys = Object.entries(args)
    .filter(([, val]) => typeof val === 'object' && val?.type === 'dynamic')
    .map(([key]) => ({
      key,
      path: processPath(args[key].path),
    }));

  // Watch values from the form
  const watchedValues = useWatch({
    control,
    name: dynamicKeys.map((d) => d.path),
  });

  // Build context from watched dynamic and static args
  const context = Object.fromEntries([
    ...Object.entries(args).map(([key, val]) => {
      const dynamic = dynamicKeys.find((d) => d.key === key);
      if (dynamic) {
        const index = dynamicKeys.findIndex((d) => d.key === key);
        return [key, watchedValues?.[index]];
      }
      return [key, val];
    }),
  ]);

  const resolvedUrl = resolveTemplates(url, context);
  const resolvedRequest = resolveTemplates(requestConfig, context);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(resolvedUrl, resolvedRequest)
      .then((res) => {
        const rawData = res.data;
        const extracted = responseConfig?.field
          ? getNested(rawData, responseConfig.field)
          : rawData;

        setSchema(extracted);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setSchema(null);
      })
      .finally(() => setLoading(false));
  }, [resolvedUrl, JSON.stringify(resolvedRequest), axiosInstance]);

  return { schema, loading, error };
};
