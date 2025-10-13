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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Switch,
  FormControlLabel,
  TextField,
  Drawer,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  History,
  Clock,
  Edit,
  Save,
  X,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import {
  selectExecutionResult,
  selectVersionsForFunction,
  selectFunctionDetails,
  executeFunction,
  fetchFunctionVersions,
  fetchFunctionDetails,
  changeLatestVersion,
  toggleFunctionEnabled,
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
  const [testInput, setTestInput] = useState('{\n  "message": "Hello, world!"\n}');
  const [queryParams, setQueryParams] = useState('');
  const [headers, setHeaders] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [editedRequirements, setEditedRequirements] = useState('');
  const [editedOutputVariables, setEditedOutputVariables] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);
  const [versionData, setVersionData] = useState(null);
  const [loadingVersion, setLoadingVersion] = useState(false);

  const executionResult = useSelector((state) =>
    selectExecutionResult(state, functionData.name),
  );
  const versionsState = useSelector((state) =>
    selectVersionsForFunction(state, functionData.name),
  );
  const functionDetailsState = useSelector((state) =>
    selectFunctionDetails(state, functionData.name),
  );

  // Fetch function details (including code) when component mounts
  useEffect(() => {
    dispatch(fetchFunctionDetails(baseId, functionData.name));
  }, [baseId, functionData.name]);

  useEffect(() => {
    if (activeTab === 'versions') {
      dispatch(fetchFunctionVersions(baseId, functionData.name));
    }
  }, [activeTab, baseId, functionData.name]);

  // Use the full function data if available, otherwise fall back to the passed functionData
  const fullFunctionData = functionDetailsState.data || functionData;

  // Initialize edit state when function data changes
  useEffect(() => {
    if (fullFunctionData) {
      setEditedCode(fullFunctionData.code || '');
      const requirements = fullFunctionData.metadata?.requirements || fullFunctionData.requirements || [];
      const outputVars = fullFunctionData.metadata?.output_variables || fullFunctionData.output_variables || [];
      setEditedRequirements(requirements.join(', '));
      setEditedOutputVariables(outputVars.join(', '));
      setEditedName(fullFunctionData.metadata?.name || fullFunctionData.name || '');
      setEditedDescription(fullFunctionData.metadata?.description || fullFunctionData.description || '');
    }
  }, [fullFunctionData]);

  const handleExecute = async () => {
    try {
      let body = null;
      if (testInput.trim()) {
        try {
          body = JSON.parse(testInput);
        } catch {
          onShowSnackbar('Invalid JSON in request body', 'error');
          return;
        }
      }

      let query_params = null;
      if (queryParams.trim()) {
        try {
          query_params = JSON.parse(queryParams);
        } catch {
          onShowSnackbar('Invalid JSON in query params', 'error');
          return;
        }
      }

      let headersObj = null;
      if (headers.trim()) {
        try {
          headersObj = JSON.parse(headers);
        } catch {
          onShowSnackbar('Invalid JSON in headers', 'error');
          return;
        }
      }

      await dispatch(
        executeFunction(baseId, functionData.name, {
          body,
          query_params,
          headers: headersObj,
        }),
      );
      onShowSnackbar('Function executed successfully', 'success');
    } catch (error) {
      onShowSnackbar(error.message || 'Function execution failed', 'error');
    }
  };

  const handleChangeVersion = async (functionId) => {
    try {
      await dispatch(changeLatestVersion(baseId, functionData.name, functionId));
      onShowSnackbar(`Version #${functionId} restored successfully`, 'success');
      // Refresh versions
      dispatch(fetchFunctionVersions(baseId, functionData.name));
      // Refresh function details
      await dispatch(fetchFunctionDetails(baseId, functionData.name));
      // Switch to Code tab to see the restored code
      setActiveTab('code');
    } catch (error) {
      onShowSnackbar(error.message || 'Failed to restore version', 'error');
    }
  };

  const handleToggleEnabled = async () => {
    try {
      const currentEnabled = fullFunctionData.metadata?.enabled ?? fullFunctionData.enabled ?? false;
      const newState = !currentEnabled;
      await dispatch(toggleFunctionEnabled(baseId, functionData.name, newState));
      // Refresh function details to update the state
      await dispatch(fetchFunctionDetails(baseId, functionData.name));
      onShowSnackbar(`Function ${newState ? 'enabled' : 'disabled'} successfully`, 'success');
    } catch (error) {
      onShowSnackbar(error.message || 'Failed to toggle function state', 'error');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original values
    setEditedCode(fullFunctionData.code || '');
    setEditedRequirements((fullFunctionData.requirements || []).join(', '));
    setEditedOutputVariables((fullFunctionData.output_variables || []).join(', '));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Parse requirements and output variables
      const requirements = editedRequirements
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r.length > 0);
      const output_variables = editedOutputVariables
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      await dispatch(
        updateFunctionThunk(baseId, functionData.name, {
          code: editedCode,
          requirements,
          output_variables,
        }),
      );

      // Refresh function details
      await dispatch(fetchFunctionDetails(baseId, functionData.name));

      setIsEditing(false);
      onShowSnackbar('Function updated successfully', 'success');
    } catch (error) {
      onShowSnackbar(error.message || 'Failed to update function', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSettings = () => {
    setIsEditingSettings(true);
  };

  const handleCancelEditSettings = () => {
    setIsEditingSettings(false);
    // Reset to original values
    setEditedName(fullFunctionData.metadata?.name || fullFunctionData.name || '');
    setEditedDescription(fullFunctionData.metadata?.description || fullFunctionData.description || '');
  };

  const handleSaveSettings = async () => {
    if (!editedName.trim()) {
      onShowSnackbar('Function name cannot be empty', 'error');
      return;
    }

    setIsSavingSettings(true);
    try {
      await dispatch(
        updateFunctionThunk(baseId, functionData.name, {
          name: editedName,
          description: editedDescription,
        }),
      );

      // Refresh function details
      await dispatch(fetchFunctionDetails(baseId, functionData.name));

      setIsEditingSettings(false);
      onShowSnackbar('Function settings updated successfully', 'success');
    } catch (error) {
      onShowSnackbar(error.message || 'Failed to update function settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleViewVersion = async (versionId) => {
    setSelectedVersion(versionId);
    setVersionDrawerOpen(true);
    setLoadingVersion(true);
    setVersionData(null);

    try {
      // Fetch the specific version using the GET endpoint with version parameter
      const response = await dispatch(fetchFunctionDetails(baseId, functionData.name, versionId));
      setVersionData(response);
    } catch (error) {
      onShowSnackbar(error.message || 'Failed to load version', 'error');
      setVersionDrawerOpen(false);
    } finally {
      setLoadingVersion(false);
    }
  };

  const handleCloseVersionDrawer = () => {
    setVersionDrawerOpen(false);
    setSelectedVersion(null);
    setVersionData(null);
  };

  const isEnabled = (fullFunctionData.metadata?.enabled ?? fullFunctionData.enabled) !== false;

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
          Back to Functions
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack spacing={2}>
          {/* Top bar with back button and toggle */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              startIcon={<ArrowLeft size={20} />}
              onClick={onBack}
              variant="text"
            >
              Back to Functions
            </Button>
            <FormControlLabel
              control={
                <Switch
                  checked={isEnabled}
                  onChange={handleToggleEnabled}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" fontWeight={500}>
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </Typography>
              }
              labelPlacement="start"
            />
          </Stack>
          {/* Function name and description */}
          <Box>
            <Typography variant="h4">
              {fullFunctionData.metadata?.name || fullFunctionData.name}
            </Typography>
            {(fullFunctionData.metadata?.description || fullFunctionData.description) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {fullFunctionData.metadata?.description || fullFunctionData.description}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Code" value="code" />
            <Tab label="Test" value="test" />
            <Tab label="Versions" value="versions" />
            <Tab label="Settings" value="settings" />
          </Tabs>
        </Box>

        {/* Code Tab */}
        {activeTab === 'code' && (
          <Box>
            {/* Edit/Save/Cancel Buttons */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<Edit size={18} />}
                  onClick={handleEdit}
                >
                  Edit Function
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={isSaving ? <CircularProgress size={16} /> : <Save size={18} />}
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<X size={18} />}
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Stack>

            <Card>
              <CardContent>
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden',
                    height: 500,
                  }}
                >
                  <Editor
                    height="500px"
                    defaultLanguage="python"
                    value={isEditing ? editedCode : fullFunctionData.code || ''}
                    onChange={(value) => isEditing && setEditedCode(value || '')}
                    theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      readOnly: !isEditing,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Requirements
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter requirements separated by commas (e.g., altan, requests, pandas)"
                        value={editedRequirements}
                        onChange={(e) => setEditedRequirements(e.target.value)}
                        helperText="Separate multiple requirements with commas"
                      />
                    ) : (
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {((fullFunctionData.metadata?.requirements || fullFunctionData.requirements || []).length === 0) ? (
                          <Typography variant="body2" color="text.secondary">
                            No requirements
                          </Typography>
                        ) : (
                          (fullFunctionData.metadata?.requirements || fullFunctionData.requirements || []).map((req) => (
                            <Chip key={req} label={req} size="small" />
                          ))
                        )}
                      </Stack>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Output Variables
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter output variables separated by commas (e.g., result, status, data)"
                        value={editedOutputVariables}
                        onChange={(e) => setEditedOutputVariables(e.target.value)}
                        helperText="Separate multiple variables with commas"
                      />
                    ) : (
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {((fullFunctionData.metadata?.output_variables || fullFunctionData.output_variables || []).length === 0) ? (
                          <Typography variant="body2" color="text.secondary">
                            No output variables
                          </Typography>
                        ) : (
                          (fullFunctionData.metadata?.output_variables || fullFunctionData.output_variables || []).map((variable) => (
                            <Chip key={variable} label={variable} size="small" color="primary" />
                          ))
                        )}
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Test Tab */}
        {activeTab === 'test' && (
          <Box>
            <Stack spacing={2}>
              {/* Request Body */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Request Body (JSON)
                  </Typography>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      height: 200,
                    }}
                  >
                    <Editor
                      height="200px"
                      defaultLanguage="json"
                      value={testInput}
                      onChange={(value) => setTestInput(value || '')}
                      theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Query Params */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Query Parameters (JSON)
                  </Typography>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      height: 100,
                    }}
                  >
                    <Editor
                      height="100px"
                      defaultLanguage="json"
                      value={queryParams}
                      onChange={(value) => setQueryParams(value || '')}
                      theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Headers */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Headers (JSON)
                  </Typography>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      height: 100,
                    }}
                  >
                    <Editor
                      height="100px"
                      defaultLanguage="json"
                      value={headers}
                      onChange={(value) => setHeaders(value || '')}
                      theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Execute Button */}
              <Button
                variant="contained"
                startIcon={executionResult.loading ? <CircularProgress size={16} /> : <Play size={18} />}
                onClick={handleExecute}
                disabled={executionResult.loading}
                size="large"
              >
                {executionResult.loading ? 'Executing...' : 'Execute Function'}
              </Button>

              {/* Results */}
              {(executionResult.result || executionResult.error) && (
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Execution Result
                    </Typography>
                    {executionResult.error ? (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {executionResult.error}
                      </Alert>
                    ) : executionResult.result?.status === 'error' ? (
                      <Box>
                        <Alert severity="error" sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            {executionResult.result.error?.type || 'Error'}
                          </Typography>
                          <Typography variant="body2">
                            {executionResult.result.error?.message || 'An error occurred'}
                          </Typography>
                        </Alert>
                        {executionResult.result.error?.traceback && (
                          <Box>
                            <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                              Traceback:
                            </Typography>
                            <Box
                              sx={{
                                mt: 0.5,
                                p: 1.5,
                                bgcolor: 'error.lighter',
                                borderRadius: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                whiteSpace: 'pre-wrap',
                                overflow: 'auto',
                                maxHeight: 300,
                              }}
                            >
                              {executionResult.result.error.traceback}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box>
                        {executionResult.result?.stdout && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Standard Output:
                            </Typography>
                            <Box
                              sx={{
                                mt: 0.5,
                                p: 1.5,
                                bgcolor: 'grey.100',
                                borderRadius: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {executionResult.result.stdout}
                            </Box>
                          </Box>
                        )}
                        {executionResult.result?.stderr && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="error">
                              Standard Error:
                            </Typography>
                            <Box
                              sx={{
                                mt: 0.5,
                                p: 1.5,
                                bgcolor: 'error.lighter',
                                borderRadius: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {executionResult.result.stderr}
                            </Box>
                          </Box>
                        )}
                        {executionResult.result?.result !== undefined && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Return Value:
                            </Typography>
                            <Box
                              sx={{
                                mt: 0.5,
                                p: 1.5,
                                bgcolor: 'success.lighter',
                                borderRadius: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {JSON.stringify(executionResult.result.result, null, 2)}
                            </Box>
                          </Box>
                        )}
                        {executionResult.result?.execution_time && (
                          <Box sx={{ mt: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Clock size={14} />
                              <Typography variant="caption" color="text.secondary">
                                Execution time: {executionResult.result.execution_time}s
                              </Typography>
                            </Stack>
                          </Box>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Box>
        )}

        {/* Versions Tab */}
        {activeTab === 'versions' && (
          <Box>
            {versionsState.loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : versionsState.error ? (
              <Alert severity="error">{versionsState.error}</Alert>
            ) : (
              <Card>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Version ID</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(!versionsState.items || !Array.isArray(versionsState.items) || versionsState.items.length === 0) ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                              <History size={48} color="gray" />
                              <Typography variant="body2" color="text.secondary">
                                No versions found
                              </Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ) : (
                        [...versionsState.items].reverse().map((versionId) => {
                          const latestVersion = fullFunctionData.metadata?.latest_version || fullFunctionData.latest_version;
                          const isLatest = String(versionId) === String(latestVersion);
                          return (
                            <TableRow 
                              key={versionId}
                              hover
                              sx={{ cursor: 'pointer' }}
                              onClick={() => handleViewVersion(versionId)}
                            >
                              <TableCell>
                                <Typography variant="body2" fontFamily="monospace">
                                  #{versionId}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {isLatest && (
                                  <Chip
                                    label="Latest"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                )}
                              </TableCell>
                              <TableCell align="right">
                                {!isLatest && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleChangeVersion(versionId);
                                    }}
                                  >
                                    Restore Version
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}
          </Box>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Box>
            {/* Edit/Save/Cancel Buttons */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              {!isEditingSettings ? (
                <Button
                  variant="contained"
                  startIcon={<Edit size={18} />}
                  onClick={handleEditSettings}
                >
                  Edit Settings
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={isSavingSettings ? <CircularProgress size={16} /> : <Save size={18} />}
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                  >
                    {isSavingSettings ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<X size={18} />}
                    onClick={handleCancelEditSettings}
                    disabled={isSavingSettings}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Stack>

            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Function Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Name *
                        </Typography>
                        {isEditingSettings ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            placeholder="function_name"
                            helperText="Use lowercase letters, numbers, and underscores"
                          />
                        ) : (
                          <Typography variant="body2" fontFamily="monospace">
                            {fullFunctionData.metadata?.name || fullFunctionData.name}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Description
                        </Typography>
                        {isEditingSettings ? (
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            rows={3}
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            placeholder="Enter function description"
                          />
                        ) : (
                          <Typography variant="body2">
                            {fullFunctionData.metadata?.description || fullFunctionData.description || 'No description'}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Created:
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(fullFunctionData.metadata?.created_at || fullFunctionData.created_at)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Latest Version:
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          #{fullFunctionData.metadata?.latest_version || fullFunctionData.latest_version}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}
      </Stack>

      {/* Version View Drawer */}
      <Drawer
        anchor="right"
        open={versionDrawerOpen}
        onClose={handleCloseVersionDrawer}
        PaperProps={{
          sx: { width: { xs: '100%', sm: '80%', md: '60%' } },
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
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">
              Version #{selectedVersion}
            </Typography>
            <IconButton onClick={handleCloseVersionDrawer}>
              <X size={20} />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            {loadingVersion ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : versionData ? (
              <Stack spacing={3}>
                {/* Code */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Code
                  </Typography>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      height: 500,
                    }}
                  >
                    <Editor
                      height="500px"
                      defaultLanguage="python"
                      value={versionData.code || ''}
                      theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        readOnly: true,
                      }}
                    />
                  </Box>
                </Box>

                {/* Metadata */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Requirements
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {((versionData.metadata?.requirements || versionData.requirements || []).length === 0) ? (
                      <Typography variant="body2" color="text.secondary">
                        No requirements
                      </Typography>
                    ) : (
                      (versionData.metadata?.requirements || versionData.requirements || []).map((req) => (
                        <Chip key={req} label={req} size="small" />
                      ))
                    )}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Output Variables
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {((versionData.metadata?.output_variables || versionData.output_variables || []).length === 0) ? (
                      <Typography variant="body2" color="text.secondary">
                        No output variables
                      </Typography>
                    ) : (
                      (versionData.metadata?.output_variables || versionData.output_variables || []).map((variable) => (
                        <Chip key={variable} label={variable} size="small" color="primary" />
                      ))
                    )}
                  </Stack>
                </Box>

                {/* Restore Button */}
                {String(selectedVersion) !== String(fullFunctionData.metadata?.latest_version || fullFunctionData.latest_version) && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                      handleChangeVersion(selectedVersion);
                      handleCloseVersionDrawer();
                    }}
                  >
                    Restore This Version
                  </Button>
                )}
              </Stack>
            ) : null}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}

export default FunctionDetailView;
