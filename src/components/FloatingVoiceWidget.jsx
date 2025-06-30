import { Fade, IconButton, Paper, Typography, Box } from '@mui/material';
import React, { memo } from 'react';

import Iconify from './iconify';
import { useVoiceConversation } from '../providers/voice/VoiceConversationProvider';

const FloatingVoiceWidget = () => {
  const {
    isConnected,
    stopConversation,
  } = useVoiceConversation();

  if (!isConnected) {
    return null;
  }

  return (
    <Fade in={isConnected}>
      <Paper
        elevation={12}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          p: 2.5,
          borderRadius: 4,
          backgroundColor: 'background.paper',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          minWidth: 240,
          maxWidth: 280,
          backdropFilter: 'blur(16px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              : '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 16px 48px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)'
                : '0 16px 48px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: 'success.main',
                boxShadow: (theme) => `0 0 8px ${theme.palette.success.main}40`,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                  '50%': {
                    opacity: 0.7,
                    transform: 'scale(1.1)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                },
              }}
            />
            <Box>
              <Typography variant="body2" fontWeight="600" color="text.primary">
                Voice Chat Active
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                Listening...
              </Typography>
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={stopConversation}
            sx={{
              backgroundColor: 'error.main',
              color: 'white',
              width: 32,
              height: 32,
              '&:hover': {
                backgroundColor: 'error.dark',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Iconify icon="eva:close-outline" width={18} />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            borderRadius: 2,
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          }}
        >
          <Iconify icon="eva:volume-up-outline" width={16} color="text.secondary" />
          <Typography variant="caption" color="text.secondary">
            End conversation anytime
          </Typography>
        </Box>
      </Paper>
    </Fade>
  );
};

export default memo(FloatingVoiceWidget);
