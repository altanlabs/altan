import { Box, Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { Construction } from 'lucide-react';

function BasePlaceholder({ title, description }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 3,
      }}
    >
      <Stack spacing={3} alignItems="center" textAlign="center" maxWidth={400}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Construction size={40} />
        </Box>
        <Stack spacing={1}>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description || 'This section is coming soon.'}
          </Typography>
        </Stack>
        <Button variant="outlined" disabled>
          Coming Soon
        </Button>
      </Stack>
    </Box>
  );
}

export default BasePlaceholder;
