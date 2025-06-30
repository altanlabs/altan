import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from '@mui/material';
import React, { useState } from 'react';

import { useSnackbar } from '../../../../components/snackbar';
import { adminCreateSub } from '../../../../redux/slices/subscription';
import { dispatch } from '../../../../redux/store';

function AddSubscription({ accountId }) {
  const [open, setOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelectChange = (event) => {
    setSelectedSubscription(event.target.value);
  };

  const handleCreate = () => {
    console.log('Selected Subscription:', selectedSubscription);
    dispatch(adminCreateSub(accountId, selectedSubscription))
      .then((subscription) => {
        enqueueSnackbar(`Successfully created subscription ${subscription.id}`, {
          variant: 'success',
        });
        handleClose();
      })
      .catch((error) => {
        enqueueSnackbar(`Failed to create subscription: ${error.message}`, { variant: 'error' });
        // Handle any additional error logic here
      });
  };

  return (
    <>
      <Button onClick={handleClickOpen}>Add Subscription</Button>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <DialogTitle>Create Subscription</DialogTitle>
        <DialogContent>
          <Select
            value={selectedSubscription}
            onChange={handleSelectChange}
            fullWidth
          >
            <MenuItem value="bronze">Bronze</MenuItem>
            <MenuItem value="silver">Silver</MenuItem>
            <MenuItem value="gold">Gold</MenuItem>
          </Select>
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
      </Dialog>
    </>
  );
}

export default AddSubscription;
