import { Stack, Button, TextField } from '@mui/material';
import React from 'react';

import Iconify from '../../iconify';

const ContactInfo = ({ emails, phones, handleChange }) => {
  const addEmail = () => {
    handleChange('emails', [...(emails || []), { email: '', type: 'personal' }]);
  };

  const addPhone = () => {
    handleChange('phones', [...(phones || []), { number: '', type: 'mobile' }]);
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <h3>Email Addresses</h3>
          <Button
            startIcon={<Iconify icon="material-symbols:add" />}
            onClick={addEmail}
          >
            Add Email
          </Button>
        </Stack>
        {emails?.map((email, index) => (
          <TextField
            key={index}
            fullWidth
            label="Email Address"
            value={email.email}
            onChange={(e) => {
              const newEmails = [...emails];
              newEmails[index] = { ...email, email: e.target.value };
              handleChange('emails', newEmails);
            }}
          />
        ))}
      </Stack>

      <Stack spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <h3>Phone Numbers</h3>
          <Button
            startIcon={<Iconify icon="material-symbols:add" />}
            onClick={addPhone}
          >
            Add Phone
          </Button>
        </Stack>
        {phones?.map((phone, index) => (
          <TextField
            key={index}
            fullWidth
            label="Phone Number"
            value={phone.number}
            onChange={(e) => {
              const newPhones = [...phones];
              newPhones[index] = { ...phone, number: e.target.value };
              handleChange('phones', newPhones);
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default ContactInfo;
