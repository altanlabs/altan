import LoadingButton from '@mui/lab/LoadingButton'; // Assuming you're using MUI for LoadingButton
import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import React, { memo, useState } from 'react';

import CustomDialog from './CustomDialog';
import Iconify from '../iconify/Iconify';

const DeleteDialog = ({
  openDeleteDialog,
  handleCloseDeleteDialog,
  confirmDelete,
  isSubmitting = false,
  message = "Are you sure you want to delete this item? This action can't be undone",
  confirmationText = null,
}) => {
  const [userInput, setUserInput] = useState('');

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };
  const isConfirmEnabled = confirmationText?.trim() ? userInput === confirmationText?.trim() : true;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && isConfirmEnabled) {
      confirmDelete();
    }
  };

  return (
    <CustomDialog
      dialogOpen={openDeleteDialog}
      onClose={handleCloseDeleteDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{'Confirm Delete'}</DialogTitle>
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
          disabled={!isConfirmEnabled}
          startIcon={<Iconify icon="ant-design:enter-outlined" />}
        >
          Confirm
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
};

export default memo(DeleteDialog);
