import { AddCircleOutline, DeleteOutline } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import { optimai } from '../../../../utils/axios';

function AddEnvVarsDialog({ open, onClose, ui }) {
  const [envVars, setEnvVars] = useState([{ key: '', value: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingVars, setExistingVars] = useState({});

  useEffect(() => {
    if (open && ui.meta_data?.variables) {
      setExistingVars(ui.meta_data.variables);
    }
  }, [open, ui.meta_data]);

  const handleAddEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const handleRemoveEnvVar = (index) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      // Filter out empty entries and format for API
      const variables = envVars
        .filter((v) => v.key && v.value)
        .map((v) => ({
          key: v.key,
          value: v.value,
          type: 'plain', // Default to plain type
          target: ['production', 'preview', 'development'], // Default to all targets
        }));

      if (variables.length === 0) {
        setError('Please add at least one environment variable');
        return;
      }

      await optimai.post(`/interfaces/${ui.id}/env`, {
        variables,
      });

      setEnvVars([{ key: '', value: '' }]); // Reset form
      onClose();
    } catch (err) {
      setError('Failed to save environment variables. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVar = async (key) => {
    try {
      setLoading(true);
      setError('');

      await optimai.delete(`/interfaces/${ui.id}/env/${key}`);

      // Remove from local state
      const newExistingVars = { ...existingVars };
      delete newExistingVars[key];
      setExistingVars(newExistingVars);
    } catch (err) {
      setError(`Failed to delete ${key}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Environment Variables</DialogTitle>
      <DialogContent>
        {Object.entries(existingVars).length > 0 && (
          <Stack
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Typography
              variant="subtitle1"
              color="primary"
            >
              Existing Variables
            </Typography>
            {Object.entries(existingVars).map(([key, details]) => (
              <Stack
                key={key}
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                  p: 1,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography sx={{ flexGrow: 1 }}>{key}</Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {details.type}
                </Typography>
                <IconButton
                  onClick={() => handleDeleteVar(key)}
                  size="small"
                  color="error"
                  disabled={loading}
                >
                  <DeleteOutline />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}

        <Typography
          variant="subtitle1"
          color="primary"
          sx={{ mb: 2 }}
        >
          Add New Variables
        </Typography>

        {envVars.map((envVar, index) => (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            key={index}
            sx={{ my: 1 }}
          >
            <TextField
              label="Key"
              placeholder="e.g. CLIENT_KEY"
              value={envVar.key}
              onChange={(e) => handleChange(index, 'key', e.target.value)}
              variant="outlined"
              size="small"
            />
            <TextField
              label="Value"
              value={envVar.value}
              onChange={(e) => handleChange(index, 'value', e.target.value)}
              variant="outlined"
              size="small"
            />
            <IconButton
              onClick={() => handleRemoveEnvVar(index)}
              size="small"
            >
              <DeleteOutline />
            </IconButton>
          </Stack>
        ))}
        <Button
          startIcon={<AddCircleOutline />}
          onClick={handleAddEnvVar}
          variant="outlined"
          size="small"
        >
          Add Another
        </Button>

        {error && (
          <Typography
            color="error"
            sx={{ mt: 2, mb: 1 }}
          >
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          variant="contained"
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddEnvVarsDialog;
