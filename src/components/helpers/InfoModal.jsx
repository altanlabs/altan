import { IconButton, Typography, Modal, Box, useTheme, Stack } from '@mui/material';
import React, { useState } from 'react';
import ReactPlayer from 'react-player/youtube';

import { bgBlur } from '../../utils/cssStyles';
import Iconify from '../iconify';

const InfoModal = ({ title, description, videoUrl }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();
  const handleOpen = () => {
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Modal
        open={modalOpen}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...bgBlur({ color: '#000', opacity: 0.7 }),
        }}
      >
        <Box
          sx={{
            width: '50%',
            background: theme.palette.background.neutral,
            padding: '1rem',
            borderRadius: '0.5rem',
          }}
        >
          <Typography variant="h5">{title}</Typography>
          <Typography
            variant="body1"
            sx={{ mb: 1 }}
          >
            {description}
          </Typography>
          {videoUrl && (
            <ReactPlayer
              url={videoUrl}
              width="100%"
              controls={true}
              playing={false}
            />
          )}
        </Box>
      </Modal>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
      >
        <IconButton
          onClick={handleOpen}
          color="primary"
          size="small"
          sx={{ zIndex: 0 }}
        >
          <Iconify icon="clarity:info-solid" />
        </IconButton>
        {title && <Typography variant="subtitle2">{title}</Typography>}
      </Stack>
    </>
  );
};

export default InfoModal;
