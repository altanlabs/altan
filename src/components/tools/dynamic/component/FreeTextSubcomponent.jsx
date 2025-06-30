import React from 'react';

import { COMPONENTS } from '../components';

// Subcomponent for "FreeText" scenario
function FreeTextSubcomponent({
  hasProperties,
  fieldType,
  enableLexical,
  schema,
  title,
  value,
  onChange,
  expanded,
  fieldKey,
}) {
  // Decide which component to load
  const componentKey =
    (!hasProperties && !['array', 'object'].includes(fieldType)) || enableLexical
      ? 'FreeModeTextField'
      : 'ArrayOrObjectAceWrapper';

  // This is the actual lazy component
  const LazyComponent = COMPONENTS[componentKey];

  return (
    <LazyComponent
      schema={schema}
      title={title}
      value={value}
      onChange={onChange}
      enableLexical={enableLexical}
      expanded={expanded}
      fieldKey={fieldKey}
      fieldType={fieldType}
    />
  );
}

export default React.memo(FreeTextSubcomponent);
