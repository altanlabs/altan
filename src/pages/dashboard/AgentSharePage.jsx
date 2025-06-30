import { Box, Alert, CircularProgress, Typography, Stack, useTheme } from '@mui/material';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import VoiceConversation from './components/VoiceConversation';
import { VoiceConversationProvider } from '../../providers/voice/VoiceConversationProvider';

// ----------------------------------------------------------------------

export default function AgentSharePage() {
  const { agentId } = useParams();
  const theme = useTheme();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true);
        console.log('Fetching agent:', agentId);
        const response = await axios.get(`https://api.altan.ai/platform/agent/${agentId}/public`);
        console.log('Agent response:', response.data);
        setAgent(response.data.agent);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch agent:', err);
        setError('Failed to load agent information');
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !agent) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Alert severity="error">
          {error || 'Agent not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <VoiceConversationProvider>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Stack>
          <VoiceConversation
            elevenlabsId={agent?.elevenlabs_id}
            agentName={agent?.name}
            showLanguageSelector={true}
            onConnect={() => {
              console.log('Voice conversation started with agent:', agent.name);
            }}
            onDisconnect={() => {
              console.log('Voice conversation ended with agent:', agent.name);
            }}
            onMessage={(message) => {
              console.log('Message from agent:', message);
            }}
            onError={(error) => {
              console.error('Voice conversation error:', error);
            }}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              cursor: 'pointer',
            }}
            onClick={() => window.open('https://altan.ai/', '_blank')}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Powered by
            </Typography>
            <img
              src={theme.palette.mode === 'dark' ? '/logos/horizontalWhite.png' : '/logos/horizontalBlack.png'}
              alt="Altan AI"
              style={{
                height: '13px',
                width: 'auto',
              }}
            />
          </Box>
        </Stack>
      </Box>
    </VoiceConversationProvider>
  );
}
