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
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { updateBaseById } from '../../../redux/slices/bases';
import Iconify from '../../iconify';
import EditTableDrawer from '../table/EditTableDrawer';

function DatabaseInfoDialog({ open, onClose, database, onDatabaseUpdate }) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);
  const [editTableDrawerOpen, setEditTableDrawerOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

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
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.95)} 0%, 
              ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <Iconify
              icon="mdi:database"
              sx={{
                width: 24,
                height: 24,
                color: theme.palette.primary.main,
              }}
            />
            <Typography variant="h6">Database Settings</Typography>
          </Stack>

          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.08),
                color: theme.palette.error.main,
              },
            }}
          >
            <Iconify
              icon="mdi:close"
              sx={{ width: 20, height: 20 }}
            />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1.5}>
            {/* Database ID */}
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
                <Tooltip title="Copy ID">
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
            </Box>

            <Divider />

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

            {/* Database Description */}
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Description
              </Typography>

              {editMode ? (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Enter database description"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {database.description || 'No description provided'}
                </Typography>
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
                sx={{ borderRadius: 2 }}
              >
                {error}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          {editMode ? (
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
          ) : (
            <Button
              onClick={handleClose}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Close
            </Button>
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
};

export default DatabaseInfoDialog;
