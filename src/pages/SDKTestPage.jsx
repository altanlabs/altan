import { Container, Typography, Box, Alert } from '@mui/material';
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
        severity="success"
        sx={{ mb: 3 }}
      >
        <div>
          <strong>🚀 NEW: Compact Mode with Mobile-First Design!</strong>
          <br />• <code>mode=&quot;compact&quot;</code> - GPU-accelerated scale transforms
          <br />• Mobile responsive: 450px desktop, adapts to viewport on mobile
          <br />• Click text field for smooth scale animation with bounce effect
          <br />• Room pre-loads hidden with background authentication
        </div>
      </Alert>

              <Alert severity="info" sx={{ mb: 2 }}>
          <strong>How it works:</strong> Text field appears instantly while room pre-loads hidden (scale: 0).
          Click anywhere for buttery smooth scale animation from bottom-center origin.
        </Alert>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Look for the floating text field at bottom center. Notice the subtle blue dot while it&apos;s loading in background.
      </Typography>

      {/* Demo content */}
      <Box sx={{ height: '80vh', backgroundColor: '#f5f5f5', p: 3, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Background Pre-loading Demo
        </Typography>
        <Typography variant="body1" paragraph>
          The room is already loaded invisibly at scale 0.
          Click the text field for GPU-accelerated smooth scaling animation.
        </Typography>
        <Typography variant="body1" paragraph>
          Once expanded, use the room&apos;s native interface for messaging and voice chat!
        </Typography>
      </Box>

      {/* Compact Room Component with Background Pre-loading */}
      <Room
        mode="compact"
        accountId={TEST_CONFIG.accountId}
        agentId={TEST_CONFIG.agentId}
        placeholder="How can I help you?"
        config={{
          apiBaseUrl: TEST_CONFIG.apiBaseUrl,
          authBaseUrl: TEST_CONFIG.authBaseUrl,
          roomBaseUrl: TEST_CONFIG.roomBaseUrl,
        }}
        guestInfo={{
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          external_id: 'sdk-test-preload',
        }}
        onConversationReady={(room) => {
          console.log('✅ Background pre-loading complete:', room);
        }}
        onAuthSuccess={(guest) => {
          console.log('✅ Auth ready:', guest);
        }}
      />
    </Container>
  );
}
