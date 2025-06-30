import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';

// @mui
import SlidingPlaceholderTextField from '../tools/dynamic/editors/SlidingPlaceholderTextField';

// ----------------------------------------------------------------------

RHFSlidingPlaceholderTextField.propTypes = {
  name: PropTypes.string.isRequired,
  helperText: PropTypes.node,
  placeholders: PropTypes.array,
};

export default function RHFSlidingPlaceholderTextField({
  name,
  helperText,
  placeholders,
  controllerProps = null,
  ...other
}) {
  const { control } = useFormContext();
  return (
    <Controller
      {...controllerProps}
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <SlidingPlaceholderTextField
          {...field}
          label="Name"
          placeholders={placeholders}
          fullWidth
          {...other}
        />
      )}
    />
  );
}
