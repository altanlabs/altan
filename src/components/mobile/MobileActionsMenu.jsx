import React, { useState } from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import Iconify from '../iconify';
import HeaderIconButton from '../HeaderIconButton.jsx';

const MobileActionsMenu = ({ onDistribution, onHistory, onSettings, onUpgrade }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action) => {
    handleClose();
    action();
  };

  return (
    <>
      <Tooltip title="More actions">
        <HeaderIconButton
          onClick={handleClick}
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
          }}
        >
          <Iconify
            icon="mdi:dots-vertical"
            sx={{ width: 16, height: 16 }}
          />
        </HeaderIconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick(onDistribution)}>
          <ListItemIcon>
            <Iconify
              icon="mdi:broadcast"
              className="w-5 h-5"
            />
          </ListItemIcon>
          <ListItemText>Distribution</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick(onHistory)}>
          <ListItemIcon>
            <Iconify
              icon="mdi:history"
              className="w-5 h-5"
            />
          </ListItemIcon>
          <ListItemText>History</ListItemText>
        </MenuItem>
        {onSettings && (
          <MenuItem onClick={() => handleMenuItemClick(onSettings)}>
            <ListItemIcon>
              <Iconify
                icon="mdi:cog"
                className="w-5 h-5"
              />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleMenuItemClick(onUpgrade)}>
          <ListItemIcon>
            <Iconify
              icon="material-symbols:crown"
              className="w-5 h-5"
            />
          </ListItemIcon>
          <ListItemText>Upgrade</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default MobileActionsMenu;
