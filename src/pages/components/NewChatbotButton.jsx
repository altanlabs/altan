import { Button, useTheme } from '@mui/material';
import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Iconify from '../../components/iconify/Iconify';
import { PATH_DASHBOARD } from '../../routes/paths';

const NewChatbotButton = ({ withLabel = false }) => {
  const theme = useTheme();

  return (
    <Button
      fullWidth
      component={RouterLink}
      to={PATH_DASHBOARD.studio.apps.create}
      variant="contained"
      color="secondary"
      size="large"
      startIcon={
        <Iconify
          icon="uil:channel"
          width={28}
        />
      }
    >
      New Integration
    </Button>
  );
};

export default memo(NewChatbotButton);
