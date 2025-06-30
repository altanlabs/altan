import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import React from 'react';

import Iconify from './iconify';

const CreatorDialog = ({ open, onClose }) => {
  const handleCreateClick = () => {
    window.open('https://app.altan.ai/form/8f528c5f-219c-4388-8851-906317b41904', '_blank');
  };

  const handleUpgradeClick = () => {
    window.open('https://app.altan.ai/form/c9eed552-c6fb-46bb-881f-73bab316dd56', '_blank');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Find a Creator</DialogTitle>
      <DialogContent>
        <Typography
          variant="body1"
          gutterBottom
        >
          Let's get you matched with the perfect creator for your project. Here's how it works:
        </Typography>
        <Box sx={{ my: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body2">
              1. Choose to create a new Altaner or upgrade an existing one
            </Typography>
            <Typography variant="body2">2. We'll match you with an expert creator</Typography>
            <Typography variant="body2">
              3. You'll receive a notification to start your project
            </Typography>
            <Typography variant="body2">
              4. Your Altaner will be created or upgraded quickly and efficiently
            </Typography>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCreateClick}
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          color="primary"
        >
          Create New Altaner
        </Button>
        <Button
          onClick={handleUpgradeClick}
          startIcon={<Iconify icon="mdi:arrow-up-bold" />}
          variant="outlined"
          color="secondary"
        >
          Upgrade Existing Altaner
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatorDialog;
