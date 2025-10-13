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
    code: '',
    description: '',
    requirements: [],
    output_variables: [],
  });
  const [newRequirement, setNewRequirement] = useState('');
  const [newOutputVariable, setNewOutputVariable] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (functionData && open) {
      setFormData({
        code: functionData.code || '',
        description: functionData.description || '',
        requirements: functionData.requirements || ['altan'],
        output_variables: functionData.output_variables || [],
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

  const handleAddOutputVariable = () => {
    if (newOutputVariable.trim() && !formData.output_variables.includes(newOutputVariable.trim())) {
      setFormData((prev) => ({
        ...prev,
        output_variables: [...prev.output_variables, newOutputVariable.trim()],
      }));
      setNewOutputVariable('');
    }
  };

  const handleRemoveOutputVariable = (variable) => {
    setFormData((prev) => ({
      ...prev,
      output_variables: prev.output_variables.filter((v) => v !== variable),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.code.trim()) {
      onError('Function code is required');
      return;
    }

    if (formData.output_variables.length === 0) {
      onError('At least one output variable is required');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(updateFunctionThunk(baseId, functionData.name, formData));
      onSuccess('Function updated successfully. A new version has been created.');
      handleClose();
    } catch (error) {
      onError(error.message || 'Failed to update function');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
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
          <Box>
            <Typography variant="h6">Edit Function</Typography>
            <Typography variant="caption" color="text.secondary">
              {functionData?.name}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={submitting}>
            <X size={20} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <Stack spacing={3}>
            {/* Description */}
            <TextField
              label="Description"
              placeholder="What does this function do?"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              fullWidth
              multiline
              rows={2}
              disabled={submitting}
            />

            {/* Requirements */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Requirements
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
                  startIcon={<Plus size={16} />}
                  onClick={handleAddRequirement}
                  disabled={submitting || !newRequirement.trim()}
                >
                  Add
                </Button>
              </Stack>
            </Box>

            {/* Output Variables */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Output Variables *
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Variables that will be returned from the function
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1, mt: 1, flexWrap: 'wrap', gap: 1 }}>
                {formData.output_variables.map((variable) => (
                  <Chip
                    key={variable}
                    label={variable}
                    onDelete={() => handleRemoveOutputVariable(variable)}
                    disabled={submitting}
                    size="small"
                    color="primary"
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="variable_name"
                  value={newOutputVariable}
                  onChange={(e) => setNewOutputVariable(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOutputVariable();
                    }
                  }}
                  disabled={submitting}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Plus size={16} />}
                  onClick={handleAddOutputVariable}
                  disabled={submitting || !newOutputVariable.trim()}
                >
                  Add
                </Button>
              </Stack>
            </Box>

            {/* Code Editor */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Python Code *
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mb: 1 }}>
                Updating the code will create a new version
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
            disabled={submitting || !formData.code.trim() || formData.output_variables.length === 0}
            startIcon={submitting && <CircularProgress size={16} />}
          >
            {submitting ? 'Updating...' : 'Update Function'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

export default EditFunctionDrawer;

