import React from 'react';
import { Button, CircularProgress, Popover } from '@mui/material';
import { Play, Pause } from 'lucide-react';

export const ConfirmationPopover = ({
  open,
  anchorEl,
  isPaused,
  operating,
  onConfirm,
  onCancel,
}) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onCancel}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      slotProps={{
        paper: {
          elevation: 8,
          sx: {
            mt: 1,
            borderRadius: 3,
            minWidth: 320,
            border: '1px solid',
            borderColor: 'divider',
          },
        },
      }}
    >
      <div className="p-6 bg-white dark:bg-gray-800">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isPaused ? 'Resume Database?' : 'Pause Database?'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isPaused ? (
                'The database will be resumed and become available.'
              ) : (
                'The database will be paused and unavailable.'
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              onClick={onCancel}
              variant="outlined"
              size="small"
              disabled={operating}
              className="normal-case"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              variant="contained"
              size="small"
              color={isPaused ? 'success' : 'error'}
              startIcon={operating ? <CircularProgress size={16} /> : (isPaused ? <Play size={16} /> : <Pause size={16} />)}
              disabled={operating}
              className="normal-case"
            >
              {operating ? 'Processing...' : (isPaused ? 'Resume' : 'Pause')}
            </Button>
          </div>
        </div>
      </div>
    </Popover>
  );
};

