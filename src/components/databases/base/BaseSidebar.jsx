import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import { Database, Users, FolderOpen, Code, Key, FileText, LayoutGrid } from 'lucide-react';

const SIDEBAR_WIDTH = 200;

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'tables', label: 'Database', icon: Database },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'storage', label: 'Storage', icon: FolderOpen },
  { id: 'functions', label: 'Edge Functions', icon: Code },
  { id: 'secrets', label: 'Secrets', icon: Key },
  { id: 'logs', label: 'Logs', icon: FileText },
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
      <Box sx={{ overflow: 'auto', pt: 2 }}>
        <List>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={isActive}
                  onClick={() => onSectionChange(item.id)}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
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
