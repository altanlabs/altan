
import { m, AnimatePresence } from 'framer-motion';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, PanelResizeHandle } from 'react-resizable-panels';

import { cn } from '@lib/utils';

import DrawerToggle from '../components/room/drawer/DrawerToggle.jsx';

/**
 * @param {Object} props
 * @param {string} props.drawerId - Unique ID to store the drawer's state
 * @param {boolean} props.isOpen - Whether the drawer is expanded
 * @param {string} props.anchor - 'left', 'right', 'top', or 'bottom'
 * @param {number} props.defaultSize - Initial size (width/height) of the drawer
 * @param {number} props.minSize - Minimum size of the drawer
 * @param {number} props.maxSize - Maximum size of the drawer
 * @param {boolean} props.collapsible - Whether the drawer can be collapsed
 * @param {Function} props.onToggleDrawer - Function to toggle drawer open/close
 * @param {React.ReactNode} props.children - Content of the drawer
 */
const ResizableDrawerWrapper = ({
  drawerId,
  defaultSize,
  minSize,
  maxSize,
  isOpen,
  // onToggleDrawer,
  onOpenDrawer,
  onCloseDrawer,
  anchor,
  collapsible = false,
  order,
  children,
}) => {
  const [wasCollapsed, setWasCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const isHorizontal = anchor === 'top' || anchor === 'bottom';

  const anchorVariants = {
    hidden: {
      opacity: 0.6,
      [isHorizontal ? 'y' : 'x']: anchor === 'right' || anchor === 'bottom' ? '100%' : '-100%',
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      [isHorizontal ? 'y' : 'x']: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
    exit: {
      opacity: 0,
      [isHorizontal ? 'y' : 'x']: anchor === 'right' || anchor === 'bottom' ? '100%' : '-100%',
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
  };

  // const onExpand = useCallback((expanded) => {
  //   const sidebarPanel = sidebarRef.current;
  //   if (sidebarPanel && expanded) {
  //     onOpenDrawer();
  //     console.log('onExpand', expanded);
  //     sidebarPanel.resize(minSize);
  //   }
  // }, [minSize, onOpenDrawer]);

  const resizerClass = useMemo(() => cn(
    'bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors',
    // isHorizontal ? 'h-1 hover:h-2 cursor-ns-resize' : 'w-1 hover:w-2 cursor-ew-resize',
    isHorizontal ? 'h-1 cursor-ns-resize' : 'w-1 cursor-ew-resize',
    !isOpen ? 'hidden' : 'block',
  ), [isHorizontal, isOpen]);

  useEffect(() => {
    if (!!isOpen && !!wasCollapsed) {
      const sidebarPanel = sidebarRef.current;
      if (sidebarPanel) {
        sidebarPanel.resize(minSize);
      }
    }
    if (!isOpen) {
      setWasCollapsed(true);
    }
  }, [isOpen]);

  return (
    <>
      {/**
       * TODO:
       * in small screen, trasnform this to drawer if prop enables
       */}
      {anchor === 'bottom' && (
        <PanelResizeHandle id={`resize-handler-${drawerId}`} className={resizerClass} />
      )}
      <AnimatePresence mode="sync">
        {isOpen && (
          <Panel
            defaultSize={defaultSize}
            minSize={minSize}
            maxSize={maxSize}
            collapsible={collapsible}
            onCollapse={onCloseDrawer}
            onExpand={onOpenDrawer}
            id={drawerId}
            order={order}
            key={drawerId}
            ref={sidebarRef}
          >
            <m.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={anchorVariants}
              className={`
                relative shrink-0 h-full max-w-full
                bg-gradient-to-br from-transparent via-white/50 to-gray-200
                dark:via-black/50 dark:to-black
                shadow-lg border border-gray-300 dark:border-gray-700
                rounded-2xl
              `}
            >
              {children}
            </m.div>
          </Panel>
        )}
      </AnimatePresence>
      {anchor === 'left' && (
        <PanelResizeHandle id={`resize-handler-${drawerId}`} className={`${resizerClass} absolute right-0 h-full z-10 w-2 hover:bg-gray-400 dark:hover:bg-gray-700 hover:opacity-70 hover:w-2 cursor-ew-resize`} />
      )}
      {anchor === 'right' && (
        <PanelResizeHandle id={`resize-handler-${drawerId}`} className={`${resizerClass} absolute left-0 h-full z-10 w-2 hover:bg-gray-400 dark:hover:bg-gray-700 hover:opacity-70 hover:w-2 cursor-ew-resize`} />
      )}
      {anchor === 'top' && (
        <PanelResizeHandle id={`resize-handler-${drawerId}`} className={resizerClass} />
      )}
      {
        !isOpen && (
          <DrawerToggle
            drawerWidth={0}
            drawerOpen={false}
            side={anchor}
            toggleOpenDrawer={onOpenDrawer}
          />
        )
      }
    </>
  );
};

export default memo(ResizableDrawerWrapper);
