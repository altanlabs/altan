import { Container, Typography, Box, Alert } from '@mui/material';
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();

  // Parse query parameters for room configuration
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      tabs: params.get('tabs') !== null ? params.get('tabs') === 'true' : undefined,
      conversation_history: params.get('conversation_history') !== null ? params.get('conversation_history') === 'true' : undefined,
      members: params.get('members') !== null ? params.get('members') === 'true' : undefined,
      settings: params.get('settings') !== null ? params.get('settings') === 'true' : undefined,
      theme: params.get('theme') || undefined,
      title: params.get('title') || undefined,
      description: params.get('description') || undefined,
      suggestions: params.get('suggestions') ? JSON.parse(decodeURIComponent(params.get('suggestions'))) : undefined,
      voice_enabled: params.get('voice_enabled') !== null ? params.get('voice_enabled') === 'true' : undefined,
    };
  }, [location.search]);

  // Default room configuration (can be overridden by query params)
  const defaultRoomConfig = {
    tabs: true,
    conversation_history: true,
    members: true,
    settings: true,
    theme: undefined,
    title: undefined,
    description: undefined,
    suggestions: ['How can I help you?', 'Tell me about your services', 'I need support'],
    voice_enabled: true,
  };

  // Merge default config with query parameters (query params take precedence)
  const roomConfig = useMemo(() => {
    const merged = { ...defaultRoomConfig };
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined) {
        merged[key] = queryParams[key];
      }
    });
    return merged;
  }, [queryParams]);

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 4 }}
    >
      <Typography
        variant="h4"
        gutterBottom
      >
        Altan SDK - Room Component with Configuration
      </Typography>

      <Alert
        severity="success"
        sx={{ mb: 3 }}
      >
        <div>
          <strong>🚀 NEW: Room Configuration Support!</strong>
          <br />• <code>RoomConfigProps</code> - Full room personalization interface
          <br />• Theme, UI panels, voice controls, suggestions, and more
          <br />• TypeScript support with proper type exports
          <br />• Query parameter integration for easy testing
        </div>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>How it works:</strong> SDK now accepts room configuration props that are passed as query parameters to the room iframe.
        All personalization options from StandaloneRoomPage are now available in the SDK.
      </Alert>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>🛠️ Test Configuration via Query Parameters:</strong>
        <br />Add query parameters to test different room configurations:
        <br />• <code>?tabs=false&voice_enabled=false&theme=dark</code>
        <br />• <code>?title=Custom%20Title&suggestions=[&quot;Hello&quot;,&quot;Help&quot;]</code>
        <br />• Available params: tabs, conversation_history, members, settings, theme, title, description, suggestions, voice_enabled
      </Alert>

      <Typography variant="body1" sx={{ mb: 2 }}>
        The room component now supports full configuration. Test with different query parameters!
        <br />
        <strong>Active config:</strong>
      </Typography>

      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <pre style={{ fontSize: '12px', margin: 0 }}>
          {JSON.stringify(roomConfig, null, 2)}
        </pre>
      </Box>

      {/* Demo content */}
      <Box sx={{ height: '80vh', backgroundColor: '#f5f5f5', p: 3, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          SDK Room Configuration Demo
        </Typography>
        <Typography variant="body1" paragraph>
          The compact room below uses the configuration object above.
          All props are passed to the iframe as query parameters.
        </Typography>
        <Typography variant="body1" paragraph>
          Try adding <code>?theme=dark&tabs=false</code> to the URL to see the configuration in action!
        </Typography>
      </Box>

      {/* Room Component with Full Configuration Support */}
      <Room
        mode="compact"
        accountId={TEST_CONFIG.accountId}
        agentId={TEST_CONFIG.agentId}
        placeholder={roomConfig.title || 'How can I help you?'}
        config={{
          apiBaseUrl: TEST_CONFIG.apiBaseUrl,
          authBaseUrl: TEST_CONFIG.authBaseUrl,
          roomBaseUrl: TEST_CONFIG.roomBaseUrl,
        }}
        guestInfo={{
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          external_id: 'sdk-test-config',
        }}
        onConversationReady={(room) => {
          console.log('✅ Room ready with configuration:', roomConfig, room);
        }}
        onAuthSuccess={(guest) => {
          console.log('✅ Auth ready:', guest);
        }}
        // Pass all room configuration props
        {...roomConfig}
      />
    </Container>
  );
}
