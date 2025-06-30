import {
  Paper,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import React, { memo, useState } from 'react';

import { UploadAvatar } from '../upload';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserProfileCard = ({ profileData, handleChange, handleDropSingleFile, avatarSrc }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Paper sx={{ p: 3 }}>
      <Grid
        container
        spacing={3}
      >
        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: 'flex', justifyContent: 'center' }}
        >
          <Stack
            spacing={2}
            alignItems="center"
          >
            <UploadAvatar
              accept={{ 'image/*': [] }}
              file={avatarSrc || null}
              onDrop={(accepted) => handleDropSingleFile(accepted, 'avatar')}
              sx={{ width: 200, height: 200 }}
            />
            <TextField
              fullWidth
              size="medium"
              name="nickname"
              label="Nickname"
              value={profileData.nickname || ''}
              onChange={(e) => handleChange('nickname', e.target.value)}
            />
          </Stack>
        </Grid>

        <Grid
          item
          xs={12}
          md={8}
        >
          <Stack spacing={3}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
            >
              <TextField
                fullWidth
                size="medium"
                name="first_name"
                label="First Name"
                value={profileData.first_name || ''}
                onChange={(e) => handleChange('first_name', e.target.value)}
              />
              <TextField
                fullWidth
                size="medium"
                name="last_name"
                label="Last Name"
                value={profileData.last_name || ''}
                onChange={(e) => handleChange('last_name', e.target.value)}
              />
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
            >
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  value={profileData.gender || ''}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <DatePicker
                label="Birthday"
                slotProps={{ textField: { fullWidth: true } }}
                value={profileData.birthday ? new Date(profileData.birthday) : null}
                onChange={(newValue) => handleChange('birthday', newValue)}
              />
            </Stack>
          </Stack>
        </Grid>

        {/* <Grid item xs={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Contact" />
              <Tab label="Address" />
              <Tab label="Social" />
              <Tab label="Employment" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <ContactInfo
              emails={profileData.emails}
              phones={profileData.phones}
              handleChange={handleChange}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <AddressInfo
              addresses={profileData.addresses}
              handleChange={handleChange}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <SocialInfo
              socials={profileData.socials}
              handleChange={handleChange}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <EmploymentInfo
              employment={profileData.employment}
              handleChange={handleChange}
            />
          </TabPanel>
        </Grid> */}
      </Grid>
    </Paper>
  );
};

export default memo(UserProfileCard);
