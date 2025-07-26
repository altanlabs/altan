import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Alert } from '@mui/material';
import { ChatWidget, InlineChat } from '../../lib/agents';

const SDKDemo = ({ agentId = 'test-agent-id' }) => {
  const [showWidget, setShowWidget] = useState(false);
  const [showInline, setShowInline] = useState(false);

  return (
    <Card sx={{ mb: 2, p: 2 }}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
        >
          🚀 Altan SDK Demo
        </Typography>

        <Alert
          severity="info"
          sx={{ mb: 2 }}
        >
          Testing Altan SDK components locally. Agent ID: {agentId}
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant={showWidget ? 'contained' : 'outlined'}
            onClick={() => setShowWidget(!showWidget)}
            size="small"
          >
            {showWidget ? 'Hide' : 'Show'} Chat Widget
          </Button>

          <Button
            variant={showInline ? 'contained' : 'outlined'}
            onClick={() => setShowInline(!showInline)}
            size="small"
          >
            {showInline ? 'Hide' : 'Show'} Inline Chat
          </Button>
        </Box>

        {showWidget && (
          <Box
            sx={{
              position: 'relative',
              height: '200px',
              border: '1px dashed #ccc',
              borderRadius: 1,
              mb: 2,
            }}
          >
            <ChatWidget
              agentId={agentId}
              buttonColor="#007bff"
              position="bottom-right"
              style={{ position: 'absolute' }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ p: 1 }}
            >
              Widget appears in bottom-right
            </Typography>
          </Box>
        )}

        {showInline && (
          <Box sx={{ height: '300px', border: '1px solid #ddd', borderRadius: 1 }}>
            <InlineChat
              agentId={agentId}
              height="300px"
              theme="light"
              showHeader={true}
              placeholder="Type your message..."
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SDKDemo;
