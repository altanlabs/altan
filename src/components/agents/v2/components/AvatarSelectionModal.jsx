import { Card, Modal, Stack, Typography } from '@mui/material';
import { memo } from 'react';

import AvatarSelection from './AvatarSelection';

const AvatarSelectionModal = ({ setAvatar, open, onClose }) => {
  const handleSelectAvatar = (avatarSrc) => {
    setAvatar(avatarSrc);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        sx={{
          width: '95%',
          maxWidth: 500,
          padding: 5,
        }}
      >
        <Stack
          width="100%"
          spacing={2}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography>Choose your avatar</Typography>
          <AvatarSelection setAvatarSrc={handleSelectAvatar} />
        </Stack>
      </Card>
    </Modal>
  );
};

export default memo(AvatarSelectionModal);
