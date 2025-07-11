import { IconButton, Tooltip, Popover, Paper } from '@mui/material';
import { memo, useCallback, useState } from 'react';

import { cn } from '@lib/utils';

import ConversationsList from '../conversations/ConversationsList.jsx';
import Iconify from '../iconify/Iconify.jsx';
import { switchToThreadInTab } from '../../redux/slices/room';
import { dispatch } from '../../redux/store.js';

const HistoryButton = ({ 
  className,
  disabled = false,
  size = 'small',
  variant = 'outlined'
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);

  const handleClick = useCallback((event) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  }, [disabled]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleThreadSelect = useCallback((threadId) => {
    // Switch to the selected thread in a tab
    dispatch(switchToThreadInTab(threadId));
    // Close the popover
    handleClose();
  }, [handleClose]);

  return (
    <>
      <Tooltip title="Recent conversations" placement="top">
        <IconButton
          size={size}
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            'transition-all duration-200',
            '!p-1.5 !min-w-0',
            variant === 'outlined' && 'border border-gray-300 dark:border-gray-600',
            variant === 'contained' && 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400',
            '!text-gray-600 dark:!text-gray-400',
            'hover:!bg-gray-50 dark:hover:!bg-gray-900/20',
            'hover:!text-gray-800 dark:hover:!text-gray-300',
            'hover:border-gray-400 dark:hover:border-gray-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(156, 163, 175, 0.1)',
            },
          }}
        >
          <Iconify
            icon="solar:history-linear"
            width={20}
          />
        </IconButton>
      </Tooltip>

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxHeight: 400,
              mt: 1,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <Paper sx={{ p: 2 }}>
          <ConversationsList
            maxHeight={300}
            limit={15}
            showTitle={true}
            compact={true}
            onThreadSelect={handleThreadSelect}
            emptyMessage="No recent conversations yet."
            loadingMessage="Loading..."
          />
        </Paper>
      </Popover>
    </>
  );
};

export default memo(HistoryButton); 