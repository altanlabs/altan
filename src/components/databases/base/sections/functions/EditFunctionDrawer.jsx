import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { X, Plus } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

import { updateFunctionThunk } from '../../../../../redux/slices/functions';
import { dispatch } from '../../../../../redux/store';

function EditFunctionDrawer({ open, onClose, baseId, functionData, onSuccess, onError }) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    requirements: [],
  });
  const [newRequirement, setNewRequirement] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (functionData && open) {
      setFormData({
        name: functionData.name || '',
        code: functionData.code || '',
        description: functionData.description || '',
        requirements: functionData.requirements || [],
      });
    }
  }, [functionData, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (req) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((r) => r !== req),
    }));
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      onError('Service name is required');
      return;
    }

    if (!formData.code.trim()) {
      onError('Service code is required');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(updateFunctionThunk(baseId, functionData.name, {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        requirements: formData.requirements,
      }));

      onSuccess('Service updated successfully');
      handleClose();
    } catch (error) {
      let errorMessage = 'Failed to update service';

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      onError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: '80%', md: '60%', lg: '50%' } },
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
          <Typography variant="h6">Edit Service</Typography>
          <IconButton onClick={handleClose} disabled={submitting}>
            <X size={20} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Stack spacing={3}>
            {/* Name */}
            <TextField
              label="Service Name"
              placeholder="my_service"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              fullWidth
              required
              disabled={submitting}
              helperText="Use lowercase letters, numbers, and underscores"
              size="small"
            />

            {/* Description */}
            <TextField
              label="Description"
              placeholder="What does this service do?"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              fullWidth
              multiline
              rows={2}
              disabled={submitting}
              size="small"
            />

            {/* Requirements */}
            <Box>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                Python Requirements
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mb: 1 }}>
                Python packages that will be installed for your service
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                {formData.requirements.map((req) => (
                  <Chip
                    key={req}
                    label={req}
                    onDelete={() => handleRemoveRequirement(req)}
                    disabled={submitting}
                    size="small"
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="package-name"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRequirement();
                    }
                  }}
                  disabled={submitting}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Plus size={14} />}
                  onClick={handleAddRequirement}
                  disabled={submitting || !newRequirement.trim()}
                >
                  Add
                </Button>
              </Stack>
            </Box>

            {/* Code Editor */}
            <Box>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                Python Code *
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mb: 1 }}>
                Your FastAPI router will be automatically mounted at /api/{'{'}service_name{'}'}
              </Typography>
              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  height: 400,
                }}
              >
                <Editor
                  height="400px"
                  defaultLanguage="python"
                  value={formData.code}
                  onChange={(value) => handleChange('code', value || '')}
                  theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    readOnly: submitting,
                  }}
                />
              </Box>
            </Box>
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
            disabled={submitting || !formData.name.trim() || !formData.code.trim()}
            startIcon={submitting && <CircularProgress size={16} />}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

export default EditFunctionDrawer;
