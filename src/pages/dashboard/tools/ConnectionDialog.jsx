import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Chip,
  Typography,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import Iconify from '@components/iconify/Iconify';

import IconRenderer from '../../../components/icons/IconRenderer';
import Logo from '../../../components/logo/Logo';
import { renameConnection } from '../../../redux/slices/connections';

function ConnectionDialog({ connection }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(connection.name);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleRename = async () => {
    try {
      await dispatch(renameConnection(connection.id, newName));
      enqueueSnackbar('Connection renamed successfully', { variant: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error renaming connection', error);
      // enqueueSnackbar('Error renaming connection', { variant: 'error' });
    }
  };
  return (
    <>
      <Chip
        onClick={handleOpen}
        icon={<IconRenderer icon={connection.connection_type.icon} />}
        label="Manage"
      />
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
            <IconRenderer
              icon={connection.connection_type.icon}
              size={32}
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
