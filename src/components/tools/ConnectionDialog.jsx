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
  InputAdornment,
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
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const { enqueueSnackbar } = useSnackbar();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleRename = async () =>
    dispatch(renameConnection(connection.id, connection.account_id, newName))
      .then(() => enqueueSnackbar('Connection renamed successfully', { variant: 'success' }))
      .catch((e) => {
        console.error('Error renaming connection', e);
        enqueueSnackbar('Error renaming connection', { variant: 'error' });
      })
      .finally(() => handleClose());

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(connection.id);
      setCopyButtonText('Copied!');
      enqueueSnackbar('Connection ID copied to clipboard', { variant: 'success' });
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    } catch (error) {
      console.error('Failed to copy connection ID:', error);
      enqueueSnackbar('Failed to copy connection ID', { variant: 'error' });
    }
  };

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
          
          <TextField
            variant="filled"
            fullWidth
            label="Connection ID"
            value={connection.id}
            margin="normal"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleCopyId}
                    edge="end"
                    size="small"
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'primary.lighter' }
                    }}
                  >
                    <Iconify 
                      icon={copyButtonText === 'Copied!' ? 'eva:checkmark-circle-2-fill' : 'solar:copy-bold'} 
                      width={20}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
          />
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
