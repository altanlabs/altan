import CloseIcon from '@mui/icons-material/Close';
import { Modal, Stack, IconButton, Button, Card, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';

import { bgBlur } from '@utils/styleUtils';

const Subtitle = styled('h3')(() => ({
  fontFamily: 'Helvetica Bold, sans-serif',
  fontSize: '1rem',
  textAlign: 'left',
  zIndex: 1110,
  marginBottom: '0px',
  marginTop: '0px',
}));

const Calendly = ({ widget }) => {
  const data = widget.meta_data;
  const { book_msg, calendly_link } = data;
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  const handleClick = () => {
    setIsCalendlyModalOpen(true);
  };

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="column" gap={1} >
        <Subtitle>{book_msg}</Subtitle>
        <Button variant="soft" onClick={handleClick} sx={{ '&:focus': { outline: 'none', border: 'none' } }}>
          Book now
        </Button>
      </Stack>
      {isCalendlyModalOpen && (
        <Modal
          fullScreen
          open={isCalendlyModalOpen}
          onClose={() => setIsCalendlyModalOpen(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...bgBlur({ color: '#000', opacity: 0.4 }),
          }}
        >
          <div style={{ width: '100vw', height: '100vh', position: 'relative', marginTop: '100px', background: 'white', borderRadius: '2rem' }}>
            <IconButton style={{ position: 'absolute', left: 10, top: 10 }} onClick={() => setIsCalendlyModalOpen(false)}>
              <CloseIcon />
            </IconButton>

            {!isIframeLoaded && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CircularProgress />
              </div>
            )}

            <iframe
              src={calendly_link}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: '2rem' }}
              onLoad={() => setIsIframeLoaded(true)}
            />
          </div>
        </Modal>
      )}
    </Card>
  );
};

export default Calendly;
