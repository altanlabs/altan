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
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { updateBaseById } from '../../../redux/slices/bases';
import Iconify from '../../iconify';

function DatabaseInfoDialog({ 
  open, 
  onClose, 
  database,
  onDatabaseUpdate 
}) {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (err) {
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
    } catch (err) {
      setError(err.message || 'Failed to update database');
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
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify
              icon="mdi:database"
              sx={{ 
                width: 24, 
                height: 24, 
                color: theme.palette.primary.main 
              }}
            />
            <Typography variant="h6">Database Information</Typography>
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
            <Iconify icon="mdi:close" sx={{ width: 20, height: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={3}>
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
                    <Iconify icon="mdi:content-copy" sx={{ width: 16, height: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider />

            {/* Database Name */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
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
                      <Iconify icon="mdi:pencil" sx={{ width: 16, height: 16 }} />
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
                <Typography variant="body1">
                  {database.name || 'Unnamed Database'}
                </Typography>
              )}
            </Box>

            {/* Database Description */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
                <Typography variant="body2" color="text.secondary">
                  {database.description || 'No description provided'}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Database Stats */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Statistics
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<Iconify icon="mdi:table" sx={{ width: 16, height: 16 }} />}
                  label={`${tableCount} ${tableCount === 1 ? 'Table' : 'Tables'}`}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                />
                <Chip
                  icon={<Iconify icon="mdi:calendar" sx={{ width: 16, height: 16 }} />}
                  label={`Created ${createdDate}`}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  }}
                />
              </Stack>
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
            <Stack direction="row" spacing={1}>
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
