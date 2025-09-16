import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Chip,
  Typography,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Box,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { renameConnection } from '../../redux/slices/connections';
import { dispatch } from '../../redux/store';
import Iconify from '../iconify/Iconify';
import Logo from '../logo';

function ConnectionDialog({ connection }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(connection.name);
  const { enqueueSnackbar } = useSnackbar();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const handleCopyId = () => {
    navigator.clipboard.writeText(connection.id).then(() => {
      enqueueSnackbar('Connection ID copied to clipboard', { variant: 'success' });
    }).catch(() => {
      enqueueSnackbar('Failed to copy connection ID', { variant: 'error' });
    });
  };

  const handleRename = async () =>
    dispatch(renameConnection(connection.id, connection.account_id, newName))
      .then(() => enqueueSnackbar('Connection renamed successfully', { variant: 'success' }))
      .catch((e) => {
        console.error('Error renaming connection', e);
        enqueueSnackbar('Error renaming connection', { variant: 'error' });
      })
      .finally(() => handleClose());

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Iconify icon="solar:settings-bold-duotone" />
      </IconButton>

      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>{`Manage ${connection?.connection_type?.name} Connection `}</DialogTitle>
        <DialogContent>
          <Stack
            direction="row"
            justifyContent="center"
          >
            <Iconify
              icon={
                connection?.connection_type?.icon || connection?.connection_type?.external_app?.icon
              }
              width={32}
            />
            <Iconify
              icon="ph:x-bold"
              width={32}
            />
            <Logo />
          </Stack>
          <TextField
            variant="filled"
            fullWidth
            label="Connection Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            margin="normal"
          />
          
          {/* Connection ID with Copy Button */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                Connection ID: {connection.id}
              </Typography>
              <IconButton 
                size="small" 
                onClick={handleCopyId}
                sx={{ 
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Iconify icon="solar:copy-bold" width={16} />
              </IconButton>
            </Stack>
          </Box>

          {connection.details && (
            <Stack
              direction="column"
              spacing={2}
            >
              {Object.entries(connection.details).map(([key, value]) => (
                <Stack
                  direction="row"
                  spacing={2}
                  key={key}
                >
                  <Chip
                    label={key}
                    variant="soft"
                    color="primary"
                  />
                  <Typography noWrap>{value}</Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleRename}
            color="primary"
            variant="soft"
          >
            Save & Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ConnectionDialog;
