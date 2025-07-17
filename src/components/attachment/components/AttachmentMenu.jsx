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
        className="flex items-center justify-center p-1 rounded-full
                 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800
                 text-gray-600 dark:text-gray-300 transition"
      >
        <Iconify
          icon="mdi:plus"
          className="text-xl"
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
            className: 'bg-white/30 dark:bg-black/30 py-0 my-0',
          },
        }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.type}
            onClick={() => handleMenuItemClick(item.type)}
            className="flex flex-col items-start py-1 px-2 bg-white/30 dark:bg-black/30 hover:bg-white/60 dark:hover:bg-black/60 backdrop-blur-lg rounded-lg"
          >
            <div className="flex items-center gap-3 w-full">
              <Iconify icon={item.icon} />
              <div className="flex flex-col">
                <span className="font-bold tracking-wide text-sm">{item.label}</span>
              </div>
            </div>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default AttachmentMenu; 