import {
  Tooltip,
  IconButton,
  Stack,
  Box,
} from '@mui/material';
import { memo } from 'react';

import useResponsive from '../../../hooks/useResponsive';

const DrawerToggle = ({ drawerWidth, drawerOpen, side, toggleOpenDrawer }) => {
  const isSmallScreen = useResponsive('down', 'sm');

  return (
    <Tooltip
      title={drawerOpen ? 'Close Sidebar' : 'Open Sidebar'}
      placement={side === 'left' ? 'right' : 'left'}
      followCursor
    >
      <IconButton
        className="room-drawer-toggle"
        color="gray"
        aria-label={`${drawerOpen ? 'Close' : 'Open'} drawer`}
        edge={side === 'left' ? 'start' : 'end'}
        onClick={toggleOpenDrawer}
        sx={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          ...isSmallScreen ? (!!drawerOpen ? {
            [side]: window.innerWidth - 12,
          } : {
            [side]: 12,
          }) : (!drawerOpen ? {
            [side]: drawerOpen && side === 'right' ? drawerWidth : 12,
          } : {
            [side]: drawerOpen ? `${drawerWidth}px` : 12,
          }),
          zIndex: 1202,
          '&:hover': {
            '& .toggle-segment-up': {
              transform: `translateY(0.15rem) rotate(${drawerOpen ? (side === 'left' ? 15 : -15) : (side === 'left' ? -15 : 15)}deg) translateZ(0px)`,
            },
            '& .toggle-segment-down': {
              transform: `translateY(-0.15rem) rotate(${drawerOpen ? (side === 'left' ? -15 : 15) : (side === 'left' ? 15 : -15)}deg) translateZ(0px)`,
            },
          },
        }}
      >
        <Stack>
          <Box
            className="toggle-segment-up"
            sx={{
              width: 5,
              height: 15,
              bgcolor: 'grey',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              // Adjust rotation direction based on drawer side
              transform: 'translateY(0.15rem) rotate(0deg) translateZ(0px)',
            }}
          />
          <Box
            className="toggle-segment-down"
            sx={{
              width: 5,
              height: 15,
              bgcolor: 'grey',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              // Adjust rotation direction based on drawer side
              transform: 'translateY(-0.15rem) rotate(0deg) translateZ(0px)',
            }}
          />
        </Stack>
      </IconButton>
    </Tooltip>
  );
};

export default memo(DrawerToggle);
