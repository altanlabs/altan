import { Autocomplete, Chip, TextField } from '@mui/material';
import { memo, useCallback } from 'react';

const FreesoloArrayAutocomplete = ({ fieldKey, title, schema, value, onChange }) => {
  const handleChange = useCallback(
    (event, newValue) => {
      onChange(newValue.map((item) => (typeof item === 'string' ? item : item.inputValue)));
    },
    [onChange],
  );

  const safeFieldValue = Array.isArray(value) ? value : [];

  return (
    <Autocomplete
      name="Create option and press enter"
      label="Create option and press enter"
      multiple
      freeSolo
      options={safeFieldValue}
      value={safeFieldValue}
      onChange={handleChange}
      fullWidth
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            key={`${fieldKey}-array-option-${index}`}
            variant="outlined"
            label={option}
            {...getTagProps({ index })}
          />
        ))}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          size="small"
          label="Create option and press enter"
        />
      )}
    />
  );
};

export default memo(FreesoloArrayAutocomplete);
