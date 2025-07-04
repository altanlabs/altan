import { Fade, IconButton } from '@mui/material';
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
      <IconButton
        onClick={stopConversation}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          width: 48,
          height: 48,
          backgroundColor: 'error.main',
          color: 'white',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.6)'
              : '0 8px 32px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            backgroundColor: 'error.dark',
            transform: 'scale(1.05)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 40px rgba(0, 0, 0, 0.7)'
                : '0 12px 40px rgba(0, 0, 0, 0.2)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Iconify icon="eva:phone-off-outline" width={24} />
      </IconButton>
    </Fade>
  );
};

export default memo(FloatingVoiceWidget);
