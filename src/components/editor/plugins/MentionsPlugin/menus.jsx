import { MenuItem, MenuList } from '@mui/material';
import React from 'react';

export const CustomMenuList = React.forwardRef(({ children, ...other }, ref) => {
  return (
    <MenuList
      ref={ref}
      {...other}
      style={{ position: 'absolute', bottom: '100%', background: 'black', borderRadius: '10px' }}
    >
      {children}
    </MenuList>
  );
});

// Custom MenuItem component
export const CustomMenuItem = React.forwardRef(({ children, ...other }, ref) => {
  return (
    <MenuItem fullWidth ref={ref} {...other} >
      {children}
    </MenuItem>
  );
});
