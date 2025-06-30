import { Slider, FormHelperText } from '@mui/material';
import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui

// ----------------------------------------------------------------------

RHFSlider.propTypes = {
  name: PropTypes.string.isRequired,
  helperText: PropTypes.node,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
};

export default function RHFSlider({
  name,
  helperText,
  min = 0.01,
  max = 1,
  step = 0.01,
  ...other
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <Slider
            {...field}
            valueLabelDisplay="auto"
            min={min}
            max={max}
            step={step}
            color="info"
            {...other}
          />
          {(!!error || helperText) && (
            <FormHelperText error={!!error}>{error ? error.message : helperText}</FormHelperText>
          )}
        </div>
      )}
    />
  );
}
