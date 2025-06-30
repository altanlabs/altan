import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import React, { memo } from 'react';

import Iconify from '../../../../../components/iconify';

const FileTreeContextMenu = ({ anchorEl, open, menuItems, onClose }) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: {
            pointerEvents: 'auto',
          },
          className:
            'min-w-[160px] py-1 rounded shadow-md border border-gray-200 bg-white dark:bg-[#2d2d2d] dark:border-gray-600 context-menu',
        },
        root: {
          sx: {
            pointerEvents: 'none',
          },
        },
      }}
      disableScrollLock
      hideBackdrop
      onContextMenu={(e) => e.preventDefault()}
    >
      <ClickAwayListener onClickAway={onClose}>
        <div>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              onClick={item.action}
              className="w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3d3d3d]"
            >
              <div className="flex items-center">
                <Iconify
                  icon={item.icon}
                  className="w-4 h-4 mr-2"
                />
                {item.label}
              </div>
              {item.shortcut && (
                <span className="ml-4 text-xs text-gray-500 dark:text-gray-400">
                  {item.shortcut}
                </span>
              )}
            </MenuItem>
          ))}
        </div>
      </ClickAwayListener>
    </Popover>
  );
};

export default memo(FileTreeContextMenu);
