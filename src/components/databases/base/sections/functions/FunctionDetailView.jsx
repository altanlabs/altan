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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  History,
  Clock,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';

import {
  selectExecutionResult,
  selectVersionsForFunction,
  executeFunction,
  fetchFunctionVersions,
  changeLatestVersion,
  toggleFunctionEnabled,
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
  
  const executionResult = useSelector((state) =>
    selectExecutionResult(state, functionData.name),
  );
  const versionsState = useSelector((state) =>
    selectVersionsForFunction(state, functionData.name),
  );

  useEffect(() => {
    if (activeTab === 'versions') {
      dispatch(fetchFunctionVersions(baseId, functionData.name));
    }
  }, [activeTab, baseId, functionData.name]);

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
      onShowSnackbar('Latest version updated successfully', 'success');
      // Refresh versions
      dispatch(fetchFunctionVersions(baseId, functionData.name));
    } catch (error) {
      onShowSnackbar(error.message || 'Failed to change version', 'error');
    }
  };

  const handleToggleEnabled = async () => {
    try {
      const newState = !functionData.enabled;
      await dispatch(toggleFunctionEnabled(baseId, functionData.name, newState));
      onShowSnackbar(`Function ${newState ? 'enabled' : 'disabled'} successfully`, 'success');
      onBack(); // Go back to refresh the list
    } catch (error) {
      onShowSnackbar(error.message || 'Failed to toggle function state', 'error');
    }
  };

  const isEnabled = functionData.enabled !== false;

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack spacing={2}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={onBack}
            sx={{ alignSelf: 'flex-start' }}
            variant="text"
          >
            Back to Functions
          </Button>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h4">{functionData.name}</Typography>
                <Chip
                  icon={isEnabled ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  label={isEnabled ? 'Enabled' : 'Disabled'}
                  size="small"
                  color={isEnabled ? 'success' : 'default'}
                  variant="outlined"
                />
              </Stack>
              {functionData.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {functionData.description}
                </Typography>
              )}
            </Box>
          </Stack>
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
                    value={functionData.code || ''}
                    theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      readOnly: true,
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
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {(functionData.requirements || []).map((req) => (
                        <Chip key={req} label={req} size="small" />
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Output Variables
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {(functionData.output_variables || []).map((variable) => (
                        <Chip key={variable} label={variable} size="small" color="primary" />
                      ))}
                    </Stack>
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
                      {versionsState.items.length === 0 ? (
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
                        versionsState.items.map((version) => {
                          const isLatest = version.is_latest;
                          return (
                            <TableRow key={version.function_id}>
                              <TableCell>
                                <Typography variant="body2" fontFamily="monospace">
                                  #{version.function_id}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {formatDate(version.created_at)}
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
                                    variant="outlined"
                                    onClick={() => handleChangeVersion(version.function_id)}
                                  >
                                    Make Latest
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
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Function Status
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isEnabled}
                          onChange={handleToggleEnabled}
                        />
                      }
                      label={isEnabled ? 'Function is enabled' : 'Function is disabled'}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {isEnabled
                        ? 'This function can be executed via API calls'
                        : 'This function is disabled and cannot be executed'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Function Information
                    </Typography>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Name:
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {functionData.name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Created:
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(functionData.created_at)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Last Modified:
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(functionData.updated_at)}
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
    </Box>
  );
}

export default FunctionDetailView;

