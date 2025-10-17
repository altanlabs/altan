import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Database, Users, FolderOpen, Code, LayoutGrid, Radio } from 'lucide-react';
import React from 'react';

const SIDEBAR_WIDTH = 175;

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'tables', label: 'Database', icon: Database },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'services', label: 'Services', icon: Code },
  { id: 'storage', label: 'Storage', icon: FolderOpen },
  { id: 'realtime', label: 'Realtime', icon: Radio },
];

function BaseSidebar({ activeSection, onSectionChange, open }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? SIDEBAR_WIDTH : 0,
        flexShrink: 0,
        transition: 'width 0.2s',
        '& .MuiDrawer-paper': {
          width: open ? SIDEBAR_WIDTH : 0,
          boxSizing: 'border-box',
          position: 'relative',
          transition: 'width 0.2s',
          overflow: 'hidden',
          borderRight: open ? 1 : 0,
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', pt: 1 }}>
        <List>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <ListItem
                key={item.id}
                disablePadding
              >
                <ListItemButton
                  selected={isActive}
                  onClick={() => onSectionChange(item.id)}
                  sx={{
                    mx: 1,
                    mt: 1,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 20 }}>
                    <Icon size={20} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}

export default BaseSidebar;
