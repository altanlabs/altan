import {
  Box,
  Typography,
  Button,
  Drawer,
  Stack,
  useTheme,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  Skeleton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  selectAccountConnectionsByType,
  getConnections,
} from '../../../../redux/slices/connections';
import { selectAccount } from '../../../../redux/slices/general';
import { optimai, optimai_integration } from '../../../../utils/axios';
import Iconify from '../../../iconify';
import IconRenderer from '../../../icons/IconRenderer';
import ConnectionCreator from '../../../tools/ConnectionCreator';

function AddMCPServerDrawer({ open, onClose, accountServers, onConnect, onCreateNew, agentId }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const [searchTerm, setSearchTerm] = useState('');
  const [mcpConnectionTypes, setMcpConnectionTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedConnectionType, setSelectedConnectionType] = useState(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [creatingMCPServer, setCreatingMCPServer] = useState(false);
  const [linkingServerId, setLinkingServerId] = useState(null);

  // Fetch MCP-compatible connection types
  useEffect(() => {
    if (open) {
      setLoading(true);
      setSearchTerm(''); // Reset search when opening
      optimai_integration
        .get('/connection-type/all', {
          params: {
            is_mcp: true,
            is_compact: false,
          },
        })
        .then((response) => {
          const { items } = response.data;
          setMcpConnectionTypes(items || []);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch MCP connection types:', error);
          setMcpConnectionTypes([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  // Create a map of connection types for quick lookup
  const connectionTypeMap = useMemo(() => {
    const map = {};
    mcpConnectionTypes.forEach((type) => {
      map[type.id] = type;
    });
    return map;
  }, [mcpConnectionTypes]);

  // Get existing connections for the selected connection type
  const existingConnections = useSelector(
    selectedConnectionType ? selectAccountConnectionsByType(selectedConnectionType.id) : () => null,
  );

  const handleConnectionTypeClick = (connType) => {
    setSelectedConnectionType(connType);
    setSelectedConnectionId(null);
  };

  const handleCloseConnectionDialog = () => {
    setSelectedConnectionType(null);
    setSelectedConnectionId(null);
  };

  const handleConfirmConnection = async () => {
    if (!selectedConnectionId) return;

    setCreatingMCPServer(true);
    try {
      const response = await optimai.post(
        '/mcp/servers/from-connection',
        {
          connection_id: selectedConnectionId,
        },
        {
          params: agentId ? { agent_id: agentId } : {},
        },
      );

      // eslint-disable-next-line no-console
      console.log('MCP server created:', response.data);

      // Close the connection dialog
      handleCloseConnectionDialog();

      // Close the main drawer
      onClose();

      // Optionally call onConnect callback if needed for parent refresh
      if (onConnect) {
        onConnect(response.data.mcp_server?.id);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create MCP server from connection:', error);
      // TODO: Show error notification to user
    } finally {
      setCreatingMCPServer(false);
    }
  };

  const handleLinkExistingServer = async (serverId) => {
    if (!agentId) return;

    setLinkingServerId(serverId);
    try {
      await optimai.post(`/mcp/servers/${serverId}/connect-agent/${agentId}`, {
        access_level: 'user',
      });

      // eslint-disable-next-line no-console
      console.log('Linked MCP server to agent:', serverId);

      // Close the main drawer
      onClose();

      // Refresh the parent list
      if (onConnect) {
        onConnect(serverId);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to link MCP server to agent:', error);
      // TODO: Show error notification to user
    } finally {
      setLinkingServerId(null);
    }
  };

  // Filter connection types and account servers based on search term
  const filteredConnectionTypes = useMemo(() => {
    if (!searchTerm.trim()) return mcpConnectionTypes;
    const lower = searchTerm.toLowerCase();
    return mcpConnectionTypes.filter(
      (type) =>
        type.name?.toLowerCase().includes(lower) || type.description?.toLowerCase().includes(lower),
    );
  }, [mcpConnectionTypes, searchTerm]);

  const filteredAccountServers = useMemo(() => {
    if (!searchTerm.trim()) return accountServers;
    const lower = searchTerm.toLowerCase();
    return accountServers.filter(
      (server) =>
        server.name?.toLowerCase().includes(lower) || server.url?.toLowerCase().includes(lower),
    );
  }, [accountServers, searchTerm]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          bgcolor: 'background.default',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 0.25 }}
          >
            Add MCP Server
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary' }}
          >
            Connect to MCP-compatible services
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
        >
          <Iconify icon="eva:close-outline" />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ px: 2 }}
        >
          <Tab
            label="Available Services"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            label={`Your Servers ${filteredAccountServers.length > 0 ? `(${filteredAccountServers.length})` : ''}`}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {/* Search */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={activeTab === 0 ? 'Search available services...' : 'Search your servers...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: 'text.disabled', width: 20, height: 20 }}
                />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Content */}
      <Box
        className="no-scrollbar"
        sx={{ flex: 1, overflowY: 'auto', px: 2, pb: 2 }}
      >
        {/* Tab 0: Available MCP Connection Types */}
        {activeTab === 0 && (
          <Box>
            <Stack spacing={2}>
              {/* New Custom MCP Server Button - Always at top */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  border: `1px dashed ${theme.palette.divider}`,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.grey[500], 0.02),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
                onClick={onCreateNew}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  }}
                >
                  <Iconify
                    icon="eva:plus-circle-outline"
                    sx={{ fontSize: '1.25rem', color: 'primary.main' }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, mb: 0.25 }}
                  >
                    New Custom MCP Server
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                  >
                    Connect to your own MCP server
                  </Typography>
                </Box>
                <Iconify
                  icon="eva:arrow-ios-forward-fill"
                  sx={{ color: 'text.disabled', fontSize: '1rem' }}
                />
              </Box>

              {/* Section Header */}
              {!loading && (filteredConnectionTypes.length > 0 || searchTerm) && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 0.5,
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: 1,
                      }}
                    >
                      Altan Hosted MCPs
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Iconify
                        icon="eva:external-link-outline"
                        sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                      />
                      <Typography
                        component="a"
                        href="https://github.com/modelcontextprotocol/servers"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          textDecoration: 'none',
                          fontSize: '0.7rem',
                          '&:hover': {
                            color: 'primary.main',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Find more
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}

              {loading ? (
                <Stack spacing={1}>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rectangular"
                      height={72}
                      sx={{ borderRadius: 1.5 }}
                    />
                  ))}
                </Stack>
              ) : filteredConnectionTypes.length > 0 ? (
                filteredConnectionTypes.map((connType) => (
                  <Box
                    key={connType.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1.5,
                      bgcolor: theme.palette.background.paper,
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                    onClick={() => handleConnectionTypeClick(connType)}
                  >
                    {/* Connection Type Icon */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: alpha(
                          connType.meta_data?.color || theme.palette.primary.main,
                          0.08,
                        ),
                        flexShrink: 0,
                      }}
                    >
                      <IconRenderer
                        icon={connType.icon || 'mdi:server'}
                        size={40}
                        color={connType.meta_data?.color}
                      />
                    </Box>

                    {/* Connection Type Details */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 0.25,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                        >
                          {connType.name}
                        </Typography>
                        {connType.is_official && (
                          <Chip
                            label="Official"
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.625rem',
                              '& .MuiChip-label': { px: 0.75, py: 0 },
                            }}
                          />
                        )}
                      </Box>
                      {connType.description && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.7rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {connType.description}
                        </Typography>
                      )}
                    </Box>

                    <Iconify
                      icon="eva:arrow-ios-forward-fill"
                      sx={{ color: 'text.disabled', fontSize: '1rem' }}
                    />
                  </Box>
                ))
              ) : searchTerm ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 6,
                    color: 'text.secondary',
                  }}
                >
                  <Iconify
                    icon="eva:search-outline"
                    sx={{ fontSize: '3rem', mb: 1, opacity: 0.3 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 0.5 }}
                  >
                    No MCP services found
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.disabled' }}
                  >
                    Try a different search term
                  </Typography>
                </Box>
              ) : null}
            </Stack>
          </Box>
        )}

        {/* Tab 1: Your MCP Servers */}
        {activeTab === 1 && (
          <Stack spacing={2}>
            {filteredAccountServers.length > 0 ? (
              filteredAccountServers.map((server) => {
                const connType = server.connection_type
                  ? connectionTypeMap[server.connection_type]
                  : null;
                return (
                  <Box
                    key={server.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1.5,
                      bgcolor: theme.palette.background.paper,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    {/* Server Icon */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: alpha(connType?.meta_data?.color || theme.palette.grey[500], 0.08),
                        flexShrink: 0,
                      }}
                    >
                      <IconRenderer
                        icon={server.meta_data?.icon || connType?.icon || 'mdi:server'}
                        size={20}
                        color={connType?.meta_data?.color}
                      />
                    </Box>

                    {/* Server Details */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 0.25 }}
                      >
                        {server.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.7rem',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {server.url}
                      </Typography>
                    </Box>

                    {/* Link Button */}
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleLinkExistingServer(server.id)}
                      disabled={linkingServerId === server.id}
                      startIcon={
                        linkingServerId === server.id ? (
                          <CircularProgress
                            size={14}
                            color="inherit"
                          />
                        ) : (
                          <Iconify icon="eva:link-outline" />
                        )
                      }
                      sx={{
                        minWidth: 80,
                        textTransform: 'none',
                        fontSize: '0.8125rem',
                      }}
                    >
                      {linkingServerId === server.id ? '' : 'Link'}
                    </Button>
                  </Box>
                );
              })
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 6,
                  color: 'text.secondary',
                }}
              >
                <Iconify
                  icon="eva:server-outline"
                  sx={{ fontSize: '3rem', mb: 1, opacity: 0.3 }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: 0.5 }}
                >
                  No MCP servers found
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.disabled' }}
                >
                  {searchTerm ? 'Try a different search' : 'Create one to get started'}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      {/* Connection Selection Dialog */}
      <Dialog
        open={!!selectedConnectionType}
        onClose={handleCloseConnectionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: alpha(
                  selectedConnectionType?.meta_data?.color || theme.palette.primary.main,
                  0.08,
                ),
              }}
            >
              <IconRenderer
                icon={selectedConnectionType?.icon || 'mdi:server'}
                size={40}
                color={selectedConnectionType?.meta_data?.color}
              />
            </Box>
            <Box>
              <Typography variant="h6">Connect {selectedConnectionType?.name}</Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary' }}
              >
                Select or create a connection
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {/* Existing Connections */}
            {existingConnections && existingConnections.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.5, fontWeight: 600 }}
                >
                  Your Connections
                </Typography>
                <RadioGroup
                  value={selectedConnectionId || ''}
                  onChange={(e) => setSelectedConnectionId(e.target.value)}
                >
                  {existingConnections.map((conn) => (
                    <Box
                      key={conn.id}
                      sx={{
                        p: 1.5,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1.5,
                        mb: 1,
                        bgcolor:
                          selectedConnectionId === conn.id
                            ? alpha(theme.palette.primary.main, 0.04)
                            : 'transparent',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                      onClick={() => setSelectedConnectionId(conn.id)}
                    >
                      <FormControlLabel
                        value={conn.id}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {conn.name}
                            </Typography>
                            {conn.details?.url && (
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary' }}
                              >
                                {conn.details.url}
                              </Typography>
                            )}
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Box>
                  ))}
                </RadioGroup>
              </Box>
            )}

            {/* Create New Connection - Always visible */}
            {selectedConnectionType && (
              <Box>
                {existingConnections && existingConnections.length > 0 && (
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, fontWeight: 600 }}
                  >
                    Create New Connection
                  </Typography>
                )}
                <ConnectionCreator
                  connectionType={selectedConnectionType}
                  setIsCreatingNewConnection={async (value) => {
                    if (!value) {
                      // Connection was created or dialog closed
                      // eslint-disable-next-line no-console
                      console.log('🔄 Connection creator closed, refreshing connections...');
                      // Refresh connections list
                      if (account?.id) {
                        // eslint-disable-next-line no-console
                        console.log('Fetching connections for account:', account.id);
                        await dispatch(getConnections(account.id, true)); // Force refresh

                        // Small delay to ensure Redux state is updated
                        setTimeout(() => {
                          // Auto-select the newest connection of this type
                          const updatedConnections = existingConnections;
                          // eslint-disable-next-line no-console
                          console.log('Updated connections after refresh:', updatedConnections);
                          if (updatedConnections && updatedConnections.length > 0) {
                            // Get the most recently created connection
                            const newest = [...updatedConnections].sort(
                              (a, b) => new Date(b.date_creation) - new Date(a.date_creation),
                            )[0];
                            // eslint-disable-next-line no-console
                            console.log('Auto-selecting newest connection:', newest);
                            if (newest) {
                              setSelectedConnectionId(newest.id);
                            }
                          }
                        }, 500);
                      }
                    }
                  }}
                  disableClose={false}
                  popup={false}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseConnectionDialog}
            disabled={creatingMCPServer}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmConnection}
            variant="contained"
            disabled={!selectedConnectionId || creatingMCPServer}
            startIcon={
              creatingMCPServer ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : null
            }
          >
            {creatingMCPServer ? 'Creating...' : 'Connect to Agent'}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}

AddMCPServerDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  accountServers: PropTypes.array.isRequired,
  onConnect: PropTypes.func,
  onCreateNew: PropTypes.func.isRequired,
  agentId: PropTypes.string,
};

export default AddMCPServerDrawer;
