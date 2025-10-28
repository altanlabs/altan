import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Tooltip,
  Skeleton,
  useTheme,
  Collapse,
  Chip,
  Divider,
  Checkbox,
  ButtonGroup,
  TextField,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Virtuoso } from 'react-virtuoso';

import { discoverMCPServerTools, configureMCPServerTools } from '../../../../redux/slices/mcp';
import Iconify from '../../../iconify';

function MCPToolsTab({ serverId, serverApprovalMode, existingToolPolicies }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [discovering, setDiscovering] = useState(false);
  const [savingTool, setSavingTool] = useState(null);
  const [discoveryData, setDiscoveryData] = useState(null);
  const [tools, setTools] = useState([]);
  const [error, setError] = useState(null);
  const [expandedTool, setExpandedTool] = useState(null);
  const [selectedTools, setSelectedTools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDiscoverTools = async () => {
    if (!serverId) return;

    setDiscovering(true);
    setError(null);
    try {
      const data = await dispatch(discoverMCPServerTools(serverId));
      setDiscoveryData(data);

      // Apply server's overall approval mode to tools
      const discoveredTools = data.discovered_tools || [];
      const toolsWithPolicy = discoveredTools.map((tool) => {
        // Check if there's an existing policy for this tool
        const existingPolicy = existingToolPolicies?.[tool.name];

        return {
          ...tool,
          suggested_approval_policy: existingPolicy
            ? existingPolicy
            : serverApprovalMode === 'auto_approve_all'
              ? 'auto_approved'
              : serverApprovalMode === 'always_ask'
                ? 'requires_approval'
                : serverApprovalMode === 'fine_grained'
                  ? tool.suggested_approval_policy || 'requires_approval'
                  : 'requires_approval',
        };
      });

      setTools(toolsWithPolicy);
    } catch (err) {
      setError(err);
    } finally {
      setDiscovering(false);
    }
  };

  // Discover tools when tab loads
  useEffect(() => {
    if (serverId) {
      handleDiscoverTools();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId, existingToolPolicies]);

  const handleApprovalChange = async (toolName, newApproval) => {
    // Update local state
    setTools((prev) =>
      prev.map((tool) =>
        tool.name === toolName ? { ...tool, suggested_approval_policy: newApproval } : tool,
      ),
    );

    // Auto-save the configuration
    if (!serverId) return;

    setSavingTool(toolName);
    try {
      // Build tool configs with the new approval
      const toolConfigs = tools.map((tool) => ({
        tool_name: tool.name,
        approval_policy: tool.name === toolName ? newApproval : tool.suggested_approval_policy,
      }));

      await dispatch(configureMCPServerTools(serverId, toolConfigs));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save tool configuration:', err);
    } finally {
      setSavingTool(null);
    }
  };

  const handleBulkApprovalChange = async (newApproval, toolNames = null) => {
    const targetTools = toolNames || selectedTools;
    if (targetTools.length === 0) return;

    // Update local state
    setTools((prev) =>
      prev.map((tool) =>
        targetTools.includes(tool.name) ? { ...tool, suggested_approval_policy: newApproval } : tool,
      ),
    );

    // Auto-save the configuration
    if (!serverId) return;

    setSavingTool('bulk');
    try {
      // Build tool configs with the new approval
      const toolConfigs = tools.map((tool) => ({
        tool_name: tool.name,
        approval_policy: targetTools.includes(tool.name) ? newApproval : tool.suggested_approval_policy,
      }));

      await dispatch(configureMCPServerTools(serverId, toolConfigs));
      
      // Clear selection after successful bulk operation
      setSelectedTools([]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save bulk tool configuration:', err);
    } finally {
      setSavingTool(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedTools.length === tools.length) {
      setSelectedTools([]);
    } else {
      setSelectedTools(tools.map((tool) => tool.name));
    }
  };

  const handleToggleToolSelection = (toolName) => {
    setSelectedTools((prev) =>
      prev.includes(toolName) ? prev.filter((name) => name !== toolName) : [...prev, toolName],
    );
  };

  // Filter tools based on search query
  const filteredTools = tools.filter((tool) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      tool.name.toLowerCase().includes(query) ||
      tool.description?.toLowerCase().includes(query)
    );
  });

  const getApprovalLabel = (policy) => {
    switch (policy) {
      case 'disabled':
        return 'Disabled';
      case 'auto_approved':
        return 'Auto Approved';
      case 'requires_approval':
        return 'Requires Approval';
      default:
        return policy;
    }
  };

  const toggleToolExpansion = (toolName) => {
    setExpandedTool((prev) => (prev === toolName ? null : toolName));
  };

  const renderParameterType = (param) => {
    if (param.type === 'object' && param.properties) {
      return 'object';
    }
    if (param.type === 'array' && param.items) {
      return `array<${param.items.type || 'any'}>`;
    }
    return param.type || 'any';
  };

  if (discovering) {
    return (
      <Box>
        <Stack spacing={2}>
          {/* Header skeleton */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Skeleton
                variant="text"
                width={150}
                height={28}
              />
              <Skeleton
                variant="text"
                width={100}
                height={20}
              />
            </Box>
            <Skeleton
              variant="circular"
              width={32}
              height={32}
            />
          </Box>

          {/* Tool skeletons */}
          {[1, 2, 3, 4].map((i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1.5,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Skeleton
                  variant="rounded"
                  width={32}
                  height={32}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={24}
                  />
                  <Skeleton
                    variant="text"
                    width="90%"
                    height={20}
                  />
                </Box>
                <Skeleton
                  variant="rounded"
                  width={140}
                  height={36}
                />
              </Box>
            </Paper>
          ))}
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              size="small"
              onClick={handleDiscoverTools}
            >
              Retry
            </Button>
          }
        >
          Failed to discover tools: {error}
        </Alert>
      </Box>
    );
  }

  if (!discoveryData) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="info">
          <Typography variant="body2">
            Click &quot;Discover Tools&quot; to fetch available tools from this MCP server.
          </Typography>
        </Alert>
        <Button
          variant="contained"
          onClick={handleDiscoverTools}
          sx={{ mt: 2 }}
        >
          Discover Tools
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={2}>
        {/* Header with refresh */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {serverApprovalMode === 'fine_grained' && tools.length > 0 && (
              <Tooltip title={selectedTools.length === tools.length ? 'Deselect all' : 'Select all'}>
                <Checkbox
                  size="small"
                  checked={selectedTools.length === tools.length && tools.length > 0}
                  indeterminate={selectedTools.length > 0 && selectedTools.length < tools.length}
                  onChange={handleSelectAll}
                />
              </Tooltip>
            )}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600 }}
              >
                Available tools
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary' }}
              >
                {filteredTools.length} / {tools.length} tool{tools.length !== 1 ? 's' : ''}
                {searchQuery && ' (filtered)'}
                {selectedTools.length > 0 && ` • ${selectedTools.length} selected`}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Refresh tools">
            <IconButton
              size="small"
              onClick={handleDiscoverTools}
              disabled={discovering}
            >
              <Iconify icon="eva:refresh-outline" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Bulk Actions Bar */}
        {serverApprovalMode === 'fine_grained' && selectedTools.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''} selected
            </Typography>
            <Box sx={{ flex: 1 }} />
            <ButtonGroup
              size="small"
              variant="outlined"
            >
              <Button
                onClick={() => handleBulkApprovalChange('auto_approved')}
                disabled={savingTool === 'bulk'}
                startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                sx={{
                  borderColor: alpha(theme.palette.success.main, 0.48),
                  color: 'success.main',
                  '&:hover': {
                    borderColor: 'success.main',
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                  },
                }}
              >
                Auto Approve
              </Button>
              <Button
                onClick={() => handleBulkApprovalChange('requires_approval')}
                disabled={savingTool === 'bulk'}
                startIcon={<Iconify icon="eva:shield-outline" />}
                sx={{
                  borderColor: alpha(theme.palette.warning.main, 0.48),
                  color: 'warning.main',
                  '&:hover': {
                    borderColor: 'warning.main',
                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                  },
                }}
              >
                Require Approval
              </Button>
              <Button
                onClick={() => handleBulkApprovalChange('disabled')}
                disabled={savingTool === 'bulk'}
                startIcon={<Iconify icon="eva:close-circle-outline" />}
                sx={{
                  borderColor: alpha(theme.palette.text.disabled, 0.48),
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: theme.palette.text.disabled,
                    bgcolor: alpha(theme.palette.text.disabled, 0.08),
                  },
                }}
              >
                Disable
              </Button>
            </ButtonGroup>
            {savingTool === 'bulk' && (
              <CircularProgress
                size={20}
                sx={{ color: 'primary.main' }}
              />
            )}
            <IconButton
              size="small"
              onClick={() => setSelectedTools([])}
              sx={{ ml: 1 }}
            >
              <Iconify icon="eva:close-outline" />
            </IconButton>
          </Paper>
        )}

        {/* Quick Actions (when no selection) */}
        {serverApprovalMode === 'fine_grained' && tools.length > 0 && selectedTools.length === 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', alignSelf: 'center', mr: 1 }}
            >
              Quick actions for all tools:
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleBulkApprovalChange('auto_approved', tools.map((t) => t.name))}
              disabled={savingTool === 'bulk'}
              startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
              sx={{ fontSize: '0.75rem' }}
            >
              Auto Approve All
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleBulkApprovalChange('requires_approval', tools.map((t) => t.name))}
              disabled={savingTool === 'bulk'}
              startIcon={<Iconify icon="eva:shield-outline" />}
              sx={{ fontSize: '0.75rem' }}
            >
              Require Approval All
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleBulkApprovalChange('disabled', tools.map((t) => t.name))}
              disabled={savingTool === 'bulk'}
              startIcon={<Iconify icon="eva:close-circle-outline" />}
              sx={{ fontSize: '0.75rem' }}
            >
              Disable All
            </Button>
          </Box>
        )}

        {/* Search Field */}
        {tools.length > 0 && (
          <TextField
            fullWidth
            size="small"
            placeholder="Search tools by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify
                    icon="eva:search-outline"
                    sx={{ color: 'text.secondary' }}
                  />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    edge="end"
                  >
                    <Iconify
                      icon="eva:close-outline"
                      sx={{ fontSize: '1.25rem' }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: alpha(theme.palette.background.paper, 0.8),
              },
            }}
          />
        )}

        {/* Tools List */}
        {tools.length === 0 ? (
          <Alert severity="warning">
            No tools discovered from this server. The server may be offline or using a different
            protocol.
          </Alert>
        ) : filteredTools.length === 0 ? (
          <Alert severity="info">
            No tools match your search query. Try a different search term.
          </Alert>
        ) : (
          <Box sx={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
            <Virtuoso
              style={{ height: '100%' }}
              data={filteredTools}
              itemContent={(index, tool) => (
              <Paper
                key={tool.name}
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1.5,
                  bgcolor: theme.palette.background.paper,
                  opacity: tool.suggested_approval_policy === 'disabled' ? 0.5 : 1,
                  transition: 'all 0.2s',
                  overflow: 'hidden',
                  mb: 1,
                  ...(selectedTools.includes(tool.name) && {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }),
                }}
              >
                <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {/* Selection Checkbox (only in fine-grained mode) */}
                  {serverApprovalMode === 'fine_grained' && (
                    <Checkbox
                      size="small"
                      checked={selectedTools.includes(tool.name)}
                      onChange={() => handleToggleToolSelection(tool.name)}
                      sx={{ p: 0 }}
                    />
                  )}

                  {/* Info Toggle Icon */}
                  <Tooltip title={expandedTool === tool.name ? 'Hide details' : 'Show details'}>
                    <IconButton
                      size="small"
                      onClick={() => toggleToolExpansion(tool.name)}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        flexShrink: 0,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.16),
                        },
                      }}
                    >
                      <Iconify
                        icon={
                          expandedTool === tool.name
                            ? 'eva:arrow-ios-upward-outline'
                            : 'eva:info-outline'
                        }
                        sx={{ fontSize: '1rem', color: 'primary.main' }}
                      />
                    </IconButton>
                  </Tooltip>

                  {/* Tool Details */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                    >
                      {tool.name}
                    </Typography>
                  </Box>

                  {/* Approval Policy Display/Selector */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {serverApprovalMode === 'fine_grained' ? (
                      <>
                        <FormControl
                          size="small"
                          sx={{ minWidth: 140 }}
                        >
                          <Select
                            value={tool.suggested_approval_policy}
                            onChange={(e) => handleApprovalChange(tool.name, e.target.value)}
                            disabled={savingTool === tool.name}
                            sx={{ fontSize: '0.8125rem' }}
                          >
                            <MenuItem value="disabled">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Iconify
                                  icon="eva:close-circle-outline"
                                  sx={{ fontSize: '1rem', color: 'text.disabled' }}
                                />
                                Disabled
                              </Box>
                            </MenuItem>
                            <MenuItem value="auto_approved">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Iconify
                                  icon="eva:checkmark-circle-2-fill"
                                  sx={{ fontSize: '1rem', color: 'success.main' }}
                                />
                                Auto Approved
                              </Box>
                            </MenuItem>
                            <MenuItem value="requires_approval">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Iconify
                                  icon="eva:shield-outline"
                                  sx={{ fontSize: '1rem', color: 'warning.main' }}
                                />
                                Requires Approval
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>
                        {savingTool === tool.name && (
                          <CircularProgress
                            size={16}
                            sx={{ color: 'text.secondary' }}
                          />
                        )}
                      </>
                    ) : (
                      <Tooltip title={getApprovalLabel(tool.suggested_approval_policy)}>
                        <Box>
                          {tool.suggested_approval_policy === 'disabled' && (
                            <Iconify
                              icon="eva:close-circle-outline"
                              sx={{ fontSize: '1.25rem', color: 'text.disabled' }}
                            />
                          )}
                          {tool.suggested_approval_policy === 'auto_approved' && (
                            <Iconify
                              icon="eva:checkmark-circle-2-fill"
                              sx={{ fontSize: '1.25rem', color: 'success.main' }}
                            />
                          )}
                          {tool.suggested_approval_policy === 'requires_approval' && (
                            <Iconify
                              icon="eva:shield-outline"
                              sx={{ fontSize: '1.25rem', color: 'warning.main' }}
                            />
                          )}
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                {/* Expanded Details */}
                <Collapse
                  in={expandedTool === tool.name}
                  timeout="auto"
                >
                  <Divider />
                  <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    {/* Description */}
                    {tool.description && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}
                        >
                          Description
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          {tool.description}
                        </Typography>
                      </Box>
                    )}

                    {/* Input Schema */}
                    {tool.inputSchema && (
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}
                        >
                          Input Parameters
                        </Typography>

                        {tool.inputSchema.properties &&
                        Object.keys(tool.inputSchema.properties).length > 0 ? (
                          <Stack spacing={1}>
                            {Object.entries(tool.inputSchema.properties).map(([key, param]) => (
                              <Box
                                key={key}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1,
                                  bgcolor: theme.palette.background.paper,
                                  border: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, fontFamily: 'monospace' }}
                                  >
                                    {key}
                                  </Typography>
                                  <Chip
                                    label={renderParameterType(param)}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      bgcolor: alpha(theme.palette.info.main, 0.08),
                                      color: 'info.main',
                                    }}
                                  />
                                  {tool.inputSchema.required?.includes(key) && (
                                    <Chip
                                      label="required"
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: '0.65rem',
                                        bgcolor: alpha(theme.palette.error.main, 0.08),
                                        color: 'error.main',
                                      }}
                                    />
                                  )}
                                </Box>
                                {param.description && (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary', display: 'block' }}
                                  >
                                    {param.description}
                                  </Typography>
                                )}
                                {param.title && param.title !== key && (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary', display: 'block', fontStyle: 'italic' }}
                                  >
                                    Title: {param.title}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Stack>
                        ) : (
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                          >
                            No parameters required
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Paper>
              )}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
}

MCPToolsTab.propTypes = {
  serverId: PropTypes.string.isRequired,
  serverApprovalMode: PropTypes.string,
  existingToolPolicies: PropTypes.object,
};

export default MCPToolsTab;
