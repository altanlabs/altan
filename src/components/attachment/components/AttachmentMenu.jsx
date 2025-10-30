import { Menu, MenuItem } from '@mui/material';
import { useState, useCallback } from 'react';
import Iconify from '../../iconify/Iconify.jsx';

const AttachmentMenu = ({ 
  menuItems = [], 
  onFileInputClick,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleMenuOpen = (event) => {
    event.preventDefault();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMenuItemClick = useCallback((type) => {
    handleMenuClose();
    onFileInputClick(type);
  }, [onFileInputClick]);

  return (
    <>
      <button
        onClick={handleMenuOpen}
        className="flex items-center justify-center w-7 h-7 rounded-xl
                 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800
                 transition-all duration-150 ease-out"
      >
        <Iconify
          icon="mdi:plus"
          className="text-sm"
        />
      </button>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            className: 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-gray-200/60 dark:border-gray-700/60 shadow-lg rounded-lg p-0.5 min-w-[160px]',
          },
        }}
      >
        {menuItems.map((item, index) => (
          <MenuItem
            key={item.type}
            onClick={() => handleMenuItemClick(item.type)}
            className={`flex items-center gap-2.5 py-1.5 px-2.5 mx-0.5 my-0.5 rounded-md transition-all duration-150 ease-out
              bg-transparent hover:bg-gray-100/70 dark:hover:bg-gray-800/70 
              text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100
              border-0 min-h-0`}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-100/60 dark:bg-gray-800/60">
              <Iconify 
                icon={item.icon} 
                className="text-sm text-gray-600 dark:text-gray-400" 
              />
            </div>
            <span className="font-medium text-xs flex-1">{item.label}</span>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default AttachmentMenu; 