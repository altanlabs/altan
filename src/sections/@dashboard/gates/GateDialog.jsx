import { Button, Dialog } from '@mui/material';
import { useState } from 'react';

import CreateEditGate from './CreateEditGate';
import Iconify from '../../../components/iconify/Iconify';

export default function GateDialog() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <>
      <Button
        color="secondary"
        onClick={handleOpen}
        size="small"
        startIcon={
          <Iconify
            icon="lets-icons:add-duotone"
            width={30}
          />
        }
        variant="soft"
      >
        Create gate
      </Button>

      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
      >
        <CreateEditGate handleClose={handleClose} />
      </Dialog>
    </>
  );
}
