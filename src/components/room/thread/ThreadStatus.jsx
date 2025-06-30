import { Grow } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { capitalize } from 'lodash';
import React, { memo } from 'react';

import Iconify from '../../iconify/Iconify.jsx';

const threadStatusModes = [
  {
    value: 'running',
    color: 'group-hover:text-blue-400',
    icon: 'hugeicons:play',
  },
  {
    value: 'blocked',
    color: 'group-hover:text-yellow-400',
    icon: 'stash:pause-light',
  },
  {
    value: 'dead',
    color: 'group-hover:text-red-400',
    icon: 'iconoir:lock',
  },
];

const ThreadStatus = ({ status, setStatus, minimal = false }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (selectedStatus) => {
    if (status !== selectedStatus) {
      setStatus(selectedStatus);
    }
    handleCloseMenu();
  };
  const menuOpen = Boolean(anchorEl);
  const selectedStatus = threadStatusModes.find((mode) => mode.value === status);

  return (
    <div className="relative">
      <Tooltip
        title={menuOpen ? null : `Current status: ${capitalize(status)}`}
        arrow
      >
        <IconButton
          onClick={handleOpenMenu}
          className={`
            flex items-center justify-center border rounded-lg transition-all group
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500
          `}
          aria-label="Toggle thread status"
        >
          <Iconify
            icon={selectedStatus.icon}
            className={`w-6 h-6 ${selectedStatus.color}`}
          />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        TransitionComponent={Grow}
      >
        {threadStatusModes.map((mode) => (
          <MenuItem
            key={`status-option-${mode.value}`}
            onClick={() => handleStatusChange(mode.value)}
            className={`
              flex items-center px-3 py-2 w-full text-sm transition-all rounded-md group
              ${status === mode.value ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}
            `}
          >
            <Iconify
              icon={mode.icon}
              className={`w-5 h-5 mr-2 ${mode.color} transition transition-colors`}
            />
            <span className="text-gray-800 dark:text-gray-300 text-sm">
              {capitalize(mode.value)}
            </span>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default memo(ThreadStatus);
