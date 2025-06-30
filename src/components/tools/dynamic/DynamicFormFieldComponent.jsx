import React, { memo } from 'react';
import { useWatch } from 'react-hook-form';

import AISubcomponent from './component/AISubcomponent';
import BooleanSwitchSubcomponent from './component/BooleanSwitchSubcomponent';
import DynamicComponentSubcomponent from './component/DynamicComponentSubcomponent';
import FreeTextSubcomponent from './component/FreeTextSubcomponent';
import DynamicFormFieldCustomComponent from './DynamicFormFieldCustomComponent';
import { useSetConstValue, useSetDefaultValue } from './hooks';

function DynamicFormFieldComponent({
  // Props
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
  // 1. Watch field values
  const value = useWatch({ name: fieldKey });
  const optionValue = useWatch({ name: `${fieldKey}_option` });

  // 2. Side effects for const/default values
  useSetConstValue(schema, onChange);
  useSetDefaultValue(value, schema, expanded, onChange);

  // 3. Decide which subcomponent to render
  let renderedContent;

  if (isFreeText) {
    // Free text scenario
    renderedContent = (
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
  } else if (optionValue === 'ai') {
    // AI scenario
    renderedContent = <AISubcomponent title={title} />;
  } else if (fieldType === 'boolean') {
    // Boolean scenario
    renderedContent = (
      <BooleanSwitchSubcomponent
        value={!!value}
        onChange={onChange}
        title={title}
      />
    );
  } else if (schema?.['x-component']) {
    // Custom x-component scenario
    renderedContent = (
      <DynamicFormFieldCustomComponent
        fieldKey={fieldKey}
        title={title}
        schema={schema}
        onChange={onChange}
      />
    );
  } else {
    // Default: dynamic scenario
    renderedContent = (
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

  // 4. Return the chosen subcomponent
  return renderedContent;
}

// For performance: only re-render if these props change
function arePropsEqual(prev, next) {
  return (
    prev.fieldKey === next.fieldKey &&
    prev.fieldType === next.fieldType &&
    prev.title === next.title &&
    prev.schema === next.schema && // beware if parent re-creates schema object each render
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
    // Loadable, COMPONENTS, getComponentProps might also need comparing if they're not stable
  );
}

export default memo(DynamicFormFieldComponent, arePropsEqual);
