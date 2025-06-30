import { LoadingButton } from '@mui/lab';
import { Button, Dialog, Stack, DialogActions, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import { useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';

import useAgentAttributes from './useAgentAttributes';
import Iconify from '../../../components/iconify/Iconify';

function CreateAgentDialog({ open, onClose, altanerComponentId = null }) {
  const navigate = useNavigate();

  // Use the passed props for open/close state instead of internal state
  const handleClose = useCallback((agentId) => {
    if (onClose) onClose(agentId);
  }, [onClose]);

  const { triggerSubmit, isSubmitting, AgentAttributes } = useAgentAttributes({
    mode: 'create',
    onClose: handleClose, // Pass the entire callback to maintain the agentId
    altanerComponentId,
  });

  const handleMarketplaceClick = () => {
    navigate('/marketplace?mode=agent');
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={Boolean(open)}
      onClose={() => handleClose()}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', p: 4 }}
        spacing={2}
        justifyContent="space-between"
      >
        <Typography variant="h5">New AI Agent</Typography>
        <Button
          startIcon={<Iconify icon="mdi:marketplace" />}
          variant="soft"
          color="info"
          size="large"
          onClick={handleMarketplaceClick}
        >
          Explore Marketplace
        </Button>
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
              <Iconify icon="mdi:enter-linear" />
            </Stack>
          }
        >
          <LoadingButton
            variant="contained"
            loading={isSubmitting}
            onClick={triggerSubmit}
          >
            Create Agent
          </LoadingButton>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}

CreateAgentDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  altanerComponentId: PropTypes.string,
};

export default memo(CreateAgentDialog);
