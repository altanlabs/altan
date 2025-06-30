import SearchIcon from '@mui/icons-material/Search';
import {
  Typography,
  Stack,
  Container,
  Card,
  Box,
  Button,
  Avatar,
  Grid,
  InputAdornment,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';

import { CustomTextField } from '@components/custom-input';

import { getAllApps } from '../redux/slices/superadmin';
import { dispatch } from '../redux/store';

const Logo = ({ app }) => {
  return app.meta_data?.ui?.logo_file ? (
    <Avatar
      name="Logo"
      src={`https://storage.googleapis.com/logos-chatbot-optimai/lg_${app.id}?ignoreCache=0`}
    />
  ) : (
    <Avatar
      name="Logo"
      src={`https://storage.googleapis.com/logos-chatbot-optimai/account/${app.account}`}
    />
  );
};

export default function AppHubPage() {
  const { apps, isLoading, initialized } = useSelector((state) => state.superadmin);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(getAllApps());
  }, []);

  const handleAppClick = (id) => {
    window.open(`https://app.altan.ai/${id}`, '_blank');
  };

  const filteredApps =
    apps?.filter(
      (app) =>
        app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.meta_data?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.meta_data?.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.meta_data?.personality?.job &&
          app.meta_data.personality.job.toLowerCase().includes(searchQuery.toLowerCase())),
    ) || [];

  return (
    <>
      <Helmet>
        <title>App Hub · Altan</title>
      </Helmet>

      <Container>
        <Stack spacing={2}>
          <Typography
            variant="h3"
            paragraph
          >
            App Hub
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            The public collection apps created with Altan
          </Typography>
          <CustomTextField
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps..."
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {isLoading.apps || !initialized.apps ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box
              gap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              }}
            >
              {filteredApps.map((app, index) => (
                <Card
                  key={app.id}
                  sx={{ p: 2 }}
                >
                  <Grid
                    container
                    justifyContent="space-between"
                  >
                    <Grid item>
                      <Typography variant="h6">{app.meta_data.name}</Typography>
                    </Grid>
                    <Grid item>
                      <Logo app={app} />
                    </Grid>
                  </Grid>
                  <Button
                    onClick={() => handleAppClick(app.id)}
                    fullWidth
                    variant="soft"
                    sx={{ mt: 2 }}
                  >
                    View
                  </Button>
                </Card>
              ))}
            </Box>
          )}
        </Stack>
      </Container>
    </>
  );
}
