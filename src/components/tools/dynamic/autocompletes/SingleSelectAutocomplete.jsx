// BUENO

import { Typography, Autocomplete, TextField, Stack, Tooltip } from '@mui/material';
import React, { memo, useCallback, useMemo } from 'react';

const renderOption = (props, option) => (
  <li
    {...props}
    key={props.key}
  >
    <Stack spacing={0.25}>
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.9rem',
          fontWeight: 'bold',
        }}
      >
        {option.label}
      </Typography>
      <Tooltip
        arrow
        followCursor
        title={option.description}
      >
        <Typography
          variant="caption"
          sx={{ fontSize: '0.6rem' }}
          noWrap
        >
          {option.description}
        </Typography>
      </Tooltip>
    </Stack>
  </li>
);

const SingleSelectAutocomplete = ({ value, onChange, title, options, selectedSchema }) => {
  const hasDescriptions = useMemo(
    () =>
      selectedSchema.enumDescriptions?.length ||
      (selectedSchema.oneOf || selectedSchema.anyOf)?.filter((o) => !!o.description)?.length,
    [selectedSchema.anyOf, selectedSchema.enumDescriptions?.length, selectedSchema.oneOf],
  );

  const renderInput = useCallback(
    (params) => (
      <TextField
        {...params}
        hiddenLabel
        placeholder={`Select ${title}`}
        sx={{
          '.MuiInputBase-input': {
            '&::placeholder': {
              fontStyle: 'italic',
              fontSize: '0.8rem',
              opacity: 0.7,
            },
          },
        }}
        variant="filled"
        size="small"
      />
    ),
    [title],
  );

  return (
    <Autocomplete
      options={options}
      value={options.find((o) => o.value === value) ?? null}
      onChange={(e, v) => onChange(v.value)}
      fullWidth
      getOptionLabel={(o) => o.label}
      getOptionKey={(o) => `autocomplete-option-${o.value}`}
      isOptionEqualToValue={(o, v) => o.value === v?.value}
      disableClearable={!!selectedSchema['x-disable-clear']}
      renderInput={renderInput}
      {...(hasDescriptions
        ? {
            renderOption,
          }
        : {})}
    />
  );
};

export default memo(SingleSelectAutocomplete);
