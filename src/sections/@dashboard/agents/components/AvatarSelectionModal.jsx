import {
  Stack,
  Typography,
  Modal,
  Card,
} from '@mui/material';
import { memo } from 'react';

import AvatarSelection from '../../../../components/avatar/AvatarSelection';

const AvatarSelectionModal = ({ setAvatar, open, onClose }) => {
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
          <AvatarSelection setAvatarSrc={setAvatar} />
        </Stack>
      </Card>
    </Modal>
  );
};

export default memo(AvatarSelectionModal);
