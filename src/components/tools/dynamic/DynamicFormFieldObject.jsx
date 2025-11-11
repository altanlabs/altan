import { memo, useMemo } from 'react';

import { checkHasProperties, checkNestedOfProperties, findPathAfterIndex } from './utils';
import FormParameter from '../form/FormParameter';

// Helper function to check for distinguishing properties (oneOf, anyOf, allOf)
const hasDistinguishingProperties = (schema) => {
  if (!schema) {
    return false;
  }
  return schema.oneOf || schema.anyOf || schema.allOf;
};

// Helper function to find matching schema from options
const findMatchingSchema = (schemas, option) => {
  if (!schemas || !option) {
    return null;
  }

  // First priority: match by title
  if (schemas.every((opt) => !!opt.title)) {
    const match = schemas.find((opt) => opt.title === option.title);
    if (match) return match;
  }

  // Second priority: match by distinguishing properties
  if (hasDistinguishingProperties(option)) {
    const match = schemas.find((opt) => hasDistinguishingProperties(opt));
    if (match) return match;
  }

  // Third priority: match by properties type
  if (option.properties) {
    const match = schemas.find((opt) => !!opt.properties && opt.properties.type === option.properties.type);
    if (match) return match;
  }

  // Fourth priority: match by type
  const match = schemas.find((opt) => opt.type === option.type);
  if (match) return match;

  return null;
};

// Helper function to check if property should be hidden
const shouldHideProperty = (fieldKey, sortKey) => {
  return !!sortKey?.length && findPathAfterIndex(fieldKey) === sortKey;
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
    return findMatchingSchema(ofValue, ofOption) || schema;
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
  }, [selectedOneOfSchema, selectedHasOfProperties]);

  if (!selectedOneOfSchema) {
    return null;
  }

  return (
    <div className="flex flex-col w-full p-2.5 rounded-lg border border-border/40 gap-2 transition-colors hover:border-border/60">
      {!hasProperties ? (
        <FormParameter
          fieldKey={fieldKey}
          schema={selectedOneOfSchema}
          required={false}
          enableLexical={enableLexical}
        />
      ) : (
        Object.entries(selectedOneOfSchema.properties || {}).map(([key, propertySchema]) => {
          const required = selectedOneOfSchema.required?.includes(key) ?? false;
          const fkey = `${fieldKey}.${key}`;

          if (shouldHideProperty(fkey, sortKey)) {
            return null;
          }

          return (
            <FormParameter
              key={fkey}
              fieldKey={fkey}
              schema={propertySchema}
              required={required}
              enableLexical={enableLexical}
            />
          );
        })
      )}
    </div>
  );
};

export default memo(DynamicFormFieldObject);
