import TextField from '@mui/material/TextField';
import React from 'react';

const PriceEditor = ({ value, onChange }) => {
  // Convert the value from cents to dollars/euros for display
  const displayValue = (value / 100).toFixed(2);

  // Handle changes in the text field
  const handleChange = (event) => {
    const newValue = event.target.value;

    // Validate and parse the new value to ensure it's a valid price
    const parsedValue = parseFloat(newValue);
    if (!isNaN(parsedValue)) {
      // Convert back to cents and call onChange
      onChange(Math.round(parsedValue * 100));
    } else if (newValue === '') {
      // If the user clears the input, reset to zero
      onChange(0);
    }
  };

  return (
    <TextField
      width="100%"
      label="Price"
      size="small"
      value={displayValue}
      onChange={handleChange}
      inputProps={{
        inputMode: 'decimal',
        pattern: '^[0-9]*\.?[0-9]{0,2}$',
      }}
    />
  );
};

export default PriceEditor;
