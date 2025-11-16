import { Autocomplete, Stack, TextField, Typography } from '@mui/material';
import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';

import IconRenderer from './icons/IconRenderer';
import { useAuthContext } from '../auth/useAuthContext.ts';
import { selectConnectionTypes } from '../redux/slices/connections';
import { selectApps } from '../redux/slices/general/index.ts';

function ConnectionTypesAutocomplete({ value, onChange, internal = false }) {
  const { user } = useAuthContext();
  const types = useSelector(selectConnectionTypes);
  const apps = useSelector(selectApps);

  const options = useMemo(() => {
    if (!user.xsup) {
      return internal ? apps.flatMap((app) => app.details.connection_types) : types;
    }
    return [...types, ...apps.flatMap((app) => app.details.connection_types)];
  }, [apps, internal, types, user.xsup]);

  return (
    <Autocomplete
      fullWidth
      options={options}
      getOptionLabel={(option) => option.name}
      value={options.find((type) => type.id === value) || null}
      onChange={onChange}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Connection Type"
        />
      )}
      size="small"
      renderOption={(props, option) => (
        <li {...props}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <IconRenderer
              icon={option.icon}
              size={24}
            />
            <Typography variant="body2">{option.name}</Typography>
          </Stack>
        </li>
      )}
    />
  );
}

export default memo(ConnectionTypesAutocomplete);
