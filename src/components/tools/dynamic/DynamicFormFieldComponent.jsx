import { memo } from 'react';
import { useWatch } from 'react-hook-form';

import AISubcomponent from './component/AISubcomponent';
import BooleanSwitchSubcomponent from './component/BooleanSwitchSubcomponent';
import DynamicComponentSubcomponent from './component/DynamicComponentSubcomponent';
import FreeTextSubcomponent from './component/FreeTextSubcomponent';
import DynamicFormFieldCustomComponent from './DynamicFormFieldCustomComponent';
import { useSetConstValue, useSetDefaultValue } from './hooks';

/**
 * Main component that renders the appropriate field type based on schema and options
 * Routes to different sub-components based on field configuration
 */
function DynamicFormFieldComponent({
  fieldKey,
  fieldType,
  title,
  schema,
  onChange,
  isFreeText = false,
  ofValue = null,
  hasProperties = false,
  hasOfProperties = false,
  ofOption = null,
  enableLexical = false,
  expanded = false,
  isInMappings,
  relationship,
  sortKey = null,
}) {
  // Watch field values
  const value = useWatch({ name: fieldKey });
  const optionValue = useWatch({ name: `${fieldKey}_option` });

  // Apply side effects for const/default values
  useSetConstValue(schema, onChange);
  useSetDefaultValue(value, schema, expanded, onChange);

  // Render free text mode
  if (isFreeText) {
    return (
      <FreeTextSubcomponent
        hasProperties={hasProperties}
        fieldType={fieldType}
        enableLexical={enableLexical}
        schema={schema}
        title={title}
        value={value}
        onChange={onChange}
        expanded={expanded}
        fieldKey={fieldKey}
      />
    );
  }

  // Render AI fill mode
  if (optionValue === 'ai') {
    return <AISubcomponent title={title} />;
  }

  // Render boolean switch
  if (fieldType === 'boolean') {
    return (
      <BooleanSwitchSubcomponent
        value={!!value}
        onChange={onChange}
        title={title}
      />
    );
  }

  // Render custom component based on x-component
  if (schema?.['x-component']) {
    return (
      <DynamicFormFieldCustomComponent
        fieldKey={fieldKey}
        title={title}
        schema={schema}
        onChange={onChange}
      />
    );
  }

  // Default: render dynamic component
  return (
      <DynamicComponentSubcomponent
        fieldKey={fieldKey}
        fieldType={fieldType}
        title={title}
        schema={schema}
        enableLexical={enableLexical}
        expanded={expanded}
        hasProperties={hasProperties}
        hasOfProperties={hasOfProperties}
        ofValue={ofValue}
        ofOption={ofOption}
        relationship={relationship}
        sortKey={sortKey}
        value={value}
        onChange={onChange}
      />
    );
  }

// Memoization comparison for performance optimization
function arePropsEqual(prev, next) {
  return (
    prev.fieldKey === next.fieldKey &&
    prev.fieldType === next.fieldType &&
    prev.title === next.title &&
    prev.schema === next.schema &&
    prev.onChange === next.onChange &&
    prev.isFreeText === next.isFreeText &&
    prev.ofValue === next.ofValue &&
    prev.hasProperties === next.hasProperties &&
    prev.hasOfProperties === next.hasOfProperties &&
    prev.ofOption === next.ofOption &&
    prev.enableLexical === next.enableLexical &&
    prev.expanded === next.expanded &&
    prev.isInMappings === next.isInMappings &&
    prev.relationship === next.relationship &&
    prev.sortKey === next.sortKey
  );
}

export default memo(DynamicFormFieldComponent, arePropsEqual);
