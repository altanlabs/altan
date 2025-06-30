import { TextField } from '@mui/material';
import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui

// ----------------------------------------------------------------------

RHFTextField.propTypes = {
  name: PropTypes.string,
  helperText: PropTypes.node,
};

export default function RHFTextField({ name, helperText, controllerProps = null, ...other }) {
  const { control } = useFormContext();
  return (
    <Controller
      {...controllerProps}
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          value={typeof field.value === 'number' && field.value === 0 ? '' : field.value}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
        />
      )}
    />
  );
}
