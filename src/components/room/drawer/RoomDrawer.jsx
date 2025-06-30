import { Drawer } from '@mui/material';
import { isInteger } from 'lodash';
import { memo, useMemo } from 'react';

// import DrawerToggle from './DrawerToggle';
import useResponsive from '../../../hooks/useResponsive';
import { setDrawerOpen } from '../../../redux/slices/room';
// import { isMobile } from "../utils";
import { dispatch } from '../../../redux/store.tsx';
import RoomContent from '../RoomContent.jsx';

const closeDrawer = () => dispatch(setDrawerOpen(false));

const RoomDrawer = ({
  drawerWidth,
  drawerOpen,
  setDragger,
  anchor = 'right',
}) => {
  const isSmallScreen = useResponsive('down', 'sm');
  const validDrawerWidth = useMemo(() => isSmallScreen && isNaN(drawerWidth) ? '100%' : drawerWidth, [isSmallScreen, drawerWidth]);

  return (
    <>
      {
        !isSmallScreen && !!drawerOpen && (
          <div
            style={{
              width: 15,
              height: '100%',
              bgcolor: 'none',
              cursor: 'ew-resize',
              position: 'absolute',
              right: !isSmallScreen ? (isInteger(drawerWidth) ? validDrawerWidth - 10 : 0) : 0,
              zIndex: 1201,
            }}
            onMouseDown={setDragger}
          />
        )
      }
      <Drawer
        // className="swipeable-room-drawer"
        sx={{
          width: drawerOpen ? validDrawerWidth : 0,
          '& .MuiDrawer-paper': {
            width: validDrawerWidth,
          },
          // ...(!isSmallScreen) && {
          //   '& .swipeable-room-drawer': {
          //     opacity: 0.5
          //   }
          // },
          // '& .swipeable-room-drawer > .room-drawer-toggle:hover': {
          //   opacity: 0.5
          // },
        }}
        variant={isSmallScreen ? 'temporary' : 'persistent'}
        anchor={anchor}
        open={drawerOpen}
        onClose={closeDrawer}
      >
        <RoomContent />
      </Drawer>
    </>
  );
};

export default memo(RoomDrawer);
