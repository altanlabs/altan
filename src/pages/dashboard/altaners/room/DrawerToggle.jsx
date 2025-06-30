import { Tooltip, IconButton, Stack, Box } from '@mui/material';
import { memo } from 'react';

const DrawerToggle = ({ drawerOpen, side, toggleOpenDrawer }) => {
  // Determine the rotation direction based on side and drawer state
  const rotateUp = (side === 'left') === drawerOpen ? -15 : 15;
  const rotateDown = (side === 'left') === drawerOpen ? 15 : -15;

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
          [side]: drawerOpen ? 0 : -24,
          zIndex: 10,
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            '& .toggle-segment-up': {
              transform: `translateY(0.15rem) rotate(${rotateUp}deg) translateZ(0px)`,
            },
            '& .toggle-segment-down': {
              transform: `translateY(-0.15rem) rotate(${rotateDown}deg) translateZ(0px)`,
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
              bgcolor: 'grey.500',
              borderRadius: '15px',
              transition: 'transform 0.2s',
              transform: 'translateY(0.15rem) rotate(0deg) translateZ(0px)',
            }}
          />
          <Box
            className="toggle-segment-down"
            sx={{
              width: 5,
              height: 15,
              bgcolor: 'grey.500',
              borderRadius: '15px',
              transition: 'transform 0.2s',
              transform: 'translateY(-0.15rem) rotate(0deg) translateZ(0px)',
            }}
          />
        </Stack>
      </IconButton>
    </Tooltip>
  );
};

export default memo(DrawerToggle);
