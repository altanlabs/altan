import { Stack, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import React from 'react';

import Iconify from '../../iconify';

const SocialInfo = ({ socials, handleChange }) => {
  const addSocial = () => {
    handleChange('socials', [
      ...(socials || []),
      {
        platform: '',
        username: '',
        url: '',
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
        <h3>Social Media Accounts</h3>
        <Button
          startIcon={<Iconify icon="material-symbols:add" />}
          onClick={addSocial}
        >
          Add Social Account
        </Button>
      </Stack>

      {socials?.map((social, index) => (
        <Stack
          key={index}
          spacing={2}
          sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}
        >
          <FormControl fullWidth>
            <InputLabel>Platform</InputLabel>
            <Select
              value={social.platform || ''}
              label="Platform"
              onChange={(e) => {
                const newSocials = [...socials];
                newSocials[index] = { ...social, platform: e.target.value };
                handleChange('socials', newSocials);
              }}
            >
              <MenuItem value="linkedin">LinkedIn</MenuItem>
              <MenuItem value="twitter">Twitter</MenuItem>
              <MenuItem value="facebook">Facebook</MenuItem>
              <MenuItem value="instagram">Instagram</MenuItem>
              <MenuItem value="github">GitHub</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Username"
            value={social.username || ''}
            onChange={(e) => {
              const newSocials = [...socials];
              newSocials[index] = { ...social, username: e.target.value };
              handleChange('socials', newSocials);
            }}
          />

          <TextField
            fullWidth
            label="Profile URL"
            value={social.url || ''}
            onChange={(e) => {
              const newSocials = [...socials];
              newSocials[index] = { ...social, url: e.target.value };
              handleChange('socials', newSocials);
            }}
          />
        </Stack>
      ))}
    </Stack>
  );
};

export default SocialInfo;
