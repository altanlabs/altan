import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import { memo } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuthContext } from '../../../auth/useAuthContext.ts';
import Iconify from '../../../components/iconify';
import UpgradeButton from '../../../components/UpgradeButton';

const DRAWER_WIDTH = 280;

// Navigation items matching the image structure
const NAVIGATION_ITEMS = [
  {
    title: 'Home',
    icon: 'material-symbols:home-outline',
    path: '/',
    section: 'main',
  },
];

const ACCOUNT_ITEMS = [
  {
    title: 'Upgrade',
    icon: 'material-symbols:star-outline',
    path: '/pricing',
    action: 'upgrade',
  },
  {
    title: 'Settings',
    icon: 'material-symbols:settings-outline',
    path: '/account/settings',
  },
];

const APP_ITEMS = [
  {
    title: 'Projects',
    icon: 'material-symbols:folder-outline',
    path: '/projects',
    color: '#6366f1',
  },
  {
    title: 'Agents',
    icon: 'material-symbols:smart-toy-outline',
    path: '/agents',
    color: '#06b6d4',
  },
  {
    title: 'Flows',
    icon: 'material-symbols:account-tree-outline',
    path: '/flows',
    color: '#8b5cf6',
  },
  {
    title: 'Databases',
    icon: 'material-symbols:database-outline',
    path: '/bases',
    color: '#10b981',
  },
  {
    title: 'Media',
    icon: 'material-symbols:image-outline',
    path: '/media',
    color: '#ef4444',
  },
  {
    title: 'Usage',
    icon: 'material-symbols:analytics-outline',
    path: '/usage',
    color: '#84cc16',
  },
];

const MobileNavSidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const history = useHistory();
  const { user } = useAuthContext();

  const handleNavigation = (path, action) => {
    if (action === 'upgrade') {
      // Handle upgrade action - could open pricing modal or navigate to pricing
      history.push('/pricing');
    } else {
      history.push(path);
    }
    onClose();
  };

  const renderNavItem = (item, isAccount = false) => (
    <ListItem
      key={item.title}
      disablePadding
    >
      <ListItemButton
        onClick={() => handleNavigation(item.path, item.action)}
        sx={{
          py: 1.5,
          px: 2.5,
          borderRadius: 2,
          mx: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: isAccount ? 1 : '50%',
              backgroundColor: item.color || 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify
              icon={item.icon}
              sx={{
                color: 'white',
                width: 20,
                height: 20,
              }}
            />
          </Box>
        </ListItemIcon>
        <ListItemText
          primary={item.title}
          primaryTypographyProps={{
            variant: 'body2',
            color: 'white',
            fontWeight: 500,
          }}
        />
        {item.action === 'upgrade' && (
          <Button
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#2563eb',
              color: 'white',
              fontSize: '0.75rem',
              px: 2,
              py: 0.5,
              minWidth: 'auto',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
            }}
          >
            Get Pro
          </Button>
        )}
        {(item.title === 'Profile' || item.title === 'Settings') && (
          <Button
            variant="outlined"
            size="small"
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontSize: '0.75rem',
              px: 2,
              py: 0.5,
              minWidth: 'auto',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            Open
          </Button>
        )}
      </ListItemButton>
    </ListItem>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: DRAWER_WIDTH,
          backgroundColor: 'rgba(26, 26, 26, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', // Safari support
          backgroundImage: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      ModalProps={{
        BackdropProps: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          },
        },
      }}
    >
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header with close button and user */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3, pr: 2 }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Iconify icon="material-symbols:close" />
          </IconButton>

          {user && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Avatar
                sx={{ width: 24, height: 24 }}
                src={user.avatar_url}
              >
                {user.first_name?.[0] || user.email?.[0] || 'U'}
              </Avatar>
            </Stack>
          )}
        </Stack>

        {/* Main navigation */}
        <List sx={{ px: 0 }}>{NAVIGATION_ITEMS.map((item) => renderNavItem(item))}</List>

        {/* Apps section */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle2"
            color="white"
            sx={{
              px: 2.5,
              mb: 1,
              opacity: 0.7,
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Products
          </Typography>
          <List sx={{ px: 0 }}>{APP_ITEMS.map((item) => renderNavItem(item))}</List>
        </Box>
      </Box>
      
      {/* Upgrade button fixed at bottom */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <UpgradeButton large/>
      </Box>
    </Drawer>
  );
};

export default memo(MobileNavSidebar);
