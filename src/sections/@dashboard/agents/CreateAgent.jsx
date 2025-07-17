import { LoadingButton } from '@mui/lab';
import { Button, Dialog, Stack, DialogActions, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { useState, useCallback, memo } from 'react';

import useAgentAttributes from './useAgentAttributes';
import CustomDialog from '../../../components/dialogs/CustomDialog';
import Iconify from '../../../components/iconify/Iconify';

function CreateAgent({ altanerComponentId = null }) {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const { triggerSubmit, isSubmitting, AgentAttributes } = useAgentAttributes({
    mode: 'create',
    onClose: handleClose,
    altanerComponentId: altanerComponentId,
  });

  return (
    <>
      <Button
        color="inherit"
        variant="soft"
        onClick={handleOpen}
      >
        New AI Agent
      </Button>
      <CustomDialog
        dialogOpen={open}
        onClose={handleClose}
        showCloseButton={false}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'center', p: 4 }}
          spacing={2}
          justifyContent="space-between"
        >
          <Typography variant="h5">New AI Agent</Typography>
        </Stack>
        {AgentAttributes}
        <DialogActions>
          <Tooltip
            title={
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
              >
                <Iconify icon="solar:command-linear" />
                <Iconify icon="mdi:backspace-outline" />
              </Stack>
            }
          >
            <Button
              color="error"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </Tooltip>
          <Tooltip
            title={
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
              >
                <Iconify icon="solar:command-linear" />
                <Iconify icon="mi:enter" />
              </Stack>
            }
          >
            <LoadingButton
              loading={isSubmitting}
              color="primary"
              variant="soft"
              onClick={triggerSubmit}
            >
              Create Agent
            </LoadingButton>
          </Tooltip>
        </DialogActions>
      </CustomDialog>
    </>
  );
}

export default memo(CreateAgent);
