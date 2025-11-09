// import { useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// @mui
import { Box, Drawer, Stack, useTheme } from '@mui/material';

// hooks
import { memo } from 'react';
import { useSelector } from 'react-redux';

import navConfig from './config-navigation';
import NavAccount from './NavAccount';
import NavDocs from './NavDocs';
import Iconify from '../../../components/iconify';
import IconRenderer from '../../../components/icons/IconRenderer';
import { NavSectionVertical } from '../../../components/nav-section';
import Scrollbar from '../../../components/scrollbar';
import { NAV } from '../../../config-global';
import useResponsive from '../../../hooks/useResponsive';
// config
// components
//

// import NavToggleButton from './NavToggleButton';

import PermissionDialog from '../../../layouts/dashboard/nav/PermissionDialog';
import CreateAltaner from '../../../pages/dashboard/altaners/components/CreateAltaner';
import { selectNav } from '../../../redux/slices/general';

// ----------------------------------------------------------------------

const selectAltaners = (state) => state.general.account.altaners;
const selectAltanersInitialized = (state) => state.general.accountAssetsInitialized.altaners;
const selectAltanersLoading = (state) => state.general.accountAssetsLoading.altaners;

const NavVertical = ({ openNav, onCloseNav }) => {
  const theme = useTheme();
  const nav = useSelector(selectNav);
  const isDesktop = useResponsive('up', 'lg');
  const altaners = useSelector(selectAltaners);
  const altanersInitialized = useSelector(selectAltanersInitialized);
  const altanersLoading = useSelector(selectAltanersLoading);

  const renderDynamicNavConfig = (userPermissions) => {
    if (!navConfig || !Array.isArray(navConfig)) {
      console.error('Invalid navConfig:', navConfig);
      return [];
    }

    const filterItemsWithPermission = (items) => {
      return items
        .map((item) => ({
          ...item,
          children: item.children ? filterItemsWithPermission(item.children) : undefined,
        }))
        .filter(
          (item) =>
            userPermissions.includes(item.permission) ||
            (item.children && item.children.length > 0),
        );
    };

    const getAltanerItems = () => {
      const items = [];
      if (!altanersInitialized || altanersLoading) {
        items.push({
          title: 'Loading...',
          path: '/altaners',
          icon: <Iconify icon="line-md:loading-loop" />,
        });
      } else if (!!altaners && altaners.length > 0) {
        for (const altaner of altaners) {
          const icon =
            altaner?.icon_url ||
            'https://platform-api.altan.ai/media/07302874-5d8b-46e5-ad18-6570f8ba8258?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285';
          items.push({
            title: altaner.name,
            path: `/altaners/${altaner.id}`,
            icon: (
              <IconRenderer
                sx={{ borderRadius: '20%' }}
                size={28}
                icon={
                  icon.startsWith('@lottie:')
                    ? `${icon.replace('autoplay', '').replace('loop', '')}:${openNav ? 'autoplay,loop' : ''}`
                    : icon
                }
              />
            ),
          });
        }
      }
      return items;
    };

    const dynamicNavConfig = navConfig
      .map((section) => {
        if (section.subheader === 'Altaners') {
          return {
            ...section,
            items: getAltanerItems(),
          };
        }
        return {
          ...section,
          items: filterItemsWithPermission(section.items),
        };
      })
      .filter((section) => section.items.length > 0 || section.subheader === 'Altaners');

    return dynamicNavConfig;
  };

  const userPermissions = [
    ...nav,
    'view_dashboard',
    'view_flows',
    'view_agents',
    'view_team',
    'view_settings',
  ];

  const dynamicNavConfig = renderDynamicNavConfig(userPermissions);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        padding={2}
        spacing={1}
      >
        {/* <IconButton
          onClick={onCloseNav}
        >
          <Iconify icon="mdi:close" />
        </IconButton> */}
        <NavAccount />
      </Stack>
      {/* <Box sx={{ p: 2 }}> */}
      {/* </Box> */}
      <NavSectionVertical
        data={dynamicNavConfig}
        sx={{ mt: -2 }}
        onCloseNav={onCloseNav}
      />
      <Box sx={{ flexGrow: 1 }} />
      <NavDocs />
    </Scrollbar>
  );

  return (
    <>
      <PermissionDialog />
      <CreateAltaner />
      <Box
        component="nav"
        sx={{
          width: { lg: NAV.W_DASHBOARD },
        }}
      >
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            zIndex: 4,
            '& .MuiBackdrop-root': {
              backdropFilter: 'blur(6px)',
              backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(42,42,42,0.6)' : 'rgba(255,255,255,0.6)',
            },
          }}
          PaperProps={{
            sx: {
              zIndex: 999,
              width: NAV.W_DASHBOARD,
              bgcolor: 'background.default',
              ...(isDesktop && {
                position: 'relative',
              }),
            },
          }}
          variant="temporary"
        >
          {renderContent}
        </Drawer>
      </Box>
    </>
  );
};

export default memo(NavVertical);
