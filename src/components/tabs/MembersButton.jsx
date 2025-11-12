import { IconButton, Tooltip, Popover, Paper } from '@mui/material';
import { memo, useCallback, useState } from 'react';

import Iconify from '../iconify/Iconify.jsx';
import MembersList from '../members/MembersList.jsx';

const MembersButton = ({ disabled = false, size = 'small' }) => {
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

  return (
    <>
      <Tooltip
        title="Room members"
        placement="top"
      >
        <IconButton
          size={size}
          onClick={handleClick}
          disabled={disabled}
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
            emptyMessage="No members in this room."
          />
        </Paper>
      </Popover>
    </>
  );
};

export default memo(MembersButton);
