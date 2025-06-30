import { Stack, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import React from 'react';

import Iconify from '../../iconify';

const AddressInfo = ({ addresses, handleChange }) => {
  const addAddress = () => {
    handleChange('addresses', [
      ...(addresses || []),
      {
        street: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        type: 'home',
      },
    ]);
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <h3>Addresses</h3>
        <Button
          startIcon={<Iconify icon="material-symbols:add" />}
          onClick={addAddress}
        >
          Add Address
        </Button>
      </Stack>

      {addresses?.map((address, index) => (
        <Stack
          key={index}
          spacing={2}
          sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
          >
            <TextField
              fullWidth
              label="Street Address"
              value={address.street || ''}
              onChange={(e) => {
                const newAddresses = [...addresses];
                newAddresses[index] = { ...address, street: e.target.value };
                handleChange('addresses', newAddresses);
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={address.type || 'home'}
                label="Type"
                onChange={(e) => {
                  const newAddresses = [...addresses];
                  newAddresses[index] = { ...address, type: e.target.value };
                  handleChange('addresses', newAddresses);
                }}
              >
                <MenuItem value="home">Home</MenuItem>
                <MenuItem value="work">Work</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
          >
            <TextField
              fullWidth
              label="City"
              value={address.city || ''}
              onChange={(e) => {
                const newAddresses = [...addresses];
                newAddresses[index] = { ...address, city: e.target.value };
                handleChange('addresses', newAddresses);
              }}
            />
            <TextField
              fullWidth
              label="State/Province"
              value={address.state || ''}
              onChange={(e) => {
                const newAddresses = [...addresses];
                newAddresses[index] = { ...address, state: e.target.value };
                handleChange('addresses', newAddresses);
              }}
            />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
          >
            <TextField
              fullWidth
              label="Country"
              value={address.country || ''}
              onChange={(e) => {
                const newAddresses = [...addresses];
                newAddresses[index] = { ...address, country: e.target.value };
                handleChange('addresses', newAddresses);
              }}
            />
            <TextField
              fullWidth
              label="Postal Code"
              value={address.postal_code || ''}
              onChange={(e) => {
                const newAddresses = [...addresses];
                newAddresses[index] = { ...address, postal_code: e.target.value };
                handleChange('addresses', newAddresses);
              }}
            />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

export default AddressInfo;
