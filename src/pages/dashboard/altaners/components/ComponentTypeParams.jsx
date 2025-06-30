import { Stack } from '@mui/material';
import React, { memo } from 'react';

import FormParameter from '../../../../components/tools/form/FormParameter';

const ComponentTypeParams = ({ schema }) => {
  if (!schema || !schema.properties) {
    return null;
  }

  return (
    <Stack spacing={1}>
      {Object.entries(schema.properties).map(([key, fieldSchema]) => (
        <FormParameter
          key={key}
          fieldKey={`params.${key}`}
          name={`params.${key}`}
          schema={fieldSchema}
          required={schema.required?.includes(key)}
        />
      ))}
    </Stack>
  );
};

export default memo(ComponentTypeParams);
