// ConditionalRender.js
import { memo, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { useFormParameter } from './FormPathContext';

const isObj = (v) => typeof v === 'object';
const isArray = (v) => isObj(v) && Array.isArray(v);
// const isObject = (v) => isObj(v) && !isArray(v);

const evaluateConditions = (conditions, values) => {
  if (Array.isArray(conditions)) {
    return conditions.every((condition) => evaluateConditions(condition, values));
  } else if (typeof conditions === 'object') {
    if ('@and' in conditions) {
      return conditions['@and'].every((cond) => evaluateConditions(cond, values));
    }
    if ('@or' in conditions) {
      return conditions['@or'].some((cond) => evaluateConditions(cond, values));
    }
    if ('@not' in conditions) {
      return !evaluateConditions(conditions['@not'], values);
    }
    const [originalParam, expectedValue] = Object.entries(conditions)[0];
    const currentValue = values[originalParam];
    if (isArray(expectedValue)) {
      return expectedValue.includes(currentValue);
    }
    if (expectedValue === null) {
      return [null, undefined, ''].includes(currentValue);
    }
    if (expectedValue instanceof Function) {
      return expectedValue(expectedValue);
    }
    return currentValue === expectedValue;
  }
  return false;
};

const collectFieldNames = (conditions, fieldKey, fieldNamesMap = {}, basePath = '') => {
  if (Array.isArray(conditions)) {
    conditions.forEach((cond) => collectFieldNames(cond, fieldKey, fieldNamesMap, basePath));
  } else if (typeof conditions === 'object' && conditions !== null) {
    if ('@and' in conditions || '@or' in conditions || '@not' in conditions) {
      const operator = Object.keys(conditions)[0];
      collectFieldNames(conditions[operator], fieldKey, fieldNamesMap, basePath);
    } else {
      let [param] = Object.keys(conditions);
      const originalParam = param;

      // Handle [$] replacement with basePath
      if (param.includes('[$]')) {
        param = param.replace(/\[\$\]/g, basePath);
      }

      // Handle [$i] for array indices
      if (param.includes('[$i]')) {
        const [, usefulEnd] = param.split('[$i]');
        const integers = fieldKey.match(/\.(\d+)\./g)?.map((match) => match.slice(1, -1));
        if (integers) {
          const [usefulStart] = fieldKey.split(/\.\d+\./);
          param = `${usefulStart}.${integers[0]}${usefulEnd}`;
        }
      }

      fieldNamesMap[originalParam] = param;
    }
  }
  return fieldNamesMap;
};

const ConditionalRender = ({ fieldKey, schema, children }) => {
  const { path: formPath } = useFormParameter();
  const conditionalRenderSettings = schema['x-conditional-render'];
  const isConditional = useMemo(() => !!conditionalRenderSettings, [conditionalRenderSettings]);

  const fieldNamesMap = useMemo(() => {
    if (!isConditional) return {};
    return collectFieldNames(conditionalRenderSettings, fieldKey, {}, formPath);
  }, [conditionalRenderSettings, fieldKey, isConditional, formPath]);

  const resolvedFieldNames = useMemo(() => Object.values(fieldNamesMap), [fieldNamesMap]);

  const watchValuesArray = useWatch({ name: resolvedFieldNames });

  const resolvedNameToValue = useMemo(() => {
    const result = {};
    if (!isConditional) {
      return result;
    }
    resolvedFieldNames.forEach((resolvedName, index) => {
      result[resolvedName] = watchValuesArray[index];
    });
    return result;
  }, [isConditional, resolvedFieldNames, watchValuesArray]);

  const values = useMemo(() => {
    const result = {};
    if (!isConditional) {
      return result;
    }
    for (const [originalName, resolvedName] of Object.entries(fieldNamesMap)) {
      result[originalName] = resolvedNameToValue[resolvedName];
    }
    return result;
  }, [fieldNamesMap, isConditional, resolvedNameToValue]);

  const shouldRender = useMemo(() => {
    if (!isConditional) {
      return true;
    }
    return evaluateConditions(conditionalRenderSettings, values);
  }, [conditionalRenderSettings, isConditional, values]);

  if (!shouldRender) {
    return null;
  }

  return children;
};

export default memo(ConditionalRender);
