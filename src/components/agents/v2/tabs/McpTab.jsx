import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchAgentMCPServers,
  disconnectAgentFromMCPServer,
} from '../../../../redux/slices/mcp';
import { optimai } from '../../../../utils/axios';
import Iconify from '../../../iconify';
import AddMCPServerDrawer from '../components/AddMCPServerDialog';
import CreateMCPDrawer from '../components/CreateMCPDrawer';

function McpTab({ agentData }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get MCP servers from Redux state
  const { servers: mcpServers } = useSelector((state) => state.mcp);
  const [accountServers, setAccountServers] = useState([]);

  // Fetch agent's MCP servers on mount
  useEffect(() => {
    if (agentData?.id) {
      dispatch(fetchAgentMCPServers(agentData.id));
    }
  }, [dispatch, agentData?.id]);

  // Fetch all account servers when dialog opens
  useEffect(() => {
    if (dialogOpen && agentData?.account_id) {
      // Fetch account servers directly without updating Redux
      const fetchAccountServers = async () => {
        try {
          const response = await optimai.get(
            `/mcp/servers?account_id=${agentData.account_id}&active_only=false`,
          );
          const allServers = response.data.mcp_servers || [];
          // Filter out already connected servers
          const connectedIds = mcpServers.map((s) => s.id);
          const available = allServers.filter((s) => !connectedIds.includes(s.id));
          setAccountServers(available);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch account servers:', error);
        }
      };
      fetchAccountServers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, dialogOpen, agentData?.account_id]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCreateNew = () => {
    handleCloseDialog();
    setEditingServer(null);
    setDrawerOpen(true);
  };

  const handleEditServer = (server) => {
    setEditingServer(server);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingServer(null);
  };

  const handleConnectServer = async (mcpServerId) => {
    if (!agentData?.id) return;

    // Refresh the agent's MCP servers list after successful creation
    if (mcpServerId) {
      await dispatch(fetchAgentMCPServers(agentData.id));
    }
  };

  const handleRemoveServer = async (serverId, event) => {
    event.stopPropagation();
    if (!agentData?.id) return;

    try {
      await dispatch(disconnectAgentFromMCPServer(serverId, agentData.id));
      // Refresh the list
      dispatch(fetchAgentMCPServers(agentData.id));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to disconnect MCP server:', error);
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ mb: 0.5, fontWeight: 600 }}
          >
            Custom MCP Servers
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            Provide the agent with Model Context Protocol servers to extend its capabilities.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={handleOpenDialog}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
          }}
        >
          Add Server
        </Button>
      </Box>

      {/* Servers List */}
      <Stack spacing={2}>
        {mcpServers.map((server) => (
          <Paper
            key={server.id}
            elevation={0}
            sx={{
              p: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.16)}`,
              },
            }}
            onClick={() => handleEditServer(server)}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              {/* Server Icon */}
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                  flexShrink: 0,
                }}
              >
                <Iconify
                  icon="mdi:server"
                  sx={{ fontSize: '1.5rem', color: 'text.primary' }}
                />
                {server.connection?.is_active && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      border: `2px solid ${theme.palette.background.paper}`,
                    }}
                  />
                )}
              </Box>

              {/* Server Details */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 0.25 }}
                >
                  {server.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.8125rem',
                    mb: 0.5,
                  }}
                >
                  {server.description || 'No description'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.disabled',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                  }}
                >
                  {server.url}
                </Typography>
              </Box>

              {/* Actions */}
              <Box
                sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip title="Remove">
                  <IconButton
                    size="small"
                    onClick={(e) => handleRemoveServer(server.id, e)}
                    sx={{
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.08),
                      },
                    }}
                  >
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>

      {/* Add MCP Server Drawer */}
      <AddMCPServerDrawer
        open={dialogOpen}
        onClose={handleCloseDialog}
        accountServers={accountServers}
        onConnect={handleConnectServer}
        onCreateNew={handleCreateNew}
        agentId={agentData?.id}
      />

      {/* MCP Drawer */}
      <CreateMCPDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        editingServer={editingServer}
        agentId={agentData?.id}
      />
    </Box>
  );
}

McpTab.propTypes = {
  agentData: PropTypes.object.isRequired,
};

export default McpTab;
