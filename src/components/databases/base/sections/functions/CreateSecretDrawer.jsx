import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { X } from 'lucide-react';
import React, { useState } from 'react';

import { createOrUpdateSecret } from '../../../../../redux/slices/services';
import { dispatch } from '../../../../../redux/store';

function CreateSecretDrawer({ open, onClose, baseId, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    // Auto-format key to uppercase with underscores
    if (field === 'key') {
      value = value.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.key.trim()) {
      onError('Secret key is required');
      return;
    }

    if (!formData.value.trim()) {
      onError('Secret value is required');
      return;
    }

    // Validate key format
    if (!/^[A-Z][A-Z0-9_]*$/.test(formData.key)) {
      onError('Key must start with a letter and contain only uppercase letters, numbers, and underscores');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(createOrUpdateSecret(baseId, formData));
      onSuccess('Secret saved successfully');
      handleClose();
    } catch (error) {
      onError(error.message || 'Failed to save secret');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        key: '',
        value: '',
        description: '',
      });
      onClose();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500 } },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">Create Secret</Typography>
          <IconButton onClick={handleClose} disabled={submitting}>
            <X size={20} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <Stack spacing={3}>

            {/* Key */}
            <TextField
              label="Key"
              placeholder="API_KEY"
              value={formData.key}
              onChange={(e) => handleChange('key', e.target.value)}
              fullWidth
              required
              disabled={submitting}
              helperText="Use UPPERCASE letters, numbers, and underscores. Must start with a letter."
              inputProps={{
                style: { fontFamily: 'monospace' },
              }}
            />

            {/* Value */}
            <TextField
              label="Value"
              placeholder="Your secret value"
              value={formData.value}
              onChange={(e) => handleChange('value', e.target.value)}
              fullWidth
              required
              type="password"
              disabled={submitting}
              helperText="This value will be encrypted and cannot be retrieved later"
            />

            {/* Description */}
            <TextField
              label="Description"
              placeholder="What is this secret used for?"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              disabled={submitting}
            />
          </Stack>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !formData.key.trim() || !formData.value.trim()}
            startIcon={submitting && <CircularProgress size={16} />}
          >
            {submitting ? 'Saving...' : 'Save Secret'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

export default CreateSecretDrawer;

