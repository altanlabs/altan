import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import useEventListener from '../../hooks/useEventListener';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

// ----------------------------------------------------------------------

RHFCodes.propTypes = {
  keyName: PropTypes.string,
  inputs: PropTypes.arrayOf(PropTypes.string),
};

export default function RHFCodes({ keyName = '', inputs = [], ...other }) {
  const codesRef = useRef(null);

  const { control, setValue } = useFormContext();

  const handlePaste = (event) => {
    let data = event.clipboardData.getData('text');

    data = data.split('');

    inputs.map((input, index) => setValue(input, data[index]));

    event.preventDefault();
  };

  const handleChangeWithNextField = (event, handleChange) => {
    const { maxLength, value, name } = event.target;

    const fieldIndex = name.replace(keyName, '');

    const fieldIntIndex = Number(fieldIndex);

    const nextfield = document.querySelector(`input[name=${keyName}${fieldIntIndex + 1}]`);

    if (value.length > maxLength) {
      event.target.value = value[0];
    }

    if (value.length >= maxLength && fieldIntIndex < 6 && nextfield !== null) {
      nextfield.focus();
    }

    handleChange(event);
  };

  useEventListener('paste', handlePaste, codesRef);

  return (
    <div
      ref={codesRef}
      className="flex flex-row gap-2 justify-center w-full"
    >
      {inputs.map((name, index) => (
        <Controller
          key={name}
          name={`${keyName}${index + 1}`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              autoFocus={index === 0}
              placeholder="-"
              onChange={(event) => {
                handleChangeWithNextField(event, field.onChange);
              }}
              onFocus={(event) => event.currentTarget.select()}
              maxLength={1}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className={cn(
                'w-12 h-12 sm:w-14 sm:h-14 text-center text-lg font-semibold',
                error && 'border-destructive focus-visible:ring-destructive'
              )}
              {...other}
            />
          )}
        />
      ))}
    </div>
  );
}
