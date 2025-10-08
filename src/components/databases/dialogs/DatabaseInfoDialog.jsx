import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { updateBaseById, exportDatabaseToCSV, exportDatabaseToSQL } from '../../../redux/slices/bases';
import Iconify from '../../iconify';
import EditTableDrawer from '../table/EditTableDrawer';

// Custom Table Node Component
const TableNode = ({ data }) => {
  const theme = useTheme();
  const fields = data.fields || [];
  const displayFields = fields.slice(0, 5);

  return (
    <Box
      sx={{
        minWidth: 280,
        borderRadius: 3,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.95)} 0%, 
          ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1.5px solid ${alpha(theme.palette.divider, 0.15)}`,
        overflow: 'hidden',
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 48px ${alpha(theme.palette.primary.main, 0.2)}`,
          border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        },
      }}
    >
      {/* Table Header */}
      <Box
        sx={{
          p: 2,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.15)} 0%, 
            ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
        >
          <Iconify
            icon="mdi:table"
            sx={{
              width: 24,
              height: 24,
              color: theme.palette.primary.main,
            }}
          />
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            {data.label}
          </Typography>
        </Stack>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            mt: 0.5,
            display: 'block',
          }}
        >
          {fields.length} {fields.length === 1 ? 'field' : 'fields'}
        </Typography>
      </Box>

      {/* Fields List */}
      <Box sx={{ p: 1.5 }}>
        {displayFields.map((field, index) => {
          const fieldIcon = field.is_identity
            ? '🔑'
            : field.data_type?.includes('timestamp')
              ? '📅'
              : field.data_type?.includes('text')
                ? '📝'
                : field.data_type?.includes('int') || field.data_type?.includes('numeric')
                  ? '🔢'
                  : field.data_type?.includes('bool')
                    ? '☑️'
                    : '•';

          return (
            <Box
              key={field.id || index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1,
                px: 1.5,
                borderRadius: 2,
                mb: 0.5,
                backgroundColor: alpha(theme.palette.background.neutral, 0.3),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ flex: 1, minWidth: 0 }}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  {fieldIcon}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: field.is_identity ? 600 : 400,
                    color: theme.palette.text.primary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {field.name}
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  ml: 1,
                  flexShrink: 0,
                }}
              >
                {field.data_type?.substring(0, 10)}
              </Typography>
            </Box>
          );
        })}

        {fields.length > 5 && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: theme.palette.primary.main,
              fontWeight: 600,
              mt: 1,
              py: 0.5,
            }}
          >
            +{fields.length - 5} more {fields.length - 5 === 1 ? 'field' : 'fields'}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

TableNode.propTypes = {
  data: PropTypes.object.isRequired,
};

const nodeTypes = {
  table: TableNode,
};

function DatabaseInfoDialog({ open, onClose, database, onDatabaseUpdate, baseId }) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [viewMode, setViewMode] = useState('schema'); // 'schema' or 'details'
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);
  const [editTableDrawerOpen, setEditTableDrawerOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionExpanded, setConnectionExpanded] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Initialize form values when dialog opens or database changes
  useEffect(() => {
    if (database) {
      setEditedName(database.name || '');
      setEditedDescription(database.description || '');
    }
  }, [database]);

  const handleCopyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${label} copied to clipboard!`);
    } catch {
      setError(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const handleSave = async () => {
    if (!database?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const updates = {
        name: editedName.trim(),
        description: editedDescription.trim(),
      };

      await dispatch(updateBaseById(database.id, updates));

      // Call the callback to update parent component
      if (onDatabaseUpdate) {
        onDatabaseUpdate({ ...database, ...updates });
      }

      setEditMode(false);
    } catch (error) {
      setError(error.message || 'Failed to update database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedName(database?.name || '');
    setEditedDescription(database?.description || '');
    setEditMode(false);
    setError(null);
  };

  const handleClose = () => {
    handleCancel();
    onClose();
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setEditTableDrawerOpen(true);
    onClose(); // Close the database info dialog when opening table editor
  };

  const handleCloseEditTableDrawer = () => {
    setEditTableDrawerOpen(false);
    setSelectedTable(null);
  };

  const handleExportDatabase = async () => {
    if (!database?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Export entire database (all tables to ZIP)
      const blob = await dispatch(exportDatabaseToCSV(database.id));

      // Create a download link and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `${database.name || 'database'}_export_${new Date().toISOString().split('T')[0]}.zip`,
      );
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);

      setCopySuccess('Database exported successfully!');
    } catch (exportError) {
      setError(exportError.message || 'Failed to export database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportDatabaseSQL = async () => {
    if (!database?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Export database schema as SQL dump
      const blob = await dispatch(exportDatabaseToSQL(database.id, false)); // false = schema only

      // Create a download link and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `${database.name || 'database'}_schema_${new Date().toISOString().split('T')[0]}.sql`,
      );
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);

      setCopySuccess('Database schema exported successfully!');
    } catch (exportError) {
      setError(exportError.message || 'Failed to export database schema');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate nodes and edges for React Flow
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!database?.tables?.items) return { flowNodes: [], flowEdges: [] };

    const tables = database.tables.items;
    const cols = Math.ceil(Math.sqrt(tables.length));
    const spacingX = 400;
    const spacingY = 350;

    // Create nodes for each table
    const flowNodes = tables.map((table, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      return {
        id: String(table.id),
        type: 'table',
        position: { x: col * spacingX, y: row * spacingY },
        data: {
          label: table.name,
          fields: table.fields?.items || [],
          onClick: () => handleTableClick(table),
        },
      };
    });

    // Create edges for relationships
    const flowEdges = [];
    tables.forEach((table) => {
      if (table.relationships && Array.isArray(table.relationships)) {
        table.relationships.forEach((rel, index) => {
          const targetTable = tables.find(
            (t) => t.name === rel.target_table_name || t.id === rel.target_table_id
          );
          if (targetTable) {
            flowEdges.push({
              id: `e${table.id}-${targetTable.id}-${index}`,
              source: String(table.id),
              target: String(targetTable.id),
              type: 'smoothstep',
              animated: true,
              style: {
                stroke: alpha(theme.palette.primary.main, 0.4),
                strokeWidth: 2,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: alpha(theme.palette.primary.main, 0.4),
                width: 20,
                height: 20,
              },
              label: rel.constraint_name || rel.source_column_name,
              labelStyle: {
                fill: theme.palette.text.secondary,
                fontSize: 11,
                fontWeight: 500,
              },
              labelBgStyle: {
                fill: alpha(theme.palette.background.paper, 0.9),
                fillOpacity: 0.9,
              },
              labelBgPadding: [8, 4],
              labelBgBorderRadius: 4,
            });
          }
        });
      }
    });

    return { flowNodes, flowEdges };
  }, [database, theme]);

  // Update nodes and edges when they change
  useEffect(() => {
    if (viewMode === 'schema' && open) {
      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [flowNodes, flowEdges, viewMode, open, setNodes, setEdges]);

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    if (node.data.onClick) {
      node.data.onClick();
    }
  }, []);

  if (!database) return null;

  const tableCount = database.tables?.items?.length || 0;
  const createdDate = database.date_creation
    ? new Date(database.date_creation).toLocaleDateString()
    : 'Unknown';

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        fullScreen
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.default, 0.98)} 0%, 
              ${alpha(theme.palette.background.default, 0.95)} 100%)`,
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >
            <Iconify
              icon="mdi:database"
              sx={{
                width: 28,
                height: 28,
                color: theme.palette.primary.main,
              }}
            />
            <Box>
              <Typography variant="h5">{database.name || 'Unnamed Database'}</Typography>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {tableCount} {tableCount === 1 ? 'table' : 'tables'} • Created {createdDate}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: 2,
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  },
                },
              }}
            >
              <ToggleButton value="schema">
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Iconify
                    icon="mdi:graphql"
                    sx={{ width: 18, height: 18 }}
                  />
                  <Typography variant="body2">Schema</Typography>
                </Stack>
              </ToggleButton>
              <ToggleButton value="details">
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Iconify
                    icon="mdi:format-list-bulleted"
                    sx={{ width: 18, height: 18 }}
                  />
                  <Typography variant="body2">Details</Typography>
                </Stack>
              </ToggleButton>
            </ToggleButtonGroup>

            <IconButton
              onClick={handleClose}
              size="medium"
              sx={{
                color: theme.palette.text.secondary,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.12),
                  color: theme.palette.error.main,
                },
              }}
            >
              <Iconify
                icon="mdi:close"
                sx={{ width: 24, height: 24 }}
              />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2, px: 3, height: 'calc(100vh - 180px)' }}>
          {viewMode === 'schema' ? (
            /* Schema Visualization View with React Flow */
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {tableCount > 0 ? (
                <Box
                  sx={{
                    flex: 1,
                    position: 'relative',
                  }}
                >
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{
                      padding: 0.2,
                      includeHiddenNodes: false,
                    }}
                    minZoom={0.1}
                    maxZoom={1.5}
                    defaultEdgeOptions={{
                      animated: true,
                    }}
                    proOptions={{ hideAttribution: true }}
                    style={{
                      background: 'transparent',
                    }}
                  >
                    <Background
                      gap={20}
                      size={1}
                      color={alpha(theme.palette.divider, 0.1)}
                    />
                    <Controls
                      showInteractive={false}
                      style={{
                        background: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        borderRadius: '12px',
                        padding: '8px',
                      }}
                    />
                    <MiniMap
                      nodeColor={(node) => alpha(theme.palette.primary.main, 0.6)}
                      maskColor={alpha(theme.palette.background.paper, 0.8)}
                      style={{
                        background: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        borderRadius: '12px',
                      }}
                    />
                  </ReactFlow>
                </Box>
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Iconify
                    icon="mdi:table-off"
                    sx={{
                      width: 64,
                      height: 64,
                      color: theme.palette.text.secondary,
                      opacity: 0.5,
                    }}
                  />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                  >
                    No tables in this database
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Create your first table to see the schema visualization
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            /* Details View */
            <Stack spacing={3}>
            {/* Database ID & Tenant ID */}
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Database ID
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.neutral, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  mb: 2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    flex: 1,
                    wordBreak: 'break-all',
                  }}
                >
                  {database.id}
                </Typography>
                <Tooltip title="Copy Database ID">
                  <IconButton
                    size="small"
                    onClick={() => handleCopyToClipboard(database.id, 'Database ID')}
                    sx={{
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Iconify
                      icon="mdi:content-copy"
                      sx={{ width: 16, height: 16 }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>

              {database.tenant && (
                <>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Tenant
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.info.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        flex: 1,
                        wordBreak: 'break-all',
                        color: theme.palette.info.main,
                        fontWeight: 500,
                      }}
                    >
                      {database.tenant}
                    </Typography>
                    <Tooltip title="Copy Tenant">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyToClipboard(database.tenant, 'Tenant')}
                        sx={{
                          color: theme.palette.info.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.info.main, 0.15),
                          },
                        }}
                      >
                        <Iconify
                          icon="mdi:content-copy"
                          sx={{ width: 16, height: 16 }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </>
              )}
            </Box>

            <Divider />

            {/* Connection Information */}
            {database.connection && (
              <>
                <Accordion
                  expanded={connectionExpanded}
                  onChange={() => setConnectionExpanded(!connectionExpanded)}
                  elevation={0}
                  sx={{
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.success.main, 0.05)} 0%, 
                      ${alpha(theme.palette.success.main, 0.02)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
                    borderRadius: '12px !important',
                    '&:before': {
                      display: 'none',
                    },
                    '& .MuiAccordionSummary-root': {
                      borderRadius: '12px',
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <Iconify
                        icon="mdi:chevron-down"
                        sx={{
                          color: theme.palette.success.main,
                          width: 24,
                          height: 24,
                        }}
                      />
                    }
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                    >
                      <Iconify
                        icon="mdi:connection"
                        sx={{
                          width: 22,
                          height: 22,
                          color: theme.palette.success.main,
                        }}
                      />
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                          }}
                        >
                          Connection Details
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Database connection configuration
                        </Typography>
                      </Box>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {/* Connection String */}
                      {database.connection_string && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                          >
                            Connection String
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 1.5,
                              borderRadius: 2,
                              backgroundColor: alpha(theme.palette.background.neutral, 0.5),
                              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                flex: 1,
                                wordBreak: 'break-all',
                                color: theme.palette.success.main,
                              }}
                            >
                              {database.connection_string}
                            </Typography>
                            <Tooltip title="Copy Connection String">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleCopyToClipboard(
                                    database.connection_string,
                                    'Connection String',
                                  )
                                }
                                sx={{
                                  color: theme.palette.text.secondary,
                                  flexShrink: 0,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.success.main, 0.08),
                                    color: theme.palette.success.main,
                                  },
                                }}
                              >
                                <Iconify
                                  icon="mdi:content-copy"
                                  sx={{ width: 16, height: 16 }}
                                />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      )}

                      {/* Connection Parameters Grid */}
                      <Grid
                        container
                        spacing={2}
                      >
                        {/* Host */}
                        {database.connection.host && (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                            >
                              Host
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.25,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.background.neutral, 0.3),
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '12px',
                                  flex: 1,
                                }}
                              >
                                {database.connection.host}
                              </Typography>
                              <Tooltip title="Copy Host">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleCopyToClipboard(database.connection.host, 'Host')
                                  }
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    '&:hover': {
                                      color: theme.palette.primary.main,
                                    },
                                  }}
                                >
                                  <Iconify
                                    icon="mdi:content-copy"
                                    sx={{ width: 14, height: 14 }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Grid>
                        )}

                        {/* Port */}
                        {database.connection.port && (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                            >
                              Port
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.25,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.background.neutral, 0.3),
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '12px',
                                  flex: 1,
                                }}
                              >
                                {database.connection.port}
                              </Typography>
                              <Tooltip title="Copy Port">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleCopyToClipboard(
                                      String(database.connection.port),
                                      'Port',
                                    )
                                  }
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    '&:hover': {
                                      color: theme.palette.primary.main,
                                    },
                                  }}
                                >
                                  <Iconify
                                    icon="mdi:content-copy"
                                    sx={{ width: 14, height: 14 }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Grid>
                        )}

                        {/* Database */}
                        {database.connection.database && (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                            >
                              Database
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.25,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.background.neutral, 0.3),
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '12px',
                                  flex: 1,
                                }}
                              >
                                {database.connection.database}
                              </Typography>
                              <Tooltip title="Copy Database">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleCopyToClipboard(
                                      database.connection.database,
                                      'Database',
                                    )
                                  }
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    '&:hover': {
                                      color: theme.palette.primary.main,
                                    },
                                  }}
                                >
                                  <Iconify
                                    icon="mdi:content-copy"
                                    sx={{ width: 14, height: 14 }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Grid>
                        )}

                        {/* Schema */}
                        {database.connection.schema && (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                            >
                              Schema
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.25,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.background.neutral, 0.3),
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '12px',
                                  flex: 1,
                                  wordBreak: 'break-all',
                                }}
                              >
                                {database.connection.schema}
                              </Typography>
                              <Tooltip title="Copy Schema">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleCopyToClipboard(database.connection.schema, 'Schema')
                                  }
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    '&:hover': {
                                      color: theme.palette.primary.main,
                                    },
                                  }}
                                >
                                  <Iconify
                                    icon="mdi:content-copy"
                                    sx={{ width: 14, height: 14 }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Grid>
                        )}

                        {/* User */}
                        {database.connection.user && (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                            >
                              User
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.25,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.background.neutral, 0.3),
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '12px',
                                  flex: 1,
                                  wordBreak: 'break-all',
                                }}
                              >
                                {database.connection.user}
                              </Typography>
                              <Tooltip title="Copy User">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleCopyToClipboard(database.connection.user, 'User')
                                  }
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    '&:hover': {
                                      color: theme.palette.primary.main,
                                    },
                                  }}
                                >
                                  <Iconify
                                    icon="mdi:content-copy"
                                    sx={{ width: 14, height: 14 }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Grid>
                        )}

                        {/* Password */}
                        {database.connection.password && (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                            >
                              Password
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.25,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.warning.main, 0.08),
                                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '12px',
                                  flex: 1,
                                  color: theme.palette.warning.main,
                                  letterSpacing: showPassword ? 'normal' : '2px',
                                }}
                              >
                                {showPassword ? database.connection.password : '••••••••••••'}
                              </Typography>
                              <Tooltip title={showPassword ? 'Hide Password' : 'Show Password'}>
                                <IconButton
                                  size="small"
                                  onClick={() => setShowPassword(!showPassword)}
                                  sx={{
                                    color: theme.palette.warning.main,
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.warning.main, 0.15),
                                    },
                                  }}
                                >
                                  <Iconify
                                    icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'}
                                    sx={{ width: 14, height: 14 }}
                                  />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Copy Password">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleCopyToClipboard(
                                      database.connection.password,
                                      'Password',
                                    )
                                  }
                                  sx={{
                                    color: theme.palette.warning.main,
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.warning.main, 0.15),
                                    },
                                  }}
                                >
                                  <Iconify
                                    icon="mdi:content-copy"
                                    sx={{ width: 14, height: 14 }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Grid>
                        )}

                        {/* SSL */}
                        {database.connection.ssl !== undefined && (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                            >
                              SSL Enabled
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.25,
                                borderRadius: 2,
                                backgroundColor: alpha(
                                  database.connection.ssl
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                                  0.08,
                                ),
                                border: `1px solid ${alpha(
                                  database.connection.ssl
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                                  0.2,
                                )}`,
                              }}
                            >
                              <Chip
                                label={database.connection.ssl ? 'Enabled' : 'Disabled'}
                                size="small"
                                icon={
                                  <Iconify
                                    icon={
                                      database.connection.ssl ? 'mdi:check-circle' : 'mdi:close-circle'
                                    }
                                    sx={{ width: 16, height: 16 }}
                                  />
                                }
                                sx={{
                                  backgroundColor: 'transparent',
                                  color: database.connection.ssl
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                                  fontWeight: 600,
                                  border: 'none',
                                }}
                              />
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                <Divider />
              </>
            )}

            {/* Database Name */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                >
                  Name
                </Typography>
                {!editMode && (
                  <Tooltip title="Edit name">
                    <IconButton
                      size="small"
                      onClick={() => setEditMode(true)}
                      sx={{
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      <Iconify
                        icon="mdi:pencil"
                        sx={{ width: 16, height: 16 }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>

              {editMode ? (
                <TextField
                  fullWidth
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter database name"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              ) : (
                <Typography variant="body1">{database.name || 'Unnamed Database'}</Typography>
              )}
            </Box>

            <Divider />

            {/* Tables List */}
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Tables ({tableCount})
              </Typography>
              {tableCount > 0 ? (
                <List
                  sx={{
                    bgcolor: alpha(theme.palette.background.neutral, 0.3),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {database.tables.items.map((table, index) => (
                    <ListItem
                      key={table.id}
                      disablePadding
                    >
                      <ListItemButton
                        onClick={() => handleTableClick(table)}
                        sx={{
                          borderRadius:
                            index === 0
                              ? '8px 8px 0 0'
                              : index === tableCount - 1
                                ? '0 0 8px 8px'
                                : 0,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Iconify
                            icon="mdi:table"
                            sx={{
                              width: 20,
                              height: 20,
                              color: theme.palette.primary.main,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={table.name || `Table ${index + 1}`}
                          secondary={
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ID: {table.system_field_config?.id_type || 'UUID'}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                •
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {table.fields?.items?.length || 0} fields
                              </Typography>
                            </Stack>
                          }
                        />
                        <Iconify
                          icon="mdi:chevron-right"
                          sx={{
                            width: 16,
                            height: 16,
                            color: theme.palette.text.secondary,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.background.neutral, 0.3),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Iconify
                    icon="mdi:table-off"
                    sx={{
                      width: 32,
                      height: 32,
                      color: theme.palette.text.secondary,
                      mb: 1,
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    No tables in this database
                  </Typography>
                </Box>
              )}
            </Box>

              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError(null)}
                  sx={{ borderRadius: 3 }}
                >
                  {error}
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
          {editMode ? (
            <>
              <Box />
              <Stack
                direction="row"
                spacing={1}
              >
                <Button
                  onClick={handleCancel}
                  disabled={isLoading}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="contained"
                  disabled={isLoading || !editedName.trim()}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.24)}`,
                    },
                  }}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Stack
                direction="row"
                spacing={1}
              >
                <Button
                  onClick={handleExportDatabase}
                  disabled={isLoading || !tableCount}
                  startIcon={
                    <Iconify
                      icon="mdi:file-delimited"
                      sx={{ width: 18, height: 18 }}
                    />
                  }
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    color: theme.palette.info.main,
                    borderColor: alpha(theme.palette.info.main, 0.5),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.info.main, 0.08),
                      borderColor: theme.palette.info.main,
                    },
                  }}
                  variant="outlined"
                >
                  {isLoading ? 'Exporting...' : 'Export as CSV'}
                </Button>
                <Button
                  onClick={handleExportDatabaseSQL}
                  disabled={isLoading || !tableCount}
                  startIcon={
                    <Iconify
                      icon="mdi:database-export"
                      sx={{ width: 18, height: 18 }}
                    />
                  }
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    color: theme.palette.success.main,
                    borderColor: alpha(theme.palette.success.main, 0.5),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.success.main, 0.08),
                      borderColor: theme.palette.success.main,
                    },
                  }}
                  variant="outlined"
                >
                  {isLoading ? 'Exporting...' : 'Export as SQL'}
                </Button>
              </Stack>
              <Button
                onClick={handleClose}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Close
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={!!copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setCopySuccess(false)}
          severity="success"
          sx={{ borderRadius: 2 }}
        >
          {copySuccess}
        </Alert>
      </Snackbar>

      {/* Edit Table Drawer */}
      {selectedTable && (
        <EditTableDrawer
          baseId={database.id}
          tableId={selectedTable.id}
          table={selectedTable}
          open={editTableDrawerOpen}
          onClose={handleCloseEditTableDrawer}
        />
      )}
    </>
  );
}

DatabaseInfoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  database: PropTypes.object,
  onDatabaseUpdate: PropTypes.func,
  baseId: PropTypes.string,
};

export default DatabaseInfoDialog;
