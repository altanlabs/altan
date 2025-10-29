import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';

import Iconify from '../iconify/Iconify';

// ----------------------------------------------------------------------

const StyledModal = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  backgroundColor: '#2a2a2a',
  borderRadius: '16px',
  padding: '24px',
  maxWidth: '400px',
  width: '400px',
  zIndex: theme.zIndex.modal,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  animation: 'slideInUp 0.4s ease-out',
  '@keyframes slideInUp': {
    from: {
      transform: 'translateY(100%)',
      opacity: 0,
    },
    to: {
      transform: 'translateY(0)',
      opacity: 1,
    },
  },
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100vw - 40px)',
    maxWidth: 'calc(100vw - 40px)',
    right: '20px',
    left: '20px',
  },
}));

const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: '12px',
  right: '12px',
  color: '#888',
  '&:hover': {
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

// ----------------------------------------------------------------------

const FeedbackPopup = memo(({ title, children, onClose, showCloseButton = true }) => {
  return (
    <StyledModal>
      {showCloseButton && (
        <CloseButton size="small" onClick={onClose}>
          <Iconify icon="eva:close-fill" width={20} height={20} />
        </CloseButton>
      )}

      <Box sx={{ pr: showCloseButton ? 4 : 0 }}>
        {title && (
          <Typography
            variant="h6"
            component="h2"
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: '18px',
              mb: 2,
            }}
          >
            {title}
          </Typography>
        )}

        {children}
      </Box>
    </StyledModal>
  );
});

FeedbackPopup.displayName = 'FeedbackPopup';

export default FeedbackPopup;

