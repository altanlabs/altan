import { Container, Typography, Box, Alert } from '@mui/material';
import React from 'react';

import { Room } from '../lib/agents';

// Test configuration - accountId is now required
const TEST_CONFIG = {
  accountId: 'afd0ea2c-b44a-475b-b433-096eece24085', // Your account ID (required)
  agentId: '10a3835b-c8a3-4bbd-b9be-a3a7dea7bc11', // Agent to chat with
  apiBaseUrl: 'https://api.altan.ai/platform/guest',
  authBaseUrl: 'https://api.altan.ai/auth/login/guest',
  roomBaseUrl: 'https:/altan.ai/r', // Use local dev server
  debug: true,
  requestTimeout: 15000, // 15 second timeout
};

export default function SDKTestPage() {
  // Clear any stored tokens for fresh SDK test
  React.useEffect(() => {
    console.log('🧪 Clearing stored tokens for fresh SDK test...');
    const accountId = TEST_CONFIG.accountId;

    try {
      // Clear account-scoped storage keys (new SDK format)
      localStorage.removeItem(`altan_guest_access_${accountId}`);
      localStorage.removeItem(`altan_guest_refresh_${accountId}`);
      localStorage.removeItem(`altan_guest_data_${accountId}`);
      console.log('🧪 ✅ Cleared stored tokens for fresh start');
    } catch (error) {
      console.warn('🧪 Failed to clear storage:', error);
    }
  }, []);

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 4 }}
    >
      <Typography
        variant="h4"
        gutterBottom
      >
        Altan SDK - Room Test
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        <div>
          <strong>Testing the new modular SDK:</strong>
          <br />• Account ID: {TEST_CONFIG.accountId}
          <br />• Agent ID: {TEST_CONFIG.agentId}
          <br />• The SDK will create a guest, room, and authenticate automatically
        </div>
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
          accountId={TEST_CONFIG.accountId}
          agentId={TEST_CONFIG.agentId}
          config={{
            apiBaseUrl: TEST_CONFIG.apiBaseUrl,
            authBaseUrl: TEST_CONFIG.authBaseUrl,
            roomBaseUrl: TEST_CONFIG.roomBaseUrl,
            debug: TEST_CONFIG.debug,
            requestTimeout: TEST_CONFIG.requestTimeout,
          }}
          guestInfo={{
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            external_id: 'sdk-test-user-123',
          }}
          onRoomCreated={(room) => {
            console.log('🏠 SDK Room created successfully:', room);
          }}
          onAuthSuccess={(guest, tokens) => {
            console.log('🔐 SDK Authentication successful:', {
              guest: guest,
              hasAccessToken: !!tokens.accessToken,
              hasRefreshToken: !!tokens.refreshToken,
              tokens: tokens,
            });
          }}
          onError={(error) => {
            console.error('❌ SDK Error:', error);
          }}
        />
      </Box>
    </Container>
  );
}
