import { Container, Typography, Box, Alert, Tab, Tabs } from '@mui/material';
import React from 'react';

import { Room } from '../lib/agents';

// Test configuration - accountId is now required
const TEST_CONFIG = {
  accountId: 'afd0ea2c-b44a-475b-b433-096eece24085', // Your account ID (required)
  agentId: '10a3835b-c8a3-4bbd-b9be-a3a7dea7bc11', // Agent to chat with
  roomId: 'your-group-chat-room-id', // Example room ID for group chat
  apiBaseUrl: 'https://api.altan.ai/platform/guest',
  authBaseUrl: 'https://api.altan.ai/auth/login/guest',
  roomBaseUrl: 'https://altan.ai/r', // Use production room server
};

export default function SDKTestPage() {
  const [tabValue, setTabValue] = React.useState(0);

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 4 }}
    >
      <Typography
        variant="h4"
        gutterBottom
      >
        Altan SDK - Room Component
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        <div>
          <strong>Ultra-clean Room component with two modes:</strong>
          <br />• <code>mode="agent"</code> - Chat with an agent (finds existing DM or creates new)
          <br />• <code>mode="room"</code> - Join a specific room (perfect for group chat)
        </div>
      </Alert>

      <Tabs 
        value={tabValue} 
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Agent Mode" />
        <Tab label="Room Mode" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            <strong>Agent Mode:</strong> Start/continue conversation with an agent
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
              mode="agent"
              accountId={TEST_CONFIG.accountId}
              agentId={TEST_CONFIG.agentId}
              config={{
                apiBaseUrl: TEST_CONFIG.apiBaseUrl,
                authBaseUrl: TEST_CONFIG.authBaseUrl,
                roomBaseUrl: TEST_CONFIG.roomBaseUrl,
              }}
              guestInfo={{
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com',
                external_id: 'sdk-test-user-123',
              }}
              onConversationReady={(room) => {
                console.log('💬 Conversation ready:', room);
              }}
              onAuthSuccess={(guest, tokens) => {
                console.log('🔐 Authentication successful:', guest);
              }}
            />
          </Box>
        </>
      )}

      {tabValue === 1 && (
        <>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Room Mode:</strong> Join a specific room by ID (replace with real room ID to test)
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
              mode="room"
              accountId={TEST_CONFIG.accountId}
              roomId={TEST_CONFIG.roomId}
              config={{
                apiBaseUrl: TEST_CONFIG.apiBaseUrl,
                authBaseUrl: TEST_CONFIG.authBaseUrl,
                roomBaseUrl: TEST_CONFIG.roomBaseUrl,
              }}
              guestInfo={{
                first_name: 'Community',
                last_name: 'Member',
                email: 'community@example.com',
                external_id: 'community-member-456',
              }}
              onRoomJoined={(guest, tokens) => {
                console.log('🎉 Joined room:', guest);
              }}
              onAuthSuccess={(guest, tokens) => {
                console.log('🔐 Authentication successful:', guest);
              }}
            />
          </Box>
        </>
      )}
    </Container>
  );
}
