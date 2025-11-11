import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { m, AnimatePresence } from 'framer-motion';
import Ajv from 'ajv';
import { truncate } from 'lodash';
import { useSnackbar } from 'notistack';

import { cn } from '@lib/utils';

import './styles.css';
import DynamicFormFieldComponent from './DynamicFormFieldComponent.jsx';
import DynamicFormFieldHeader from './DynamicFormFieldHeader.jsx';
import DynamicFormFieldHeaderActions from './DynamicFormFieldHeaderActions.jsx';
import { checkHasProperties, checkNestedOfProperties } from './utils.js';

// Animation configuration
const ANIMATION_CONFIG = {
  collapse: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
};

// Helper function to remove required fields from schema
const removeRequiredFields = (schema) => {
  const newSchema = { ...schema };
  delete newSchema.required;
  return newSchema;
};

// Helper function to check constant fields
const checkConstFields = (schema, value) => {
  const properties = schema.properties || {};
  for (const key in properties) {
    if (properties[key].const && value[key] !== undefined && properties[key].const !== value[key]) {
      return false;
    }
  }
  return true;
};

// Helper function to validate value against schemas
const validateValueAgainstSchemas = (value, schemas) => {
  if (!value) {
    return schemas?.[0] ?? null;
  }
  
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    keywords: [
      'x-component',
      'x-ignore-ui',
      'x-conditional-render',
      'x-map',
      'x-disable-header',
      'x-nested-in',
      'x-disable-free-text',
      'x-default-enabled',
    ],
  });
  
  return schemas.find((schema) => {
    // Check if the schema title matches the value's name
    if (schema.title && value.name && schema.title.toLowerCase() === value.name.toLowerCase()) {
      return schema;
    }

    // If title doesn't match, proceed with const fields check and full validation
    const constsMatch = checkConstFields(schema, value);
    if (constsMatch) {
      const schemaWithoutRequired = removeRequiredFields(schema);
      try {
        const validate = ajv.compile(schemaWithoutRequired);
        const isValid = validate(value);
        if (isValid) {
          return true;
        }
      } catch (error) {
        console.error('Error compiling schema:', error);
      }
    }
    return false;
  });
};

// Helper function to check if schema has oneOf, allOf, or anyOf
const hasOf = (schema) => !!(schema.oneOf || schema.allOf || schema.anyOf);

const DynamicFormField = ({
  fieldKey,
  schema,
  onChange,
  // value,
  enableLexical = false,
  isInMappings,
  relationship,
  sortKey = null,
  defaultEnabled = false,
  ...headerProps
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const value = useWatch({ name: fieldKey });
  const optionValue = useWatch({ name: `${fieldKey}_option` });
  const [isCollapsed, setIsCollapsed] = useState(false);
  // const [expanded, setExpanded] = useState(false);
  const [ofOption, setOfOption] = useState(null);
  const [isFreeText, setIsFreeText] = useState(false);
  const fieldValue = useMemo(() => value ?? null, [value]);

  const requiredValid = useMemo(() => {
    if (optionValue === 'ai') {
      return true;
    }
    if (['array', 'string'].includes(schema.type)) {
      return fieldValue?.length > 0;
    }
    if (schema.type === 'object') {
      if (!fieldValue) {
        return false;
      }
      let maybeDict = fieldValue;
      if (maybeDict instanceof String) {
        try {
          maybeDict = JSON.parse(maybeDict);
        } catch {
          return false;
        }
      }
      return Object.values(fieldValue).length > 0;
    }
    return fieldValue !== null && fieldValue !== undefined;
  }, [schema.type, fieldValue, optionValue]);

  const toggleCollapse = useCallback(() => setIsCollapsed((prev) => !prev), [setIsCollapsed]);

  const fieldType = useMemo(() => {
    const ft = Array.isArray(schema.type) ? schema.type[0] : schema.type;
    if (!!ft) {
      return ft;
    }
    if (!!ofOption?.type) {
      return ofOption?.type;
    }
    // const ofOrAny = schema.oneOf || schema.anyOf;
    // if (ofOrAny && Array.isArray(ofOrAny)) {
    //   let oneOfFt = "string";
    //   for (let i in ofOrAny) {
    //     const obj = ofOrAny[i]
    //     if (obj.type) {
    //       oneOfFt = obj.type;
    //     }
    //     if (['object', 'array'].includes(oneOfFt)) {
    //       break;
    //     }
    //   }
    //   return oneOfFt;
    // }
  }, [schema, ofOption]);
  const title = schema.title || fieldKey.split('.').slice(-1)[0];

  const hasAceWrapper = useMemo(() => !!['array', 'object'].includes(fieldType), [fieldType]);
  const isNumeric = useMemo(
    () => !!['integer', 'number', 'float', 'decimal'].includes(fieldType),
    [fieldType],
  );

  const hasOfProperties = useMemo(() => {
    if (!!ofOption) {
      return true;
    }
    if (hasOf(schema)) {
      return true;
    }
    if (!(hasAceWrapper || fieldType === 'string') && fieldType) return false;

    if (['object', 'string'].includes(fieldType) || !fieldType) {
      return checkNestedOfProperties(schema);
    }

    // if (fieldType === 'array' && schema.items) {
    //   return checkNestedOfProperties(schema.items);
    // }

    return false;
  }, [fieldType, hasAceWrapper, ofOption, schema]);

  const hasProperties = useMemo(() => {
    if (!(hasAceWrapper || fieldType === 'string')) return false;

    if (hasOfProperties) return true;

    if (fieldType === 'object') {
      return checkHasProperties(schema) || checkNestedOfProperties(schema);
    }

    if (fieldType === 'array' && schema.items) {
      return checkHasProperties(schema.items) || checkNestedOfProperties(schema.items);
    }

    if (fieldType === 'string') {
      return checkNestedOfProperties(schema);
    }

    return false;
  }, [fieldType, hasAceWrapper, schema, hasOfProperties]);

  const ofValue = useMemo(
    () => (!!hasOfProperties ? schema.oneOf || schema.allOf || schema.anyOf : null),
    [schema, hasOfProperties],
  );

  useEffect(() => {
    if (Array.isArray(ofValue) && ofValue.length > 0 && !ofOption) {
      if (![undefined, null, ''].includes(value)) {
        const matchingSchema = validateValueAgainstSchemas(value, ofValue);
        setOfOption(matchingSchema);
      } else {
        setOfOption(ofValue[0]);
      }
    }
  }, [ofValue, value]);


  useEffect(() => {
    if (
      ['', null, undefined].includes(value) &&
      schema &&
      (!!defaultEnabled || !!schema['x-default-enabled'])
    ) {
      if (schema.default !== undefined) {
        // If schema has a default value, set it
        if (schema.default !== value) {
          onChange(schema.default);
        }
      } else if (schema.enum?.length) {
        // If schema has enums, set the first enum as the default value
        if (schema.enum[0] !== value) {
          onChange(schema.enum[0]);
        }
      } else if (schema.const !== undefined) {
        // If schema has a const value, set it
        if (schema.const !== value) {
          onChange(schema.const);
        }
      }
    }
  }, [value, schema, onChange]);

  useEffect(() => {
    const mustBeFreeText =
      !!fieldValue &&
      typeof fieldValue === 'string' &&
      fieldType === 'string' &&
      fieldValue.length &&
      fieldValue.includes('{{');
    if (mustBeFreeText) {
      setIsFreeText(true);
    }
  }, []);

  useEffect(() => {
    const isValidString = !!fieldValue && typeof fieldValue === 'string';
    const isVar = isValidString && fieldValue.startsWith('{{') && fieldValue.endsWith('}}');
    const mustValidateJSON = hasAceWrapper && !isFreeText && isValidString && !isVar;

    if (mustValidateJSON) {
      try {
        onChange(JSON.parse(fieldValue));
      } catch {
        enqueueSnackbar(`Ensure the ${fieldType} is correctly formatted!`, { variant: 'error' });
        console.error(`Bad ${fieldType}: ${fieldValue}`);
        setIsFreeText(true);
      }
    } else if (isVar) {
      setIsFreeText(true);
    }
  }, [isFreeText]);

  const canBeCollapsed = useMemo(
    () => hasProperties && fieldType === 'object' && !isFreeText && !schema['x-disable-collapse'],
    [fieldType, hasProperties, isFreeText],
  );

  useEffect(() => {
    if (
      canBeCollapsed &&
      (schema['x-default-collapsed'] || Object.keys(schema.properties ?? {}).length > 2) &&
      !hasOfProperties
    ) {
      setIsCollapsed(true);
    }
  }, [canBeCollapsed]);

  const showFreeTextOption = useMemo(
    () =>
      !schema['x-disable-free-text'] &&
      ((hasAceWrapper && enableLexical) ||
        isInMappings ||
        schema.enum ||
        hasProperties ||
        schema['x-component'] ||
        isNumeric),
    [enableLexical, hasAceWrapper, hasProperties, isInMappings, isNumeric, schema],
  );

  if (schema.const) {
    return null;
  }

  const shouldShowBody = 
    !(!!canBeCollapsed && isCollapsed) && 
    !schema['x-hide-body'] && 
    !ofOption?.['x-hide-body'];

  return (
    <div key={fieldKey} className="w-full py-1 flex flex-col gap-2">
      {!schema['x-disable-header'] && (
        <div className="flex items-center gap-2 w-full">
          <DynamicFormFieldHeader
            fieldKey={fieldKey}
            schema={schema}
            requiredValid={requiredValid}
            sneakPeek={isCollapsed && truncate(JSON.stringify(fieldValue), { length: 60 })}
            canBeCollapsed={!!canBeCollapsed}
            toggleCollapse={toggleCollapse}
            isCollapsed={!!canBeCollapsed && isCollapsed}
            {...headerProps}
          />
          <div className="flex items-center gap-2">
            <DynamicFormFieldHeaderActions
              hasOfProperties={hasOfProperties}
              ofValue={ofValue}
              ofOption={ofOption}
              setOfOption={setOfOption}
              isFreeText={isFreeText}
              showFreeTextOption={showFreeTextOption}
              setIsFreeText={setIsFreeText}
              hasAceWrapper={hasAceWrapper}
              disableFullScreen={schema['x-disable-full-screen']}
            />
          </div>
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {shouldShowBody && (
          <m.div
            key="field-body"
            initial={ANIMATION_CONFIG.collapse.initial}
            animate={ANIMATION_CONFIG.collapse.animate}
            exit={ANIMATION_CONFIG.collapse.exit}
            transition={ANIMATION_CONFIG.collapse.transition}
            className="w-full"
          >
              <DynamicFormFieldComponent
                fieldKey={fieldKey}
                schema={ofOption ?? schema}
                fieldType={fieldType}
                title={title}
                onChange={onChange}
                isFreeText={isFreeText}
                ofValue={ofValue}
                hasProperties={hasProperties}
                hasOfProperties={hasOfProperties}
                ofOption={ofOption}
                enableLexical={enableLexical}
                isInMappings={isInMappings}
                relationship={relationship}
                sortKey={sortKey}
              />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(DynamicFormField);
