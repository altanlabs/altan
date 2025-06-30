import Stack from '@mui/material/Stack';
import { memo, useMemo } from 'react';

import { checkHasProperties, checkNestedOfProperties, findPathAfterIndex } from './utils';
import FormParameter from '../form/FormParameter';

// Helper function to check for distinguishing properties
const hasDistinguishingProperties = (schema) => {
  if (!schema) {
    return false;
  }
  return schema.oneOf || schema.anyOf || schema.allOf;
};

// Helper function to find schema by title
const findSchemaByTitle = (schemas, title) => {
  if (!schemas.every((opt) => !!opt.title)) {
    return null;
  }
  return schemas.find((opt) => opt.title === title);
};

// Helper function to find schema by properties type
const findSchemaByPropertiesType = (schemas, propertiesType) => {
  return schemas.find((opt) => !!opt.properties && opt.properties.type === propertiesType);
};

// Helper function to find schema by type
const findSchemaByType = (schemas, type) => {
  return schemas.find((opt) => opt.type === type);
};

const DynamicFormFieldObject = ({
  fieldKey,
  hasOfProperties,
  ofValue,
  ofOption,
  schema,
  enableLexical = false,
  sortKey = null,
}) => {
  const selectedOneOfSchema = useMemo(() => {
    if (!hasOfProperties || !ofValue?.length) {
      return schema;
    }
    // console.log("ofOption", ofOption, hasDistinguishingProperties(ofOption));
    let selectedSchema = findSchemaByTitle(ofValue, ofOption?.title ?? 'unknown option');

    // Additional criteria: distinguish by oneOf, anyOf, allOf
    if (!selectedSchema && hasDistinguishingProperties(ofOption)) {
      selectedSchema = ofValue.find((opt) => hasDistinguishingProperties(opt));
    }

    if (!selectedSchema && ofOption?.properties) {
      // Second priority: find by properties type
      selectedSchema = findSchemaByPropertiesType(ofValue, ofOption.properties.type);
    }

    if (!selectedSchema) {
      // Third priority: find by type
      selectedSchema = findSchemaByType(ofValue, ofOption?.type);
    }

    return selectedSchema;
  }, [hasOfProperties, ofOption, ofValue, schema]);

  const selectedHasOfProperties = useMemo(() => {
    if (!selectedOneOfSchema) {
      return false;
    }
    if (selectedOneOfSchema.type === 'object') {
      return checkNestedOfProperties(selectedOneOfSchema);
    }
    return false;
  }, [selectedOneOfSchema]);

  const hasProperties = useMemo(() => {
    if (!selectedOneOfSchema) {
      return false;
    }
    if (selectedHasOfProperties) return true;

    if (selectedOneOfSchema.type === 'object') {
      return checkHasProperties(selectedOneOfSchema);
    }

    if (selectedOneOfSchema.type === 'array' && selectedOneOfSchema.items) {
      return (
        checkHasProperties(selectedOneOfSchema.items) ||
        checkNestedOfProperties(selectedOneOfSchema.items)
      );
    }

    return false;
  }, [selectedOneOfSchema]);

  if (!selectedOneOfSchema) {
    return null;
  }
  return (
    <Stack
      width="100%"
      className="p-2 rounded-xl border-0 transition-color"
    >
      {!hasProperties ? (
        <FormParameter
          fieldKey={fieldKey}
          schema={selectedOneOfSchema}
          required={false}
          enableLexical={enableLexical}
        />
      ) : (
        Object.entries(selectedOneOfSchema.properties || {}).map(([key, schema]) => {
          const required = selectedOneOfSchema.required?.includes(key) ?? false;
          const fkey = `${fieldKey}.${key}`;
          if (!!sortKey?.length && findPathAfterIndex(fkey) === sortKey) {
            return null;
          }
          return (
            <FormParameter
              key={fkey}
              fieldKey={fkey}
              schema={schema}
              required={required}
              enableLexical={enableLexical}
            />
          );
        })
      )}
    </Stack>
  );
};

export default memo(DynamicFormFieldObject);
