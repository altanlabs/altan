import { Typography, Stack } from '@mui/material';
import React, { useMemo } from 'react';

import { COMPONENTS, getComponentProps } from '../components';

// We assume `getComponentProps` is a function that returns:
// { Component: dynamicComponentKey, props: componentProps, wrapper: boolean }
function DynamicComponentSubcomponent({
  fieldKey,
  fieldType,
  title,
  schema,
  enableLexical,
  expanded,
  hasProperties,
  hasOfProperties,
  ofValue,
  ofOption,
  relationship,
  sortKey,
  value,
  onChange,
}) {
  // Extract dynamic component info
  const {
    Component: dynamicComponentKey,
    props: componentProps,
    wrapper,
  } = useMemo(
    () =>
      getComponentProps({
        fieldKey,
        fieldType,
        title,
        schema,
        enableLexical,
        expanded,
        hasProperties,
        hasOfProperties,
        ofValue,
        ofOption,
        relationship,
        sortKey,
      }),
    [
      fieldKey,
      fieldType,
      title,
      schema,
      enableLexical,
      expanded,
      hasProperties,
      hasOfProperties,
      ofValue,
      ofOption,
      relationship,
      sortKey,
    ],
  );

  // If the resolved component is just MUI Typography
  if (dynamicComponentKey === 'Typography') {
    // If "hasOfProperties" is true, we skip rendering
    if (hasOfProperties) return null;
    return React.createElement(Typography, componentProps);
  }

  // Otherwise, it's a lazy-loaded component
  const LazyComponent = COMPONENTS[dynamicComponentKey];

  const finalElement = (
    <LazyComponent
      value={value}
      onChange={onChange}
      {...componentProps}
    />
  );

  // Optionally wrap in a Stack if needed
  if (wrapper) {
    return (
      <Stack
        height="100%"
        width="100%"
        spacing={0.75}
        className="backdrop-blur-lg rounded-xl"
      >
        {finalElement}
      </Stack>
    );
  }

  return finalElement;
}

export default React.memo(DynamicComponentSubcomponent);
