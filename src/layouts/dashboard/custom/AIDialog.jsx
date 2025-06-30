import { Dialog, TextField } from '@mui/material';
import React from 'react';

export default function AIDialog({ open, onClose }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      console.log('Searching for:', event.target.value);
      onClose();
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="search-dialog-title"
    >
      <TextField
        autoFocus
        fullWidth
        placeholder="What do you want to do?"
        onKeyDown={handleKeyDown}
        sx={{ width: 400, border: 'none' }}
      />
    </Dialog>
  );
}
