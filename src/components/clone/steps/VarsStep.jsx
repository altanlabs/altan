import { Stack } from '@mui/material';
import React, { memo } from 'react';

import FormParameter from '../../tools/form/FormParameter';

// Import your custom components here
// import FormParameter from './FormParameter';

function VarsStep({ vars }) {
  return (
    <Stack
      spacing={1}
      height="100%"
      width="100%"
    >
      {Object.entries(vars).map(([key, fieldSchema]) => {
        const required = true;
        return (
          <FormParameter
            key={key}
            fieldKey={key}
            schema={{
              title: fieldSchema.name,
              'x-hide-label': true,
              ...fieldSchema,
              'x-theme-color': (theme) => (theme.palette.mode === 'dark' ? '#fff' : 'inherit'),
            }}
            required={required}
            enableLexical={false}
            defaultEnabled
          />
        );
      })}
    </Stack>
  );
}

export default memo(VarsStep);
