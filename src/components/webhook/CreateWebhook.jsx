import { Button } from '@mui/material';
import { useState, useCallback, memo } from 'react';

import CreateWebhookParameters from './CreateWebhookParameters';
import CustomDialog from '../dialogs/CustomDialog.jsx';
import Iconify from '../iconify/Iconify';
// import { CardTitle } from '../aceternity/cards/card-hover-effect';

const CreateWebhook = () => {
  const [open, setOpen] = useState(false);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleOpen = useCallback(() => setOpen(true), []);

  return (
    <>
      <Button
        fullWidth
        variant="soft"
        onClick={handleOpen}
        startIcon={<Iconify icon="material-symbols:webhook" />}
      >
        Create Webhook
      </Button>
      <CustomDialog
        dialogOpen={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: '500px'
          }
        }}
      >
        <CreateWebhookParameters />
      </CustomDialog>
    </>
  );
};

export default memo(CreateWebhook);
