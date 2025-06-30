import { getTranslation } from '@assets/translations';
import { getTextColor } from '@components/utils/themeUtils';
import { FormControlLabel, Checkbox, Radio, RadioGroup, FormControl, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';

const Title = styled('h3')(({ textColor }) => ({
  fontFamily: 'Helvetica Bold, sans-serif',
  fontSize: '1rem',
  textAlign: 'left',
  zIndex: 1110,
  color: textColor,
  marginBottom: 5,
  marginTop: '0px',
  paddingLeft: 10,
}));

const selectGlobal = state => state.global;

const Poll = ({ widget, theme }) => {
  const data = widget.meta_data;

  const [selected, setSelected] = useState(data.multiple_choices ? {} : '');

  const handleChange = (event) => {
    if (data.multiple_choices) {
      setSelected({ ...selected, [event.target.name]: event.target.checked });
    } else {
      setSelected(event.target.value);
    }
  };

  const handleSubmit = () => {
    console.log('Selected:', selected);
  };

  return (
    <FormControl component="fieldset" sx={{ p: '10px 20px 10px 0px' }}>
      <Title textColor={getTextColor(theme)}>{data.question}</Title>
      <RadioGroup value={selected} onChange={handleChange}>
        <Stack direction="column" spacing={0.5} padding={0}>
          {data.options.map((option, index) => (
          data.multiple_choices ? (
            <FormControlLabel
              key={index}
              control={<Checkbox checked={selected[option] || false} onChange={handleChange} name={option} />}
              label={option}
            />
          ) : (
            <FormControlLabel
              key={index}
              value={option}
              control={<Radio sx={{ color: getTextColor(theme) }} />}
              label={option}
              slotProps={{
                typography: { variant: 'p', sx: { color: getTextColor(theme) } },
              }}
            />
          )
        ))}
        </Stack>
      </RadioGroup>
      <button
        onClick={handleSubmit}
        className={`inline-block w-fit mt-2 mx-1 text-left px-3 py-3 text-sm font-bold border-none rounded transition-all duration-300 text-blue-600 hover:bg-blue-200 active:scale-95 ${
          theme === 'light' ? 'bg-blue-100' : 'bg-gray-700'
        }`}
      >
        {getTranslation('submit', navigator.language || navigator.userLanguage)}
      </button>
    </FormControl>
  );
};

export default Poll;
