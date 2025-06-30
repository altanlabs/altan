import React from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const MuiPhone = ({ value, name, onChange, ...restProps }) => {
  const handleChange = (phone, meta) => {
    const fakeEvent = {
      target: {
        name,
        value: phone,
      },
    };
    onChange(fakeEvent);
  };

  return (
    <PhoneInput
      style={{
        backgroundColor: 'transparent',
        color: '#fff',

        border: 'none',
      }}
      inputStyle={{
        backgroundColor: 'transparent',
        color: '#fff',
        border: '#fff',
      }}
      countrySelectorStyleProps={{
        backgroundColor: 'transparent',
        color: '#fff',
        border: 'none',
      }}
      // Add other style props as necessary
    />
  );
};

export default MuiPhone;
