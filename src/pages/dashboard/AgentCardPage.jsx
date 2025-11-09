import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Alert,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Divider,
  useTheme,
} from '@mui/material';
import axios from 'axios';

import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

export default function AgentCardPage() {
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
        const response = await axios.get(`https://platform-api.altan.ai/agent/${agentId}/public`);
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
        <Alert severity="error">{error || 'Agent not found'}</Alert>
      </Box>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: agent.name,
        text: agent.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  const handleVoiceChat = () => {
    window.open(`/agents/${agentId}/share`, '_blank');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          borderRadius: 4,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 20px 40px rgba(0, 0, 0, 0.4)'
              : '0 20px 40px rgba(0, 0, 0, 0.1)',
          background: theme.palette.background.paper,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Agent Avatar and Name */}
          <Stack
            alignItems="center"
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Avatar
              src={agent.avatar_url}
              alt={agent.name}
              sx={{
                width: 80,
                height: 80,
                border: `3px solid ${theme.palette.primary.main}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {!agent.avatar_url && (
                <Iconify
                  icon="mdi:robot"
                  sx={{ fontSize: 40 }}
                />
              )}
            </Avatar>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                textAlign: 'center',
                color: theme.palette.text.primary,
              }}
            >
              {agent.name}
            </Typography>
          </Stack>

          {/* Agent Description */}
          {agent.description && (
            <>
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  color: theme.palette.text.secondary,
                  lineHeight: 1.6,
                  mb: 3,
                }}
              >
                {agent.description}
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </>
          )}

          {/* Agent Capabilities */}
          <Stack
            spacing={2}
            sx={{ mb: 4 }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600 }}
            >
              Capabilities
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              {agent.elevenlabs_id && (
                <Chip
                  icon={<Iconify icon="mdi:microphone" />}
                  label="Voice Chat"
                  color="primary"
                  variant="outlined"
                />
              )}
              <Chip
                icon={<Iconify icon="mdi:chat" />}
                label="Text Chat"
                color="secondary"
                variant="outlined"
              />
              <Chip
                icon={<Iconify icon="mdi:translate" />}
                label="Multi-language"
                color="info"
                variant="outlined"
              />
            </Stack>
          </Stack>
        </CardContent>

        {/* Powered by Footer */}
        <Box
          sx={{
            textAlign: 'center',
            py: 2,
            px: 3,
            backgroundColor: theme.palette.grey[50],
            borderTop: `1px solid ${theme.palette.divider}`,
            cursor: 'pointer',
          }}
          onClick={() => window.open('https://altan.ai/', '_blank')}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Powered by
            </Typography>
            <img
              src={
                theme.palette.mode === 'dark'
                  ? '/logos/horizontalWhite.png'
                  : '/logos/horizontalBlack.png'
              }
              alt="Altan AI"
              style={{
                height: '12px',
                width: 'auto',
              }}
            />
          </Stack>
        </Box>
      </Card>
    </Box>
  );
}
