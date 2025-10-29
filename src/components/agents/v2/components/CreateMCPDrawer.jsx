import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Drawer,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Chip,
  Radio,
  RadioGroup,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MCPToolsTab from './MCPToolsTab';
import { selectAccount } from '../../../../redux/slices/general';
import {
  createMCPServer,
  updateMCPServer,
  connectAgentToMCPServer,
  updateAgentMCPConnection,
  fetchAgentMCPServers,
} from '../../../../redux/slices/mcp';
import Iconify from '../../../iconify';
import IconRenderer from '../../../icons/IconRenderer';

function CreateMCPDrawer({ open, onClose, editingServer = null, agentId }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.mcp);
  const { currentAgent } = useSelector((state) => state.agents);
  const account = useSelector(selectAccount);

  // Tab state (only for editing)
  const [activeTab, setActiveTab] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'mdi:server',
    serverType: 'streamable_http',
    urlType: 'value',
    url: '',
    secret: 'none',
    headers: [],
    approvalMode: 'auto_approve_all',
    forcePreToolSpeech: false,
    disableInterruptions: false,
    executionMode: 'immediate',
    trustServer: false,
  });

  // Load editing server data when it changes
  useEffect(() => {
    if (editingServer) {
      setActiveTab(0); // Reset to Overview tab
      setFormData({
        name: editingServer.name || '',
        description: editingServer.description || '',
        icon: editingServer.meta_data?.icon || 'mdi:server',
        serverType: editingServer.transport || 'streamable_http',
        urlType: editingServer.urlType || 'value',
        url: editingServer.url || '',
        secret: editingServer.secret || 'none',
        headers: editingServer.request_headers || [],
        approvalMode: editingServer.approval_policy || 'auto_approve_all',
        forcePreToolSpeech: editingServer.force_pre_tool_speech || false,
        disableInterruptions: editingServer.disable_interruptions || false,
        executionMode: editingServer.execution_mode || 'immediate',
        trustServer: true, // Already created server, so trusted
      });
    } else {
      // Reset form when creating new
      setActiveTab(0);
      setFormData({
        name: '',
        description: '',
        icon: 'mdi:server',
        serverType: 'streamable_http',
        urlType: 'value',
        url: '',
        secret: 'none',
        headers: [],
        approvalMode: 'auto_approve_all',
        forcePreToolSpeech: false,
        disableInterruptions: false,
        executionMode: 'immediate',
        trustServer: false,
      });
    }
  }, [editingServer, open]);

  const handleAddHeader = () => {
    setFormData({
      ...formData,
      headers: [...formData.headers, { key: '', value: '' }],
    });
  };

  const handleRemoveHeader = (index) => {
    setFormData({
      ...formData,
      headers: formData.headers.filter((_, i) => i !== index),
    });
  };

  const handleHeaderChange = (index, field, value) => {
    const updatedHeaders = [...formData.headers];
    updatedHeaders[index][field] = value;
    setFormData({ ...formData, headers: updatedHeaders });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      return;
    }

    try {
      if (editingServer) {
        // Update existing server
        await dispatch(updateMCPServer(editingServer.id, formData));
        // Update connection settings if needed (only if connected to an agent)
        if (agentId) {
          await dispatch(
            updateAgentMCPConnection(editingServer.id, agentId, {
              isActive: true,
            }),
          );
        }
      } else {
        // Create new server
        const accountId = currentAgent?.account_id || account?.id;
        if (!accountId) {
          // eslint-disable-next-line no-console
          console.error('No account ID found');
          return;
        }

        const newServer = await dispatch(createMCPServer(accountId, formData));
        // Connect agent to the new server (only if agentId is provided)
        if (agentId) {
          await dispatch(
            connectAgentToMCPServer(newServer.id, agentId, {
              accessLevel: 'user',
            }),
          );
        }
      }

      // Refresh the agent's MCP servers list (only if connected to an agent)
      if (agentId) {
        await dispatch(fetchAgentMCPServers(agentId));
      }

      // Close the drawer
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save MCP server:', error);
    }
  };

  const isFormValid = formData.name && formData.url;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 600, md: 700 },
          bgcolor: 'background.default',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.grey[500], 0.08),
              position: 'relative',
            }}
          >
            <IconRenderer
              icon={formData.icon}
              size={20}
            />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            {editingServer ? 'Edit' : 'New'} Custom MCP Server
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
        >
          <Iconify icon="eva:close-outline" />
        </IconButton>
      </Box>

      {/* Tabs (only show when editing) */}
      {editingServer && (
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              minHeight: 48,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                minHeight: 48,
                minWidth: 120,
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                px: 3,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
                '&:hover': {
                  color: 'text.primary',
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              },
            }}
          >
            <Tab
              label="Overview"
              icon={<Iconify icon="eva:eye-outline" />}
              iconPosition="start"
            />
            <Tab
              label="Tools"
              icon={<Iconify icon="eva:grid-outline" />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
      )}

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
        }}
      >
        {/* Show Tools tab when editing and tab is active */}
        {editingServer && activeTab === 1 ? (
          <MCPToolsTab
            serverId={editingServer.id}
            serverApprovalMode={formData.approvalMode}
            existingToolPolicies={editingServer.tool_policies}
          />
        ) : (
          <Stack spacing={2}>
            {/* Basic Information */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.grey[500], 0.02),
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 0.5 }}
              >
                Basic Information
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2 }}
              >
                Identify your MCP server with a clear name and description.
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: 500 }}
                  >
                    Name
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter server name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: 500 }}
                  >
                    Icon
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter icon name (e.g., mdi:server, eva:code-outline)"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                        flexShrink: 0,
                      }}
                    >
                      <IconRenderer
                        icon={formData.icon}
                        size={20}
                      />
                    </Box>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}
                  >
                    Use Iconify icons (iconify.design), HTTP URLs, or /assets paths
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: 500 }}
                  >
                    Description
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Describe what this server does"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Box>
              </Stack>
            </Paper>

            {/* Server Configuration */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.grey[500], 0.02),
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 0.5 }}
              >
                Server Configuration
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2 }}
              >
                Specify how to connect to your MCP server.
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: 500 }}
                  >
                    Server URL
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="https://example.com/sse"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </Box>
              </Stack>
            </Paper>

            {/* Secret Token */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.grey[500], 0.02),
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 0.5 }}
              >
                Secret Token
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2 }}
              >
                Configure a secret token for secure server access.
              </Typography>

              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500 }}
                >
                  Secret
                </Typography>
                <FormControl
                  fullWidth
                  size="small"
                >
                  <Select
                    value={formData.secret}
                    onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="bearer">Bearer Token</MenuItem>
                    <MenuItem value="api_key">API Key</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            {/* HTTP Headers */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.grey[500], 0.02),
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    HTTP Headers
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary' }}
                  >
                    Add custom headers for additional configuration or authentication.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={handleAddHeader}
                  sx={{ textTransform: 'none' }}
                >
                  Add header
                </Button>
              </Box>

              {formData.headers.length > 0 && (
                <Stack spacing={1}>
                  {formData.headers.map((header, index) => (
                    <Box
                      key={index}
                      sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                    >
                      <TextField
                        size="small"
                        placeholder="Header name"
                        value={header.key}
                        onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        size="small"
                        placeholder="Header value"
                        value={header.value}
                        onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveHeader(index)}
                        sx={{ color: 'error.main' }}
                      >
                        <Iconify icon="eva:close-outline" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* Tool Approval Mode */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.grey[500], 0.02),
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 0.5 }}
              >
                Tool Approval Mode
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2 }}
              >
                Control how the agent requests permission to use tools from this MCP server.
              </Typography>

              <RadioGroup
                value={formData.approvalMode}
                onChange={(e) => setFormData({ ...formData, approvalMode: e.target.value })}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    border: `2px solid ${formData.approvalMode === 'always_ask' ? theme.palette.primary.main : theme.palette.divider}`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setFormData({ ...formData, approvalMode: 'always_ask' })}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon="eva:shield-outline" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          Always Ask
                        </Typography>
                        <Chip
                          label="Recommended"
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.625rem',
                            bgcolor: alpha(theme.palette.success.main, 0.12),
                            color: 'success.main',
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
                      >
                        Maximum security. The agent will request your permission before each tool
                        use.
                      </Typography>
                    </Box>
                    <Radio
                      value="always_ask"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  </Box>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    border: `2px solid ${formData.approvalMode === 'fine_grained' ? theme.palette.primary.main : theme.palette.divider}`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setFormData({ ...formData, approvalMode: 'fine_grained' })}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon="eva:options-2-outline" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        Fine-Grained Tool Approval
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
                      >
                        Disable & pre-select tools which can run automatically & those requiring
                        approval.
                      </Typography>
                    </Box>
                    <Radio
                      value="fine_grained"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  </Box>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: `2px solid ${formData.approvalMode === 'auto_approve_all' ? theme.palette.primary.main : theme.palette.divider}`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setFormData({ ...formData, approvalMode: 'auto_approve_all' })}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon="eva:checkmark-circle-2-fill" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        Auto Approve All
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
                      >
                        The assistant can use any tool without approval.
                      </Typography>
                    </Box>
                    <Radio
                      value="auto_approve_all"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  </Box>
                </Paper>
              </RadioGroup>
            </Paper>

            {/* Tool Settings */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.grey[500], 0.02),
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 0.5 }}
              >
                Tool Settings
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2 }}
              >
                Configure settings for all tools from this server.
              </Typography>

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.forcePreToolSpeech}
                      onChange={(e) => setFormData({ ...formData, forcePreToolSpeech: e.target.checked })}
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500 }}
                      >
                        Force Pre-tool Speech
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        By default the agent will speak if recent execution times are long but you
                        can force it to speak before every tool execution.
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.disableInterruptions}
                      onChange={(e) => setFormData({ ...formData, disableInterruptions: e.target.checked })}
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500 }}
                      >
                        Disable Interruptions
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        Disable user interruptions while tools are being called.
                      </Typography>
                    </Box>
                  }
                />

                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: 500 }}
                  >
                    Execution mode
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                  >
                    Determines when and how the tool executes relative to agent speech.
                  </Typography>
                  <FormControl
                    fullWidth
                    size="small"
                  >
                    <Select
                      value={formData.executionMode}
                      onChange={(e) => setFormData({ ...formData, executionMode: e.target.value })}
                    >
                      <MenuItem value="immediate">Immediate</MenuItem>
                      <MenuItem value="after_speech">After Speech</MenuItem>
                      <MenuItem value="parallel">Parallel</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        )}
      </Box>

      {/* Footer - only show when creating new or on Overview tab */}
      {(!editingServer || activeTab === 0) && (
        <Box
          sx={{
            p: 3,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
          }}
        >
          <Button
            onClick={onClose}
            sx={{ textTransform: 'none', px: 3 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isFormValid || isLoading}
            sx={{ textTransform: 'none', px: 3 }}
          >
            {isLoading ? 'Saving...' : editingServer ? 'Save Changes' : 'Add Server'}
          </Button>
        </Box>
      )}
    </Drawer>
  );
}

CreateMCPDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editingServer: PropTypes.object,
  agentId: PropTypes.string,
};

export default CreateMCPDrawer;
