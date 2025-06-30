import { TextField, TextFieldProps } from '@mui/material';
import { AnimatePresence, m } from 'framer-motion';
import React, { useState, useEffect, useRef, memo, ChangeEvent, useCallback } from 'react';

import usePageVisibility from '@hooks/usePageVisibility';

type SlidingPlaceholderTextFieldProps = TextFieldProps & {
  placeholders: string[];
  enableDoubleClick: boolean;
};

const SlidingPlaceholderTextField: React.FC<SlidingPlaceholderTextFieldProps> = ({
  placeholders,
  InputProps,
  value,
  // enableDoubleClick = false,
  ...rest
}) => {
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const isPageVisible = usePageVisibility();

  const startPlaceholderAnimation = () => {
    if (!intervalRef.current) {
      intervalRef.current = window.setInterval(() => {
        setCurrentPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
      }, 3000);
    }
  };

  useEffect(() => {
    if (isPageVisible) {
      startPlaceholderAnimation();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isPageVisible, placeholders]);

  const handleDoubleClick = useCallback(() => {
    if (rest.onChange && !value) {
      const placeholderValue = placeholders[currentPlaceholderIndex];
      const syntheticEvent = {
        target: { value: placeholderValue },
      } as ChangeEvent<HTMLInputElement>;

      rest.onChange(syntheticEvent);
    }
  }, [currentPlaceholderIndex, placeholders, rest, value]);

  return (
    <div className="relative">
      <TextField
        {...rest}
        value={value}
        InputProps={{
          ...InputProps,
          className: 'relative z-10',
        }}
        InputLabelProps={{
          shrink: true, // This line ensures the label is always shrunk
        }}
        placeholder="" // Hide default placeholder
        onDoubleClick={handleDoubleClick}
      />
      <div className="absolute inset-0 flex items-center pointer-events-none">
        <AnimatePresence mode="wait">
          {!value && (
            <m.p
              key={`placeholder-${currentPlaceholderIndex}`}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'linear' }}
              className="text-gray-500 pl-3"
            >
              {placeholders[currentPlaceholderIndex]}
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default memo(SlidingPlaceholderTextField);
