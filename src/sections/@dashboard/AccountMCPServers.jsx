import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchMCPServers,
  deleteMCPServer,
} from '../../redux/slices/mcp';
import { selectAccount } from '../../redux/slices/general/index.ts';
import Iconify from '../../components/iconify';
import IconRenderer from '../../components/icons/IconRenderer';
import CreateMCPDrawer from '../../components/agents/v2/components/CreateMCPDrawer';

function AccountMCPServers() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingServer, setEditingServer] = useState(null);

  // Get MCP servers from Redux state
  const { servers: mcpServers, isLoading } = useSelector((state) => state.mcp);

  // Fetch account's MCP servers on mount
  useEffect(() => {
    if (account?.id) {
      dispatch(fetchMCPServers(account.id, false)); // false = include inactive servers
    }
  }, [dispatch, account?.id]);

  const handleCreateNew = () => {
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
    // Refresh the list after closing
    if (account?.id) {
      dispatch(fetchMCPServers(account.id, false));
    }
  };

  const handleDeleteServer = async (serverId, event) => {
    event.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this MCP server?')) {
      return;
    }

    try {
      await dispatch(deleteMCPServer(serverId, false));
      // Refresh the list
      if (account?.id) {
        dispatch(fetchMCPServers(account.id, false));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete MCP server:', error);
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
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
            variant="h4"
            sx={{ mb: 0.5, fontWeight: 600 }}
          >
            MCP Servers
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            Manage all Model Context Protocol servers for your account. These can be connected to
            any agent.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleCreateNew}
          startIcon={<Iconify icon="eva:plus-fill" />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
          }}
        >
          New Server
        </Button>
      </Box>

      {/* Servers List */}
      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            Loading servers...
          </Typography>
        </Box>
      ) : mcpServers.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.grey[500], 0.08),
              mb: 2,
            }}
          >
            <Iconify
              icon="mdi:server"
              sx={{ fontSize: '2.5rem', color: 'text.secondary' }}
            />
          </Box>
          <Typography
            variant="h6"
            sx={{ mb: 0.5, fontWeight: 600 }}
          >
            No MCP Servers Yet
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mb: 3 }}
          >
            Create your first MCP server to extend your agents&apos; capabilities
          </Typography>
          <Button
            variant="contained"
            onClick={handleCreateNew}
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Create MCP Server
          </Button>
        </Box>
      ) : (
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
                    width: 56,
                    height: 56,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.grey[500], 0.08),
                    flexShrink: 0,
                  }}
                >
                  <IconRenderer
                    icon={server.meta_data?.icon || 'mdi:server'}
                    size={28}
                  />
                  {server.is_active && (
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600 }}
                    >
                      {server.name}
                    </Typography>
                    {server.approval_policy && (
                      <Chip
                        label={
                          server.approval_policy === 'always_ask'
                            ? 'Always Ask'
                            : server.approval_policy === 'fine_grained'
                              ? 'Fine-Grained'
                              : 'Auto Approve'
                        }
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.6875rem',
                          bgcolor: alpha(
                            server.approval_policy === 'always_ask'
                              ? theme.palette.warning.main
                              : theme.palette.success.main,
                            0.12,
                          ),
                          color:
                            server.approval_policy === 'always_ask'
                              ? 'warning.main'
                              : 'success.main',
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      mb: 0.75,
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
                      display: 'block',
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
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteServer(server.id, e)}
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
      )}

      {/* Create/Edit MCP Server Drawer */}
      <CreateMCPDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        editingServer={editingServer}
        agentId={null} // No agent connection needed for account-level servers
      />
    </Box>
  );
}

export default AccountMCPServers;


