import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Typography,
  Switch,
  Stack,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import React from 'react';

import { SchemaProperty } from '../types';


interface FormFieldProps {
  name: string;
  property: SchemaProperty;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  property,
  value,
  onChange,
  required = false,
}) => {
  const { type, title, description, enum: enumValues, enumDescriptions } = property;
  const label = title || name;

  // Handle enum type (dropdown)
  if (enumValues) {
    return (
      <FormControl fullWidth size="small" required={required}>
        <InputLabel id={`${name}-label`}>{label}</InputLabel>
        <Select
          labelId={`${name}-label`}
          id={name}
          value={value ?? ''}
          label={label}
          onChange={(e: SelectChangeEvent) => onChange(e.target.value)}
        >
          {enumValues.map((enumValue, index) => (
            <MenuItem key={String(enumValue)} value={enumValue}>
              {enumDescriptions?.[index] || String(enumValue)}
            </MenuItem>
          ))}
        </Select>
        {description && <FormHelperText>{description}</FormHelperText>}
      </FormControl>
    );
  }

  // Handle boolean type (switch)
  if (type === 'boolean') {
    return (
      <FormControl fullWidth>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="body2">
            {label}
            {required && ' *'}
          </Typography>
          <Switch
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            color="primary"
          />
        </Stack>
        {description && <FormHelperText>{description}</FormHelperText>}
      </FormControl>
    );
  }

  // Handle number/integer type
  if (type === 'number' || type === 'integer') {
    return (
      <TextField
        fullWidth
        size="small"
        type="number"
        label={`${label}${required ? ' *' : ''}`}
        value={value ?? ''}
        onChange={(e) => {
          const numValue = type === 'integer'
            ? parseInt(e.target.value, 10)
            : parseFloat(e.target.value);
          onChange(isNaN(numValue) ? '' : numValue);
        }}
        inputProps={{
          min: property.minimum,
          max: property.maximum,
          step: type === 'integer' ? 1 : 'any',
        }}
        helperText={description}
      />
    );
  }

  // Handle date-time format
  if (property.format === 'date-time') {
    return (
      <TextField
        fullWidth
        size="small"
        type="datetime-local"
        label={`${label}${required ? ' *' : ''}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
        helperText={description}
      />
    );
  }

  // Default to text input
  return (
    <TextField
      fullWidth
      size="small"
      label={`${label}${required ? ' *' : ''}`}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      multiline={type === 'string' && (property.format === 'text' || (description && description.length > 100))}
      minRows={type === 'string' && (property.format === 'text' || (description && description.length > 100)) ? 3 : 1}
      helperText={description}
      placeholder={description}
    />
  );
};
