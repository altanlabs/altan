// BasicOperator.js
import { TextField, Autocomplete, Stack, Chip } from '@mui/material';
import React, { memo, useCallback, useMemo } from 'react';

import { OperatorType } from './OperatorType';
import { CardTitle } from '../../aceternity/cards/card-hover-effect';
import VarsEditor from '../../flows/modules/VarsEditor';

const getOptionLabel = (option) => option.label;

const renderOption = ({ key, ...props }, option) => (
  <li
    key={key}
    {...props}
  >
    <Stack
      className="antialiased"
      direction="row"
      spacing={1}
      alignItems="center"
      width="100%"
    >
      {!!option.symbol && (
        <Chip
          size="small"
          label={option.symbol}
        />
      )}
      <CardTitle>{option.label}</CardTitle>
    </Stack>
  </li>
);

const BasicOperator = ({ operator, value, onChange, disabled = false }) => {
  const onAutocompleteChange = useCallback(
    (e, newValue) => {
      onChange({ operator: newValue ? newValue.value : '', value });
    },
    [onChange, value],
  );

  const operatorValue = useMemo(
    () => Object.values(OperatorType).find((op) => op.value === operator),
    [operator],
  );
  const options = useMemo(() => Object.values(OperatorType), []);
  return (
    <>
      <Autocomplete
        size="small"
        options={options}
        getOptionLabel={getOptionLabel}
        value={operatorValue}
        onChange={onAutocompleteChange}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Operator"
            fullWidth
            size="small"
            variant="filled"
            InputProps={{
              ...params.InputProps,
              startAdornment: operatorValue?.symbol ? (
                <Chip
                  label={operatorValue.symbol}
                  size="small"
                  onClick={params.InputProps.ref?.current?.focus}
                />
              ) : null,
            }}
          />
        )}
        renderOption={renderOption}
        className="min-w-[100px]"
        disableClearable
        slotProps={{
          popper: {
            className: 'min-w-[200px]',
          },
        }}
      />
      <VarsEditor
        value={value}
        onChange={(v) => onChange({ operator, value: v })}
        disabled={disabled}
      />
    </>
  );
};

export default memo(BasicOperator);
