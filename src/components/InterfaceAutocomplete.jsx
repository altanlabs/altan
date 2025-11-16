import { TextField, Autocomplete, Chip, Stack, Skeleton } from '@mui/material';
import { memo } from 'react';

import { useSelector } from '../redux/store.ts';

const InterfaceAutocomplete = ({ value, onChange }) => {
  const interfaces = useSelector((state) => state.general.account.interfaces);
  if (!interfaces)
    return (
      <Skeleton
        variant="rectangular"
        width={210}
        height={60}
      />
    );
  return (
    <Stack
      sx={{ width: '100%' }}
      spacing={1}
    >
      <Autocomplete
        sx={{ ml: 1 }}
        fullWidth
        size="small"
        id="interface-autocomplete"
        options={interfaces}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select interface"
            variant="outlined"
          />
        )}
        value={interfaces?.find((i) => i.id === value) || null}
        onChange={(e, v) => onChange(v?.id)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              key={option.key}
              label={option.name}
              {...getTagProps({ index })}
            />
          ))}
      />
    </Stack>
  );
};

export default memo(InterfaceAutocomplete);
