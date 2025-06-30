import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Tooltip,
  Typography,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import React, { memo, useRef, useEffect, useMemo, useCallback } from 'react';

import Iconify from '../../../../components/iconify/Iconify';
import IconRenderer from '../../../../components/icons/IconRenderer';

const DrawerTab = memo(({ component, onTabChange, highlighted = false }) => {
  const onButtonClick = useCallback(
    () =>
      component.type === 'external_link'
        ? window.open(component.params.url, '_blank')
        : onTabChange(component.id),
    [component.id, component?.params?.url, component.type, onTabChange],
  );

  return (
    <Tooltip
      title={component.name}
      placement="top"
      arrow
    >
      <BottomNavigationAction
        label={component.name}
        value={component.id}
        onClick={onButtonClick}
        icon={
          <Iconify
            icon={component.icon}
            width={24}
          />
        }
        sx={{
          maxWidth: 'fit-content',
          textTransform: 'capitalize',
          '& .MuiBottomNavigationAction-label': {
            display: 'none',
          },
          '@media (min-width: 600px)': {
            '& .MuiBottomNavigationAction-label': {
              display: 'block',
            },
          },
          ...(highlighted && {
            // boxShadow: (theme) => theme.shadows[4],
            color: (theme) => (theme.palette.mode === 'dark' ? '#000' : '#fff'),
            bgcolor: 'secondary.dark',
          }),
        }}
      />
    </Tooltip>
  );
});

const StaticDrawerNavMobile = ({
  altanerId,
  activeTab,
  onClickCreateComponent,
  onTabChange,
  name = null,
  icon = null,
  components = null,
  showRoom = false,
  showSettings = true,
}) => {
  const bottomNavRef = useRef(null);

  const allComponents = useMemo(
    () => [
      ...Object.values(components ?? {}),
      ...(showRoom ? [{ id: 'room', name: 'Room', icon: 'fluent:chat-multiple-16-filled' }] : []),
      ...(showSettings ? [{ id: 'settings', name: 'Settings', icon: 'mdi:cog' }] : []),
    ],
    [components, showRoom, showSettings],
  );

  useEffect(() => {
    if (bottomNavRef.current) {
      const activeElement = bottomNavRef.current.querySelector('.Mui-selected');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTab]);

  console.log('activeTab', activeTab, allComponents);

  // const onBottomNavChange = useCallback((event, newValue) => onTabChange(newValue), [onTabChange]);

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: 1,
        borderColor: 'divider',
        zIndex: 1000,
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction="row"
        width="100%"
        alignItems="center"
        spacing={1}
        paddingX={1}
      >
        <Box
          ref={bottomNavRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            padding: '8px',
          }}
        >
          <BottomNavigation
            value={activeTab}
            // onChange={onBottomNavChange}
            sx={{
              flex: 1,
              display: 'flex',
              gap: 1,
              '& .MuiBottomNavigationAction-root': {
                minWidth: 80,
                padding: '4px 12px',
                borderRadius: 3,
                transition: '0.3s',
                boxShadow: (theme) => theme.shadows[1],
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: (theme) => (theme.palette.mode === 'dark' ? '#000' : '#fff'),
                  boxShadow: (theme) => theme.shadows[3],
                  transform: 'scale(1.05)',
                },
                // '&.Mui-selected': {
                //   bgcolor: 'primary.light',
                //   fontWeight: 'bold',
                //   color: (theme) => theme.palette.mode === "dark" ? '#000' : '#fff',
                //   boxShadow: (theme) => theme.shadows[4],
                // },
              },
            }}
          >
            {allComponents.map((component) => (
              <DrawerTab
                key={component.id}
                component={component}
                highlighted={activeTab === component.id}
                onTabChange={onTabChange}
              />
            ))}
          </BottomNavigation>
        </Box>
        {!!altanerId && (
          <Tooltip
            title="Add New Component"
            placement="top"
            arrow
          >
            <IconButton
              onClick={onClickCreateComponent}
              sx={{
                padding: 2,
                transition: '0.3s',
                boxShadow: (theme) => theme.shadows[2],
                '&:hover': {
                  boxShadow: (theme) => theme.shadows[3],
                  transform: 'scale(1.15)',
                },
              }}
            >
              <Iconify
                icon="mdi:plus"
                width={24}
              />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Divider />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={1}
        padding={1}
        sx={{
          boxShadow: (theme) => theme.shadows[1],
        }}
      >
        <IconRenderer
          icon={icon}
          size={24}
        />
        <Typography
          variant="subtitle1"
          fontWeight="bold"
        >
          {name}
        </Typography>
      </Stack>
    </Box>
  );
};

export default memo(StaticDrawerNavMobile);
