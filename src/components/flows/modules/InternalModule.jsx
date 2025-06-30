import { TextField, Autocomplete } from '@mui/material';
import { capitalize } from 'lodash';
import React, { memo, useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

const INTERNAL_ARGUMENT_SCHEMAS = {
  set_variable: {
    type: 'object',
    properties: {},
  },
};

const groups = ['execution', 'workflow', 'string', 'array', 'number', 'date'];

const names = {
  execution: ['set_variable'],
};

const InternalModule = () => {
  const { control } = useFormContext();
  const group = useWatch({ name: 'group' });
  const name = useWatch({ name: 'name' });

  const selectedSchema = useMemo(() => INTERNAL_ARGUMENT_SCHEMAS[name], [name]);

  return (
    <>
      <Controller
        key="group"
        name="group"
        control={control}
        render={({ field }) => (
          <Autocomplete
            value={field.value}
            onChange={(_, value) => field.onChange(value)}
            options={groups}
            getOptionLabel={(option) => capitalize(option)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                label="Group"
              />
            )}
            fullWidth
            size="small"
          />
        )}
      />
      <Controller
        key="name"
        name="name"
        control={control}
        render={({ field }) => (
          <Autocomplete
            value={field.value || null}
            onChange={(_, value) => field.onChange(value)}
            options={names[group] || []}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                label="Name"
              />
            )}
            fullWidth
            size="small"
          />
        )}
      />
      {/* {
          Object.entries(selectedSchema.properties).map(([key, fieldSchema]) => {
            const required = selectedSchema.required?.includes(key) ?? false;
            return (
              <FormParameter
                key={key}
                fieldKey={key}
                schema={fieldSchema}
                required={required}
                enableLexical={true}
              />
            );
          })
        } */}
    </>
  );
};

export default memo(InternalModule);
