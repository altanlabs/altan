import Editor from '@monaco-editor/react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ArrowLeft,
  Save,
  X,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import {
  selectFunctionDetails,
  fetchFunctionDetails,
  updateFunctionThunk,
} from '../../../../../redux/slices/functions';
import { dispatch } from '../../../../../redux/store';

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

function FunctionDetailView({ baseId, functionData, onBack, onShowSnackbar }) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('code');
  const [editedCode, setEditedCode] = useState('');
  const [editedRequirements, setEditedRequirements] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const functionDetailsState = useSelector((state) =>
    selectFunctionDetails(state, functionData.name),
  );

  // Use the full function data if available, otherwise fall back to the passed functionData
  const fullFunctionData = functionDetailsState.data || functionData;

  // Initialize from functionData immediately on mount
  useEffect(() => {
    if (functionData) {
      setEditedCode(functionData.code || '');
      const requirements = functionData.requirements || functionData.metadata?.requirements || [];
      setEditedRequirements(requirements.join(', '));
      setEditedName(functionData.name || functionData.metadata?.name || '');
      setEditedDescription(functionData.description || functionData.metadata?.description || '');
    }
  }, [functionData.name || functionData.metadata?.name]); // Only re-run if viewing a different function

  // Fetch full function details (including code) when component mounts
  useEffect(() => {
    const serviceName = functionData.name || functionData.metadata?.name;
    if (serviceName) {
      dispatch(fetchFunctionDetails(baseId, serviceName));
    }
  }, [baseId, functionData.name, functionData.metadata?.name]);

  // Update edit state when full function data is fetched
  useEffect(() => {
    if (functionDetailsState.data) {
      setEditedCode(functionDetailsState.data.code || '');
      const requirements = functionDetailsState.data.requirements || functionDetailsState.data.metadata?.requirements || [];
      setEditedRequirements(requirements.join(', '));
      setEditedName(functionDetailsState.data.name || functionDetailsState.data.metadata?.name || '');
      setEditedDescription(functionDetailsState.data.description || functionDetailsState.data.metadata?.description || '');
    }
  }, [functionDetailsState.data]);

  // Check if there are unsaved changes in code
  const hasUnsavedCodeChanges = editedCode !== (fullFunctionData.code || '');

  // Check if there are unsaved changes in settings
  const originalName = fullFunctionData.name || fullFunctionData.metadata?.name || '';
  const originalDescription = fullFunctionData.description || fullFunctionData.metadata?.description || '';
  const originalRequirements = fullFunctionData.requirements || fullFunctionData.metadata?.requirements || [];
  
  const hasUnsavedSettingsChanges = 
    editedName !== originalName ||
    editedDescription !== originalDescription ||
    editedRequirements !== originalRequirements.join(', ');

  const handleDiscardCode = () => {
    setEditedCode(fullFunctionData.code || '');
  };

  const handleSaveCode = async () => {
    setIsSaving(true);
    try {
      await dispatch(
        updateFunctionThunk(baseId, functionData.name, {
          code: editedCode,
        }),
      );

      // Refresh function details
      await dispatch(fetchFunctionDetails(baseId, functionData.name));

      onShowSnackbar('Service code updated successfully', 'success');
    } catch (error) {
      onShowSnackbar(error.message || 'Failed to update service', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardSettings = () => {
    setEditedName(fullFunctionData.name || fullFunctionData.metadata?.name || '');
    setEditedDescription(fullFunctionData.description || fullFunctionData.metadata?.description || '');
    const requirements = fullFunctionData.requirements || fullFunctionData.metadata?.requirements || [];
    setEditedRequirements(requirements.join(', '));
  };

  const handleSaveSettings = async () => {
    if (!editedName.trim()) {
      onShowSnackbar('Service name cannot be empty', 'error');
      return;
    }

    setIsSavingSettings(true);
    try {
      // Parse requirements
      const requirements = editedRequirements
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      await dispatch(
        updateFunctionThunk(baseId, functionData.name, {
          name: editedName,
          description: editedDescription,
          requirements,
        }),
      );

      // Refresh function details
      await dispatch(fetchFunctionDetails(baseId, functionData.name));

      onShowSnackbar('Service settings updated successfully', 'success');
    } catch (error) {
      onShowSnackbar(error.message || 'Failed to update service settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Show loading state while fetching function details
  if (functionDetailsState.loading && !functionDetailsState.data) {
    return (
      <Box sx={{ p: 3, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state if failed to load
  if (functionDetailsState.error && !functionDetailsState.data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {functionDetailsState.error}
        </Alert>
        <Button onClick={onBack} variant="outlined">
          Back to Services
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 3, pt: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Stack spacing={1.5}>
          {/* Top bar with back button */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              startIcon={<ArrowLeft size={20} />}
              onClick={onBack}
              variant="text"
            >
              Back to Services
            </Button>
          </Stack>
          {/* Function name and description */}
          <Box>
            <Typography variant="h5">
              {fullFunctionData.name}
            </Typography>
            {fullFunctionData.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {fullFunctionData.description}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Code" value="code" />
          <Tab label="Settings" value="settings" />
        </Tabs>
      </Box>

      {/* Code Tab */}
      {activeTab === 'code' && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Unsaved Changes Banner */}
          {hasUnsavedCodeChanges && (
            <Box 
              sx={{ 
                px: 3, 
                py: 1.5, 
                borderBottom: 1, 
                borderColor: 'divider',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  Unsaved changes
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<X size={16} />}
                  onClick={handleDiscardCode}
                  disabled={isSaving}
                  size="small"
                  color="inherit"
                >
                  Discard
                </Button>
                <Button
                  variant="contained"
                  startIcon={isSaving ? <CircularProgress size={16} /> : <Save size={16} />}
                  onClick={handleSaveCode}
                  disabled={isSaving}
                  size="small"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </Stack>
            </Box>
          )}

          {/* Code Editor - Full Height */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              value={editedCode}
              onChange={(value) => setEditedCode(value || '')}
              theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                padding: { top: 16 },
              }}
            />
          </Box>
        </Box>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* Unsaved Changes Banner */}
          {hasUnsavedSettingsChanges && (
            <Box 
              sx={{ 
                px: 3, 
                py: 1.5, 
                borderBottom: 1, 
                borderColor: 'divider',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  Unsaved changes
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<X size={16} />}
                  onClick={handleDiscardSettings}
                  disabled={isSavingSettings}
                  size="small"
                  color="inherit"
                >
                  Discard
                </Button>
                <Button
                  variant="contained"
                  startIcon={isSavingSettings ? <CircularProgress size={16} /> : <Save size={16} />}
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  size="small"
                >
                  {isSavingSettings ? 'Saving...' : 'Save'}
                </Button>
              </Stack>
            </Box>
          )}

          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Service Information */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Service Information
                  </Typography>
                  <Stack spacing={2.5} sx={{ mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Name *
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="service_name"
                        helperText="Use lowercase letters, numbers, and underscores"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Description
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={3}
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        placeholder="Enter service description"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Mounted At
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {fullFunctionData.mounted_at || `/api/${fullFunctionData.name}`}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Created
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(fullFunctionData.created_at)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Requirements
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter requirements separated by commas (e.g., fastapi, pydantic, requests)"
                      value={editedRequirements}
                      onChange={(e) => setEditedRequirements(e.target.value)}
                      helperText="Separate multiple requirements with commas"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default FunctionDetailView;
