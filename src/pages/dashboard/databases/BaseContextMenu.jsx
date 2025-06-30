import { Menu, MenuItem } from '@mui/material';

import Iconify from '../../iconify/Iconify';

const BaseContextMenu = ({ anchorEl, onClose, onEdit, onDelete }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem onClick={onEdit}>
        <Iconify
          icon="mdi:pencil"
          sx={{ mr: 2 }}
        />
        Edit Base
      </MenuItem>
      <MenuItem
        onClick={onDelete}
        sx={{ color: 'error.main' }}
      >
        <Iconify
          icon="mdi:delete"
          sx={{ mr: 2 }}
        />
        Delete Base
      </MenuItem>
    </Menu>
  );
};

export default BaseContextMenu;
