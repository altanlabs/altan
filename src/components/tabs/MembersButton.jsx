import { IconButton, Tooltip, Popover, Paper } from '@mui/material';
import { memo, useCallback, useState } from 'react';

import { cn } from '@lib/utils';

import MembersList from '../members/MembersList.jsx';
import Iconify from '../iconify/Iconify.jsx';

const MembersButton = ({ 
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

  const handleMemberSelect = useCallback((member) => {
    // TODO: Implement member selection logic if needed
    console.log('Member selected:', member);
    // Don't close popover on member select - let user interact with multiple members
  }, []);

  return (
    <>
      <Tooltip title="Room members" placement="top">
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
            icon="mdi:account-group"
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
              width: 360,
              maxHeight: 450,
              mt: 1,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <Paper sx={{ p: 2 }}>
          <MembersList
            maxHeight={350}
            showTitle={true}
            compact={true}
            showInviteButton={true}
            onMemberSelect={handleMemberSelect}
            emptyMessage="No members in this room."
          />
        </Paper>
      </Popover>
    </>
  );
};

export default memo(MembersButton); 