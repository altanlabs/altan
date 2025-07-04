import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import Iconify from '../../../../components/iconify';
import { createAccount } from '../../../../redux/slices/general';
import CustomDialog from '../../../../components/dialogs/CustomDialog';

function CreateAccount() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleCreate = () => {
    dispatch(createAccount({ name: formData.name })).then(() => {
      window.location.href = '/';
      window.location.reload();
    });
  };

  return (
    <>
      <Button
        fullWidth
        variant="soft"
        color="inherit"
        size="large"
        startIcon={<Iconify icon="mdi:register" />}
        onClick={handleClickOpen}
      >
        Create Workspace
      </Button>
      <CustomDialog
        dialogOpen={open}
        onClose={handleClose}
      >
        <DialogTitle>Create a New Workspace</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            The new workspace will be associated with your user's organisation.{' '}
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Workspace Name"
            type="text"
            fullWidth
            variant="filled"
            value={formData.name}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="soft"
            onClick={handleCreate}
          >
            Create
          </Button>
        </DialogActions>
      </CustomDialog>
    </>
  );
}

export default CreateAccount;
