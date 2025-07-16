import {
  Dialog,
  DialogContent,
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
  IconButton,
} from '@mui/material';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Iconify from '../iconify';
import InteractiveHoverButton from './InteractiveHoverButton';
import { selectAccount } from '../../redux/slices/general';
import { optimai_shop } from '../../utils/axios';

// ----------------------------------------------------------------------

export default function AgentDetailsDialog({ open, onClose, agentData = null }) {
  const theme = useTheme();
  const history = useHistory();
  const account = useSelector(selectAccount);
  const [loading, setLoading] = useState(false);

  // Use agentData directly since we have all the information we need
  const agent = agentData;
  const error = null; // No error handling needed since we have the data

  const handleClone = async () => {
    // Check if user is authenticated
    if (!account?.id) {
      history.push('/auth/register');
      return;
    }

    setLoading(true);
    try {
      // Ensure agent and agent.id exist
      if (!agent?.id) {
        throw new Error('Agent information is missing');
      }

      // Use agent.id as templateId
      const templateId = agent.id;

      const response = await optimai_shop.post(
        `/v2/stripe/checkout/template?template_id=${templateId}&account_id=${account.id}`,
      );

      if (response?.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('Invalid response from checkout endpoint');
      }
    } catch (err) {
      console.error('Error with template action:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error || !agent) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error || 'Agent information not available'}</Alert>
        </Box>
      );
    }

    return (
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: 'none',
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
          {(agent.description || agent.meta_data?.description) && (
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
                {agent.description || agent.meta_data?.description}
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

          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <InteractiveHoverButton
              text={loading ? 'Starting...' : 'Clone'}
              onClick={handleClone}
              disabled={loading}
              sx={{ width: '100%', maxWidth: 300 }}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      {/* Close button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'grey.500',
          zIndex: 1,
        }}
      >
        <Iconify icon="mdi:close" />
      </IconButton>

      <DialogContent sx={{ p: 0 }}>{renderContent()}</DialogContent>
    </Dialog>
  );
}
