import { 
  Button, 
  DialogTitle, 
  DialogActions, 
  DialogContent, 
  TextField, 
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { cn } from '@lib/utils';

import { patchThread, archiveMainThread } from '../../redux/slices/room';
import CustomDialog from '../dialogs/CustomDialog.jsx';
import Iconify from '../iconify/Iconify.jsx';

const ThreadInfoPopup = ({ 
  open, 
  onClose, 
  threadId, 
  threadName, 
  roomId,
  isMainThread = false,
  className 
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const [editedName, setEditedName] = useState(threadName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [copiedItemType, setCopiedItemType] = useState(''); // 'thread' or 'room'
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Update edited name when threadName changes
  useEffect(() => {
    setEditedName(threadName || '');
  }, [threadName]);

  // Reset editing state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setIsEditing(false);
      setEditedName(threadName || '');
    }
  }, [open, threadName]);

  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      // Cancel editing - reset to original name
      setEditedName(threadName || '');
    }
    setIsEditing(!isEditing);
  }, [isEditing, threadName]);

  const handleSave = useCallback(async () => {
    if (!editedName.trim() || editedName === threadName) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await dispatch(patchThread({ 
        threadId, 
        name: editedName.trim() 
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to rename thread:', error);
      // Reset to original name on error
      setEditedName(threadName || '');
    } finally {
      setIsSaving(false);
    }
  }, [editedName, threadName, threadId, dispatch]);

  const handleCopyThreadId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(threadId);
      setCopiedItemType('thread');
      setShowCopiedAlert(true);
    } catch (error) {
      console.error('Failed to copy thread ID:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = threadId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedItemType('thread');
      setShowCopiedAlert(true);
    }
  }, [threadId]);

  const handleCopyRoomId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopiedItemType('room');
      setShowCopiedAlert(true);
    } catch (error) {
      console.error('Failed to copy room ID:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = roomId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedItemType('room');
      setShowCopiedAlert(true);
    }
  }, [roomId]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleEditToggle();
    }
  }, [handleSave, handleEditToggle]);

  const handleArchive = useCallback(async () => {
    setIsArchiving(true);
    try {
      await dispatch(archiveMainThread({ threadId }));
      setShowArchiveConfirm(false);
      onClose(); // Close the popup after successful archive
    } catch (error) {
      console.error('Failed to archive thread:', error);
    } finally {
      setIsArchiving(false);
    }
  }, [threadId, dispatch, onClose]);

  const handleClose = useCallback(() => {
    if (isEditing) {
      setEditedName(threadName || '');
      setIsEditing(false);
    }
    setShowArchiveConfirm(false);
    onClose();
  }, [isEditing, threadName, onClose]);

  return (
    <>
      <CustomDialog
        className={cn("max-w-md", className)}
        dialogOpen={open}
        onClose={handleClose}
        showCloseButton={true}
      >
        <DialogTitle 
          sx={{ 
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Iconify 
            icon="material-symbols:thread-unread"
            width={24}
            sx={{ color: theme.palette.text.secondary }}
          />
          Thread Information
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          {/* Thread Name Section */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1, 
                color: theme.palette.text.secondary,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Iconify icon="mdi:tag-text" width={16} />
              Thread Name
            </Typography>
            
            {isEditing ? (
              <TextField
                fullWidth
                size="small"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
                placeholder="Enter thread name..."
                disabled={isSaving}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.default,
                  minHeight: 40
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    flex: 1,
                    color: threadName ? theme.palette.text.primary : theme.palette.text.disabled
                  }}
                >
                  {threadName || 'Untitled Thread'}
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleEditToggle}
                  sx={{ 
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.text.primary
                    }
                  }}
                >
                  <Iconify icon="mdi:pencil" width={16} />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Thread ID Section */}
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1, 
                color: theme.palette.text.secondary,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Iconify icon="mdi:identifier" width={16} />
              Thread ID
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                backgroundColor: theme.palette.background.default,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
              onClick={handleCopyThreadId}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: theme.palette.text.secondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {threadId}
              </Typography>
              <IconButton
                size="small"
                sx={{ 
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.text.primary
                  }
                }}
              >
                <Iconify icon="mdi:content-copy" width={16} />
              </IconButton>
            </Box>
            
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 0.5,
                color: theme.palette.text.disabled,
                display: 'block'
              }}
            >
              Click to copy thread ID
            </Typography>
          </Box>

          {/* Room ID Section */}
          {roomId && (
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  color: theme.palette.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Iconify icon="mdi:door-open" width={16} />
                Room ID
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.default,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  }
                }}
                onClick={handleCopyRoomId}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: theme.palette.text.secondary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {roomId}
                </Typography>
                <IconButton
                  size="small"
                  sx={{ 
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.text.primary
                    }
                  }}
                >
                  <Iconify icon="mdi:content-copy" width={16} />
                </IconButton>
              </Box>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  mt: 0.5,
                  color: theme.palette.text.disabled,
                  display: 'block'
                }}
              >
                Click to copy room ID
              </Typography>
            </Box>
          )}

          {/* Archive Section - Only show for main threads */}
          {isMainThread && (
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  color: theme.palette.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Iconify icon="mdi:archive" width={16} />
                Archive Thread
              </Typography>
              
              <Box 
                sx={{ 
                  p: 2,
                  border: `1px solid ${theme.palette.warning.main}`,
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 152, 0, 0.04)' 
                    : 'rgba(255, 152, 0, 0.04)',
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    mb: 2
                  }}
                >
                  Archive this main thread conversation. This will clear all messages and start fresh.
                </Typography>
                
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  startIcon={<Iconify icon="mdi:archive" width={16} />}
                  onClick={() => setShowArchiveConfirm(true)}
                  sx={{
                    borderColor: theme.palette.warning.main,
                    color: theme.palette.warning.main,
                    '&:hover': {
                      borderColor: theme.palette.warning.dark,
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 152, 0, 0.08)' 
                        : 'rgba(255, 152, 0, 0.08)',
                    }
                  }}
                >
                  Archive Thread
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleEditToggle}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={isSaving || !editedName.trim() || editedName === threadName}
                sx={{
                  minWidth: 80,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  }
                }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleClose}
              fullWidth
            >
              Close
            </Button>
          )}
        </DialogActions>
      </CustomDialog>

      {/* Archive Confirmation Dialog */}
      <CustomDialog
        className="max-w-sm"
        dialogOpen={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        showCloseButton={true}
      >
        <DialogTitle 
          sx={{ 
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: theme.palette.warning.main
          }}
        >
          <Iconify 
            icon="mdi:archive-alert"
            width={24}
            sx={{ color: theme.palette.warning.main }}
          />
          Archive Main Thread?
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              mb: 2
            }}
          >
            This will permanently archive the main thread conversation and clear all messages. 
            This action cannot be undone.
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.warning.main,
              fontWeight: 500
            }}
          >
            Are you sure you want to continue?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setShowArchiveConfirm(false)}
            disabled={isArchiving}
            sx={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleArchive}
            disabled={isArchiving}
            startIcon={isArchiving ? null : <Iconify icon="mdi:archive" width={16} />}
            sx={{ 
              flex: 1,
              backgroundColor: theme.palette.warning.main,
              '&:hover': {
                backgroundColor: theme.palette.warning.dark,
              }
            }}
          >
            {isArchiving ? 'Archiving...' : 'Archive'}
          </Button>
        </DialogActions>
      </CustomDialog>

      {/* Snackbar for copy confirmation */}
      <Snackbar
        open={showCopiedAlert}
        autoHideDuration={2000}
        onClose={() => setShowCopiedAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowCopiedAlert(false)} 
          severity="success" 
          variant="filled"
          sx={{ 
            backdropFilter: 'blur(10px)',
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(76, 175, 80, 0.9)' 
              : 'rgba(76, 175, 80, 0.95)'
          }}
        >
          {copiedItemType === 'room' ? 'Room ID' : 'Thread ID'} copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default memo(ThreadInfoPopup);
