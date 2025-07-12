import { IconButton, Tooltip, Popover } from '@mui/material';
import { memo, useCallback, useState } from 'react';

import { switchToThreadInTab } from '../../redux/slices/room';
import { dispatch } from '../../redux/store.js';
import ConversationsList from '../conversations/ConversationsList.jsx';
import Iconify from '../iconify/Iconify.jsx';

const HistoryButton = ({ disabled = false, size = 'small' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);

  const handleClick = useCallback(
    (event) => {
      if (disabled) return;
      setAnchorEl(event.currentTarget);
    },
    [disabled],
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleThreadSelect = useCallback(
    (threadId) => {
      // Switch to the selected thread in a tab
      dispatch(switchToThreadInTab(threadId));
      // Close the popover
      handleClose();
    },
    [handleClose],
  );

  return (
    <>
      <Tooltip
        title="Recent conversations"
        placement="top"
      >
        <IconButton
          size={size}
          onClick={handleClick}
          disabled={disabled}
          color="inherit"
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
              width: 400,
              maxHeight: 400,
              mt: 1,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <ConversationsList
          maxHeight={300}
          limit={15}
          showTitle={true}
          compact={true}
          onThreadSelect={handleThreadSelect}
          emptyMessage="No recent conversations yet."
          loadingMessage="Loading..."
        />
      </Popover>
    </>
  );
};

export default memo(HistoryButton);
