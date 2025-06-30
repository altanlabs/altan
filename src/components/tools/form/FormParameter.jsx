// FormParameter.js
import { memo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import ConditionalRender from './ConditionalRender';
import DynamicFormField from '../dynamic/DynamicFormField';

const FormParameter = ({
  fieldKey,
  schema,
  required,
  isInMappings,
  relationship,
  enableLexical = false,
  enableAIFill = false,
  defaultEnabled = false,
  ...arrayParameters
}) => {
  const { control } = useFormContext();
  if (schema['x-ignore-ui'] || !fieldKey || !control) {
    return null;
  }
  return (
    <ConditionalRender
      fieldKey={fieldKey}
      schema={schema}
    >
      <Controller
        name={fieldKey}
        control={control}
        render={({ field }) => (
          <DynamicFormField
            fieldKey={fieldKey}
            schema={schema}
            required={required || schema['x-required']}
            onChange={field.onChange}
            enableAIFill={enableAIFill}
            isInMappings={isInMappings}
            relationship={relationship}
            enableLexical={enableLexical}
            defaultEnabled={defaultEnabled}
            {...arrayParameters}
          />
        )}
      />
    </ConditionalRender>
  );
};

export default memo(FormParameter);
