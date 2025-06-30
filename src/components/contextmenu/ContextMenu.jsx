import Drawer from '@mui/material/Drawer';
import Grow from '@mui/material/Grow';
import Menu from '@mui/material/Menu';
import { m } from 'framer-motion';
import React, { useMemo } from 'react';

import ContextMenuItems from './ContextMenuItems';
import useResponsive from '../../hooks/useResponsive';

const variants = {
  hidden: { opacity: 0, scale: 0.95, transform: 'translateY(25px)' },
  visible: {
    opacity: 1,
    scale: 1,
    transform: 'translateY(0px)',
    transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] },
  },
};

const ContextMenu = ({
  parentId,
  xPos,
  yPos,
  menuItems,
  open,
  onClose,
  children,
  disabledMessageTooltip = '',
}) => {
  const isSmallScreen = useResponsive('down', 'sm');

  const anchorPosition = useMemo(
    () =>
      isSmallScreen
        ? undefined
        : yPos !== null && xPos !== null
          ? { top: yPos, left: xPos }
          : undefined,
    [isSmallScreen, xPos, yPos],
  );

  if (!menuItems?.length) {
    return null;
  }

  return !isSmallScreen ? (
    <Menu
      key={parentId}
      keepMounted
      open={open}
      onClose={onClose}
      TransitionComponent={Grow}
      hideBackdrop
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      sx={{
        zIndex: 1001,
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        {children}
        <ContextMenuItems
          items={menuItems}
          disabledMessageTooltip={disabledMessageTooltip}
          onClose={onClose}
        />
      </div>
    </Menu>
  ) : (
    <Drawer
      anchor="bottom"
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 99998,
        pointerEvents: 'none',
      }}
    >
      <m.div
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        style={{ pointerEvents: 'auto', padding: 20 }}
      >
        {children}
        <ContextMenuItems items={menuItems} />
      </m.div>
    </Drawer>
  );
};

export default ContextMenu;
