import { Box, Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { memo } from 'react';

const VoicePreview = memo(({ agentData, onConfigureVoice }) => {
  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        {!agentData?.elevenlabs_id ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h1"
              sx={{ fontSize: '4rem', mb: 2 }}
            >
              🎤
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Select a voice to get started
            </Typography>
            <Button
              onClick={onConfigureVoice}
              variant="contained"
              size="small"
            >
              Configure Voice
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          >
            <iframe
              src={`/agents/${agentData.id}/share`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px',
              }}
              title="Voice Conversation"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
});

VoicePreview.displayName = 'VoicePreview';
VoicePreview.propTypes = {
  agentData: PropTypes.object,
  onConfigureVoice: PropTypes.func.isRequired,
};

export default VoicePreview; 