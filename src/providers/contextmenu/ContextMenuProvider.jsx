import React, {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  useMemo,
  memo,
} from 'react';

import ContextMenu from '../../components/contextmenu/ContextMenu';
import useLongPress from '../hooks/useLongPress';

const ContextMenuContext = createContext(null);

export const useContextMenu = () => useContext(ContextMenuContext);

const ContextMenuProvider = ({ children, menuItems, filterCondition, menuKey }) => {
  const [contextMenuState, setContextMenuState] = useState({
    xPos: 0,
    yPos: 0,
    visible: false,
    contextMenuResourceId: null,
  });

  const hideContextMenu = useCallback(() => {
    setContextMenuState((prevState) => ({ ...prevState, visible: false, menuItems: [] }));
  }, []);

  // Handler for long press or right-click to show the context menu
  const handleGlobalContextMenu = useCallback((event) => {
    const menuContextElement = event.target.closest('[data-contextmenu]');
    if (menuContextElement) {
      const contextMenuResourceId = menuContextElement.getAttribute('data-ctxmenu-rid');
      setContextMenuState({
        xPos: event.pageX,
        yPos: event.pageY,
        visible: true,
        contextMenuResourceId,
      });
    }
  }, []);

  // Use the useLongPress hook to detect long presses
  useLongPress(handleGlobalContextMenu, 750);

  // Attach the context menu handler for right-click events
  useEffect(() => {
    document.addEventListener('contextmenu', handleGlobalContextMenu);
    document.addEventListener('click', hideContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleGlobalContextMenu);
      document.removeEventListener('click', hideContextMenu);
    };
  }, [handleGlobalContextMenu, hideContextMenu]);

  const filteredMenuItems = useMemo(
    () => menuItems.filter(filterCondition(contextMenuState.contextMenuResourceId)),
    [contextMenuState.contextMenuResourceId, filterCondition, menuItems],
  );

  const memoizedValue = useMemo(
    () => ({
      isCtxMenuOpen: contextMenuState.visible,
      hideContextMenu,
    }),
    [contextMenuState.visible, hideContextMenu],
  );

  return (
    <ContextMenuContext.Provider value={memoizedValue}>
      <ContextMenu
        key={menuKey}
        xPos={contextMenuState.xPos}
        yPos={contextMenuState.yPos}
        menuItems={filteredMenuItems}
        open={contextMenuState.visible}
        onClose={hideContextMenu}
      />
      {children}
    </ContextMenuContext.Provider>
  );
};

export default memo(ContextMenuProvider);
