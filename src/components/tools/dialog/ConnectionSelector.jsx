import { Grid, Stack, Typography } from '@mui/material';
import { memo } from 'react';

import ConnectionAppCard from '../ConnectionAppCard';

const ConnectionSelector = ({ connections, theme, onSelect }) => (
  <Stack
    spacing={0.5}
    padding={1.5}
    width="100%"
  >
    <Typography variant="h6">Connections</Typography>
    {!connections?.length ? (
      <Typography variant="caption">No connections found</Typography>
    ) : (
      <Grid
        container
        spacing={1}
      >
        {connections.map((connection) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={connection.id}
          >
            <ConnectionAppCard
              connOrApp={connection}
              theme={theme}
              onClick={() => onSelect(connection)}
            />
          </Grid>
        ))}
      </Grid>
    )}
  </Stack>
);

export default memo(ConnectionSelector);
