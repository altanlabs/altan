import { Container, Typography, Box, Alert } from '@mui/material';
import React from 'react';

import { Room } from '../lib/agents';

// Test configuration - replace with your actual agent ID
const TEST_CONFIG = {
  agentId: '03f41bb1-2f1c-4f5f-8aa1-4f4c46a22e87', // Replace with actual agent ID
  apiBaseUrl: 'https://api.altan.ai/platform/guest',
  authBaseUrl: 'https://api.altan.ai/auth/login/guest',
  debug: true,
  requestTimeout: 15000, // 15 second timeout to prevent timeouts
};

export default function SDKTestPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Altan SDK - Room Test
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Testing the Room component with agent ID: {TEST_CONFIG.agentId}
      </Alert>

      <Box
        sx={{
          height: '70vh',
          border: '1px solid #ddd',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Room
          agentId={TEST_CONFIG.agentId}
          config={{
            ...TEST_CONFIG,
            debug: true, // Enable debug mode to see authentication messages
          }}
        />
      </Box>
    </Container>
  );
}
