import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search,
  Code,
  Plus,
  MoreVertical,
  Trash2,
  RefreshCw,
  Key,
  Lock,
  Edit2,
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';

import ApiDocsViewer from './functions/ApiDocsViewer';
import CreateFunctionDrawer from './functions/CreateFunctionDrawer';
import CreateMCPAppDrawer from './functions/CreateMCPAppDrawer';
import CreateSecretDrawer from './functions/CreateSecretDrawer';
import EditFunctionDrawer from './functions/EditFunctionDrawer';
import FunctionDetailView from './functions/FunctionDetailView';
import { selectAccountId } from '../../../../redux/slices/general';
import {
  selectFunctionsForBase,
  selectSecretsForBase,
  fetchFunctions,
  fetchSecrets,
  deleteFunction,
  deleteSecret,
} from '../../../../redux/slices/services';
import { dispatch } from '../../../../redux/store';
import { setSession } from '../../../../utils/auth';
import { optimai_cloud, optimai_integration } from '../../../../utils/axios';

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

function BaseFunctions({ baseId }) {
  const functionsState = useSelector((state) => selectFunctionsForBase(state, baseId));
  const secretsState = useSelector((state) => selectSecretsForBase(state, baseId));
  const accountId = useSelector(selectAccountId);

  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [createSecretDrawerOpen, setCreateSecretDrawerOpen] = useState(false);
  const [operating, setOperating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState('api-docs'); // 'api-docs', 'functions', or 'secrets'

  // Function detail view state
  const [viewingFunction, setViewingFunction] = useState(null);

  // Secrets menu state
  const [secretsMenuAnchor, setSecretsMenuAnchor] = useState(null);
  const [selectedSecret, setSelectedSecret] = useState(null);

  // Cloud URL for API docs
  const [cloudUrl, setCloudUrl] = useState(null);

  // MCP drawer state
  const [mcpDrawerOpen, setMcpDrawerOpen] = useState(false);
  const [existingMcp, setExistingMcp] = useState(null);
  const [checkingMcp, setCheckingMcp] = useState(false);

  // Fetch functions and secrets on mount
  useEffect(() => {
    dispatch(fetchFunctions(baseId));
    dispatch(fetchSecrets(baseId));
  }, [baseId]);

  // Fetch cloud URL for API docs
  useEffect(() => {
    const fetchCloudUrl = async () => {
      try {
        // Ensure token is set
        const authData = localStorage.getItem('oaiauth');
        if (authData) {
          try {
            const { access_token: accessToken } = JSON.parse(authData);
            if (accessToken) {
              setSession(accessToken, optimai_cloud);
            }
          } catch {
            // Ignore parse errors
          }
        }

        const response = await optimai_cloud.get(`/v1/instances/metrics/cloud/${baseId}`);
        if (response.data?.cloud_url) {
          setCloudUrl(response.data.cloud_url);
        }
      } catch {
        // Silently handle error - cloud URL is for optional API docs tab
      }
    };

    fetchCloudUrl();
  }, [baseId]);

  // Check if MCP already exists for this database
  useEffect(() => {
    const checkExistingMcp = async () => {
      if (!cloudUrl || !accountId) return;

      setCheckingMcp(true);
      setExistingMcp(null);

      try {
        // Ensure token is set
        const authData = localStorage.getItem('oaiauth');
        if (authData) {
          try {
            const { access_token: accessToken } = JSON.parse(authData);
            if (accessToken) {
              setSession(accessToken, optimai_integration);
            }
          } catch {
            // Ignore parse errors
          }
        }

        const openapiUrl = `${cloudUrl}/services/openapi.json`;

        const response = await optimai_integration.get('/connection-type/find', {
          params: {
            openapi_schema_url: openapiUrl,
            account_id: accountId,
            is_compact: true,
          },
        });

        if (response.data?.connection_type) {
          setExistingMcp(response.data.connection_type);
        }
      } catch (error) {
        // If 404 or error, means it doesn't exist - which is fine
        if (error.response?.status !== 404) {
          // Silently handle - not critical
        }
      } finally {
        setCheckingMcp(false);
      }
    };

    checkExistingMcp();
  }, [cloudUrl, accountId]);

  const functions = functionsState.items || [];
  const secrets = secretsState.items || [];

  const filteredFunctions = useMemo(() => {
    if (!searchQuery) return functions;
    const query = searchQuery.toLowerCase();
    return functions.filter((func) => {
      const name = (func.name || '').toLowerCase();
      const description = (func.description || '').toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [functions, searchQuery]);

  const handleMenuOpen = (event, func) => {
    setMenuAnchor(event.currentTarget);
    setSelectedFunction(func);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedFunction(null);
  };

  const handleSecretsMenuOpen = (event, secret) => {
    setSecretsMenuAnchor(event.currentTarget);
    setSelectedSecret(secret);
  };

  const handleSecretsMenuClose = () => {
    setSecretsMenuAnchor(null);
    setSelectedSecret(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewFunction = (func) => {
    setViewingFunction(func);
  };

  const handleBackToList = () => {
    setViewingFunction(null);
    // Refresh functions list
    dispatch(fetchFunctions(baseId));
  };

  const handleDeleteFunction = async () => {
    if (!selectedFunction) return;

    handleMenuClose();
    setOperating(true);

    try {
      await dispatch(deleteFunction(baseId, selectedFunction.name));
      setSnackbar({
        open: true,
        message: 'Service deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete service',
        severity: 'error',
      });
    } finally {
      setOperating(false);
    }
  };

  const handleEditFunction = () => {
    handleMenuClose();
    setEditDrawerOpen(true);
  };

  const handleDeleteSecret = async () => {
    if (!selectedSecret) return;

    handleSecretsMenuClose();
    setOperating(true);

    try {
      await dispatch(deleteSecret(baseId, selectedSecret.key));
      setSnackbar({
        open: true,
        message: 'Secret deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete secret',
        severity: 'error',
      });
    } finally {
      setOperating(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'functions') {
      dispatch(fetchFunctions(baseId));
    } else if (activeTab === 'secrets') {
      dispatch(fetchSecrets(baseId));
    }
    // API docs don't need refresh - they fetch directly from cloud_url
  };

  const handleOpenMcpDrawer = () => {
    if (existingMcp) {
      // Navigate to the existing MCP connector or show details
      // For now, just show a message
      setSnackbar({
        open: true,
        message: `MCP app "${existingMcp.name}" already exists for this database`,
        severity: 'info',
      });
      return;
    }
    setMcpDrawerOpen(true);
  };

  const handleCloseMcpDrawer = () => {
    setMcpDrawerOpen(false);
  };

  const handleMcpSuccess = (message) => {
    setSnackbar({ open: true, message, severity: 'success' });
    // Refresh the MCP check after successful creation
    if (cloudUrl && accountId) {
      setTimeout(async () => {
        try {
          const authData = localStorage.getItem('oaiauth');
          if (authData) {
            try {
              const { access_token: accessToken } = JSON.parse(authData);
              if (accessToken) {
                setSession(accessToken, optimai_integration);
              }
            } catch {
              // Ignore
            }
          }

          const openapiUrl = `${cloudUrl}/services/openapi.json`;
          const response = await optimai_integration.get('/connection-type/find', {
            params: {
              openapi_schema_url: openapiUrl,
              account_id: accountId,
              is_compact: true,
            },
          });

          if (response.data?.connection_type) {
            setExistingMcp(response.data.connection_type);
          }
        } catch {
          // Ignore
        }
      }, 1000);
    }
  };

  // Show loading state
  if (functionsState.loading && functions.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          p: 3,
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Loading services...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Show error state if there's an error
  if (functionsState.error && functions.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Stack
              spacing={2}
              alignItems="center"
              sx={{ py: 4 }}
            >
              <Typography
                variant="h6"
                color="error"
              >
                Unable to load services
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                {functionsState.error}
              </Typography>
              <Button
                variant="soft"
                color="inherit"
                onClick={() => dispatch(fetchFunctions(baseId))}
              >
                Try Again
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Function detail view
  if (viewingFunction) {
    return (
      <FunctionDetailView
        baseId={baseId}
        functionData={viewingFunction}
        onBack={handleBackToList}
        onShowSnackbar={(message, severity) => setSnackbar({ open: true, message, severity })}
      />
    );
  }

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="h4"
              gutterBottom
            >
              Services
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={2}
          >
            {existingMcp ? (
              <Button
                startIcon={<Code size={18} />}
                onClick={handleOpenMcpDrawer}
                variant="soft"
                color="primary"
              >
                View MCP Connector
              </Button>
            ) : (
              <Button
                startIcon={<Plus size={18} />}
                onClick={handleOpenMcpDrawer}
                variant="soft"
                color="primary"
                disabled={!cloudUrl || checkingMcp}
              >
                {checkingMcp ? 'Checking...' : 'Turn into MCP'}
              </Button>
            )}
            <Button
              startIcon={<RefreshCw size={18} />}
              onClick={handleRefresh}
              variant="soft"
              color="inherit"
            >
              Refresh
            </Button>
          </Stack>
        </Stack>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
          >
            <Tab
              label="API Overview"
              value="api-docs"
            />
            <Tab
              label="Code"
              value="functions"
            />
            <Tab
              label="Secrets"
              value="secrets"
            />
          </Tabs>
        </Box>

        {/* API Docs Tab */}
        {activeTab === 'api-docs' && (
          <Box>
            {cloudUrl ? (
              <ApiDocsViewer cloudUrl={cloudUrl} />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '400px',
                }}
              >
                <Stack
                  spacing={2}
                  alignItems="center"
                >
                  <CircularProgress />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Loading API documentation...
                  </Typography>
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* Functions Tab */}
        {activeTab === 'functions' && (
          <Box>
            {/* Actions Bar */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Button
                variant="soft"
                color="inherit"
                startIcon={<Plus size={18} />}
                onClick={() => setCreateDrawerOpen(true)}
                disabled={operating}
              >
                Create Service
              </Button>
              <TextField
                size="small"
                placeholder="Search by name or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1, maxWidth: 400 }}
              />
            </Stack>

            {/* Services Table */}
            <Card>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Mounted At</TableCell>
                      <TableCell>Requirements</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFunctions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          align="center"
                        >
                          <Stack
                            spacing={2}
                            alignItems="center"
                            sx={{ py: 4 }}
                          >
                            <Code
                              size={48}
                              color="gray"
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {searchQuery ? 'No code found matching your search' : 'No code yet'}
                            </Typography>
                            {!searchQuery && (
                              <Button
                                variant="soft"
                                color="inherit"
                                startIcon={<Plus size={18} />}
                                onClick={() => setCreateDrawerOpen(true)}
                              >
                                Create Your First Code
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFunctions.map((func) => (
                        <TableRow
                          key={func.name}
                          hover
                          onClick={() => handleViewFunction(func)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Code size={20} />
                              <Box>
                                <Typography
                                  variant="body2"
                                  fontWeight={500}
                                >
                                  {func.name}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ maxWidth: 300 }}
                            >
                              {func.description || 'No description'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: 'monospace' }}
                            >
                              {func.mounted_at || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {func.requirements?.length || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{formatDate(func.created_at)}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMenuOpen(e, func);
                              }}
                            >
                              <MoreVertical size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            {/* Services count */}
            {filteredFunctions.length > 0 && (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {filteredFunctions.length} {filteredFunctions.length === 1 ? 'code' : 'codes'}
                </Typography>
              </Stack>
            )}
          </Box>
        )}

        {/* Secrets Tab */}
        {activeTab === 'secrets' && (
          <Box>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Button
                variant="soft"
                color="inherit"
                startIcon={<Plus size={18} />}
                onClick={() => setCreateSecretDrawerOpen(true)}
                disabled={operating}
              >
                Create Secret
              </Button>
            </Stack>

            {/* Secrets Table */}
            <Card>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Key</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Updated</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {secrets.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                        >
                          <Stack
                            spacing={2}
                            alignItems="center"
                            sx={{ py: 4 }}
                          >
                            <Key
                              size={48}
                              color="gray"
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              No secrets configured
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ maxWidth: 400, textAlign: 'center' }}
                            >
                              Secrets are encrypted environment variables accessible to your
                              functions
                            </Typography>
                            <Button
                              variant="soft"
                              color="inherit"
                              startIcon={<Plus size={18} />}
                              onClick={() => setCreateSecretDrawerOpen(true)}
                            >
                              Create Your First Secret
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : (
                      secrets.map((secret) => (
                        <TableRow
                          key={secret.key}
                          hover
                        >
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Lock size={16} />
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{ fontFamily: 'monospace' }}
                              >
                                {secret.key}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {secret.description || 'No description'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{formatDate(secret.created_at)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{formatDate(secret.updated_at)}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSecretsMenuOpen(e, secret);
                              }}
                            >
                              <MoreVertical size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            {/* Secrets count */}
            {secrets.length > 0 && (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {secrets.length} {secrets.length === 1 ? 'secret' : 'secrets'}
                </Typography>
              </Stack>
            )}
          </Box>
        )}
      </Stack>

      {/* Service Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleViewFunction(selectedFunction);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Code size={18} />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditFunction}>
          <ListItemIcon>
            <Edit2 size={18} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleDeleteFunction}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Trash2
              size={18}
              color="currentColor"
            />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Secrets Actions Menu */}
      <Menu
        anchorEl={secretsMenuAnchor}
        open={Boolean(secretsMenuAnchor)}
        onClose={handleSecretsMenuClose}
      >
        <MenuItem
          onClick={handleDeleteSecret}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Trash2
              size={18}
              color="currentColor"
            />
          </ListItemIcon>
          <ListItemText>Delete Secret</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Function Drawer */}
      <CreateFunctionDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        baseId={baseId}
        onSuccess={(message) => {
          setCreateDrawerOpen(false);
          setSnackbar({ open: true, message, severity: 'success' });
        }}
        onError={(message) => {
          setSnackbar({ open: true, message, severity: 'error' });
        }}
      />

      {/* Edit Function Drawer */}
      {selectedFunction && (
        <EditFunctionDrawer
          open={editDrawerOpen}
          onClose={() => {
            setEditDrawerOpen(false);
            setSelectedFunction(null);
          }}
          baseId={baseId}
          functionData={selectedFunction}
          onSuccess={(message) => {
            setEditDrawerOpen(false);
            setSelectedFunction(null);
            setSnackbar({ open: true, message, severity: 'success' });
          }}
          onError={(message) => {
            setSnackbar({ open: true, message, severity: 'error' });
          }}
        />
      )}

      {/* Create Secret Drawer */}
      <CreateSecretDrawer
        open={createSecretDrawerOpen}
        onClose={() => setCreateSecretDrawerOpen(false)}
        baseId={baseId}
        onSuccess={(message) => {
          setCreateSecretDrawerOpen(false);
          setSnackbar({ open: true, message, severity: 'success' });
        }}
        onError={(message) => {
          setSnackbar({ open: true, message, severity: 'error' });
        }}
      />

      {/* MCP Drawer */}
      <CreateMCPAppDrawer
        open={mcpDrawerOpen}
        onClose={handleCloseMcpDrawer}
        cloudUrl={cloudUrl}
        accountId={accountId}
        baseId={baseId}
        onSuccess={handleMcpSuccess}
        onError={(message) => {
          setSnackbar({ open: true, message, severity: 'error' });
        }}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 1400 }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default BaseFunctions;
