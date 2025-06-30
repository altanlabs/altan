import Drawer from '@mui/material/Drawer';
import Grow from '@mui/material/Grow';
import Menu from '@mui/material/Menu';
import { m } from 'framer-motion';
import React, { memo, useCallback, useEffect, useRef } from 'react';

import ContextMenuItems from './ContextMenuItemsRoom.jsx';
import useResponsive from '../../hooks/useResponsive';
import { selectContextMenu, setContextMenu } from '../../redux/slices/room.js';
import { dispatch, useSelector } from '../../redux/store.js';

const variants = {
  hidden: { opacity: 0, scale: 0.95, transform: 'translateY(25px)' },
  visible: {
    opacity: 1,
    scale: 1,
    transform: 'translateY(0px)',
    transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] },
  },
};

const selectAnchorEl = (state) => selectContextMenu(state)?.anchorEl;
const selectMenuItems = (state) => selectContextMenu(state)?.menuItems;
const selectPosition = (state) => selectContextMenu(state)?.position;
const onClose = () => dispatch(setContextMenu(null));

const ContextMenu = () => {
  const menuRef = useRef(null);
  const anchorEl = useSelector(selectAnchorEl);
  const menuItems = useSelector(selectMenuItems);
  const position = useSelector(selectPosition);
  // const { threads } = useSelector((state) => state.room);

  const isSmallScreen = useResponsive('down', 'sm');

  const isOpen = Boolean(anchorEl) && !!menuItems?.length;

  const renderMenuItems = <ContextMenuItems items={menuItems} />;
  const onContextMenu = useCallback((e) => {
    e.preventDefault();
    onClose();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (!isSmallScreen && !!isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return !isSmallScreen ? (
    <Menu
      anchorEl={anchorEl}
      keepMounted
      open={isOpen}
      onClose={onClose}
      TransitionComponent={Grow}
      onContextMenu={onContextMenu}
      anchorReference="anchorPosition"
      anchorPosition={position}
      hideBackdrop
      sx={{ pointerEvents: 'none' }}
      onClick={onClose}
    >
      <div
        ref={menuRef}
        style={{ pointerEvents: 'auto' }}
      >
        {renderMenuItems}
      </div>
    </Menu>
  ) : (
    <Drawer
      anchor="bottom"
      variant="temporary"
      open={isOpen}
      onClose={onClose}
      onClick={onClose}
      sx={{
        zIndex: 99998,
      }}
    >
      <m.div
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        style={{ pointerEvents: 'auto', padding: 20 }}
      >
        {/* <MessageMinified

        /> */}
        {renderMenuItems}
      </m.div>
    </Drawer>
  );
};

export default memo(ContextMenu);
