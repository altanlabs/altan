import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { memo } from 'react';

const ChatPreview = memo(({ currentAgentDmRoomId }) => {
  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
      }}
    >
      {currentAgentDmRoomId ? (
        // <Room
        //   key={currentAgentDmRoomId}
        //   roomId={currentAgentDmRoomId}
        //   header={false}
        // />
        <iframe src={`/r/${currentAgentDmRoomId}?header=false`} style={{ width: '100%', height: '100%', border: 'none' }}/>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h1"
              sx={{ fontSize: '4rem', mb: 2 }}
            >
              💬
            </Typography>
            <Typography color="text.secondary">
              Agent chat room is not available.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
});

ChatPreview.displayName = 'ChatPreview';
ChatPreview.propTypes = {
  currentAgentDmRoomId: PropTypes.string,
};

export default ChatPreview; 