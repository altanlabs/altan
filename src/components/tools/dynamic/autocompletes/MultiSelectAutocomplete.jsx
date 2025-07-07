import { Autocomplete, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { memo, useCallback, useMemo } from 'react';

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

const renderInput = (params) => (
  <TextField
    {...params}
    hiddenLabel
    variant="filled"
    size="small"
    placeholder="Select options"
    sx={{
      '.MuiInputBase-input': {
        '&::placeholder': {
          fontStyle: 'italic',
          fontSize: '0.8rem',
          opacity: 0.7,
        },
      },
    }}
  />
);

const MultiSelectAutocomplete = ({
  fieldKey,
  title,
  schema,
  value,
  onChange,
  disableClearable = false,
  commaSeparated = false,
}) => {
  const hasDescriptions = useMemo(
    () => (commaSeparated ? schema['x-enumDescriptions'] : schema.items?.enumDescriptions)?.length,
    [commaSeparated, schema],
  );

  const options = useMemo(
    () =>
      ((commaSeparated ? schema['x-enum'] : schema.items?.enum) || []).map((option, i) => ({
        value: option,
        label: option,
        ...(hasDescriptions
          ? {
              description: (commaSeparated
                ? schema['x-enumDescriptions']
                : schema.items?.enumDescriptions)[i],
            }
          : {}),
      })),
    [commaSeparated, schema, hasDescriptions],
  );

  const handleChange = useCallback(
    (event, newValue) => {
      const selectedValues = newValue.map((item) => item.value);
      onChange(commaSeparated ? selectedValues.join(',') : selectedValues);
    },
    [onChange, commaSeparated],
  );

  const currentValue = useMemo(() => {
    const valuesArray = commaSeparated
      ? value
        ? value.split(',').map((item) => item.trim())
        : []
      : Array.isArray(value)
        ? value
        : [];
    return options.filter((option) => valuesArray.includes(option.value));
  }, [options, value, commaSeparated]);

  return (
    <Autocomplete
      multiple
      options={options}
      value={currentValue}
      onChange={handleChange}
      fullWidth
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      disableClearable={disableClearable}
      renderInput={renderInput}
      {...(hasDescriptions ? { renderOption } : {})}
      limitTags={2}
      PopperProps={{
        style: {
          zIndex: 99999,
        },
        placement: 'bottom-start',
      }}
      slotProps={{
        popper: {
          style: {
            zIndex: 99999,
          },
        },
      }}
    />
  );
};
export default memo(MultiSelectAutocomplete);
