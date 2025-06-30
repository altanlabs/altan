import LoadingButton from '@mui/lab/LoadingButton'; // Assuming you're using MUI for LoadingButton
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import React, { memo, useState } from 'react';

import Iconify from '../../../../components/iconify/Iconify';

const DeleteDialog = ({
  openDeleteDialog,
  handleCloseDeleteDialog,
  confirmDelete,
  isSubmitting = false,
  message = "Are you sure you want to delete this item? This action can't be undone",
  confirmationText = null, // New optional prop
}) => {
  const [userInput, setUserInput] = useState('');

  // Function to handle the change in the input field
  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  // Determine if the confirm button should be enabled
  const isConfirmEnabled = confirmationText?.trim() ? userInput === confirmationText?.trim() : true;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && isConfirmEnabled) {
      confirmDelete();
    }
  };

  return (
    <Dialog
      open={openDeleteDialog}
      onClose={handleCloseDeleteDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {'Confirm Delete (action can not be undone)'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{message}</DialogContentText>
        {confirmationText && (
          <TextField
            margin="dense"
            id="confirmation-input"
            label={`Type "${confirmationText?.trim()}" to confirm`}
            type="text"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            value={userInput}
            onKeyDown={handleKeyDown}
            sx={{
              mt: 3,
            }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCloseDeleteDialog}
          color="primary"
        >
          Cancel
        </Button>
        <LoadingButton
          loading={isSubmitting}
          onClick={confirmDelete}
          color="error"
          variant="soft"
          autoFocus
          disabled={!isConfirmEnabled} // Use the isConfirmEnabled to control the disabled state
          startIcon={<Iconify icon="ant-design:enter-outlined" />}
        >
          Confirm
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default memo(DeleteDialog);
