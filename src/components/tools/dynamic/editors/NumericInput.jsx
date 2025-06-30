import { TextField, InputAdornment, Tooltip } from '@mui/material';
import { memo, useCallback, useState } from 'react';

import Iconify from '../../../iconify';

const NumericInput = ({ fieldKey, type, value, onChange, title, schema = {} }) => {
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');

  const validateInput = useCallback(
    (newValue) => {
      const { min, max } = schema;

      if (min !== undefined && newValue < min) {
        setError(true);
        setHelperText(`Value must be at least ${min}`);
        return false;
      }

      if (max !== undefined && newValue > max) {
        setError(true);
        setHelperText(`Value must not exceed ${max}`);
        return false;
      }

      setError(false);
      setHelperText('');
      return true;
    },
    [schema],
  );

  const handleChange = useCallback(
    (e) => {
      let newValue = e.target.value;

      // Allow empty or negative sign as intermediate values
      if (newValue === '' || newValue === '-') {
        onChange(newValue);
        setError(false);
        setHelperText('');
        return;
      }

      if (type === 'integer') {
        newValue = parseInt(newValue, 10);
      } else {
        newValue = parseFloat(newValue);
      }

      if (!isNaN(newValue) && validateInput(newValue)) {
        onChange(newValue);
      }
    },
    [onChange, type, validateInput],
  );

  const handleIncrement = useCallback(() => {
    const newValue = (value || 0) + (schema.step || 1);
    if (validateInput(newValue)) {
      onChange(newValue);
    }
  }, [value, schema.step, onChange, validateInput]);

  const handleDecrement = useCallback(() => {
    const newValue = (value || 0) - (schema.step || 1);
    if (validateInput(newValue)) {
      onChange(newValue);
    }
  }, [value, schema.step, onChange, validateInput]);

  return (
    <div className="relative w-full max-w-lg">
      <TextField
        type="number"
        value={value === 0 ? '0' : value || ''}
        onChange={handleChange}
        fullWidth
        variant="filled"
        size="small"
        error={error}
        hiddenLabel
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <div className="flex flex-row items-center group space-x-1">
                <div className="flex flex-col items-center space-y-1 cursor-pointer ">
                  <Iconify
                    icon="mdi:arrow-up"
                    width={12}
                    className="opacity-50 group-hover:opacity-100"
                    aria-label="Increase"
                    onClick={handleIncrement}
                  />
                  <Iconify
                    icon="mdi:arrow-down"
                    width={12}
                    className="opacity-50 group-hover:opacity-100"
                    onClick={handleDecrement}
                    aria-label="Decrease"
                  />
                </div>

                <span className="text-sm font-medium text-gray-600">
                  {type === 'integer' ? 'Int' : 'Float'}
                </span>
              </div>
            </InputAdornment>
          ),
          inputProps: {
            min: schema.min,
            max: schema.max,
            step: schema.step || (type === 'integer' ? 1 : 'any'),
            sx: {
              '&::placeholder': {
                fontStyle: 'italic',
                fontSize: '0.8rem',
                opacity: 0.7,
              },
            },
          },
        }}
        placeholder={`Enter ${title ?? fieldKey}...`}
      />

      {/* Numeric Helpers */}
      <div className="mt-2 text-sm">
        {!error ? (
          <div className="text-gray-600">
            {schema.min !== undefined && schema.max !== undefined && (
              <Tooltip
                title="Valid range for this input"
                arrow
              >
                <span>
                  Allowed range: <strong>{schema.min}</strong> to <strong>{schema.max}</strong>.
                </span>
              </Tooltip>
            )}
            {schema.step && (
              <span className="ml-2">
                Step: <strong>{schema.step}</strong>.
              </span>
            )}
          </div>
        ) : (
          <div className="text-red-500 font-semibold">{helperText}</div>
        )}
      </div>
    </div>
  );
};

export default memo(NumericInput);
