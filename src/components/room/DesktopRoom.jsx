import { Drawer } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import React, { memo, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import RoomContent from './RoomContent.jsx';
import Threads from './Threads.jsx';
import useResponsive from '../../hooks/useResponsive.js';
import GeneralToolbar from '../../layouts/room/GeneralToolbar.jsx';
import { useWebSocket } from '../../providers/websocket/WebSocketProvider.jsx';
import { checkObjectsEqual } from '../../redux/helpers/memoize';
import { selectRoomId, selectRoomState, setDrawerOpen } from '../../redux/slices/room';
import { dispatch, useSelector } from '../../redux/store.js';

const onCloseDrawer = () => dispatch(setDrawerOpen(false));

const roomSelector = createSelector(
  [selectRoomState],
  (roomState) => ({
    initialized: roomState.initialized,
    isLoading: roomState.isLoading,
    drawer: roomState.thread.drawer,
    drawerOpen: roomState.drawerOpen,
  }),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

const DesktopRoom = ({
  header = true,
  previewComponent = null,
  isMobile = false,
  mobileActiveView = 'chat',
}) => {
  const { isOpen, subscribe, unsubscribe } = useWebSocket();
  const isSmallScreen = useResponsive('down', 'sm');
  const roomId = useSelector(selectRoomId);
  const { initialized, isLoading, drawerOpen } = useSelector(roomSelector);

  useEffect(() => {
    if (isOpen && roomId) {
      const lastRoomId = roomId;
      subscribe(`room:${roomId}`);
      return () => {
        unsubscribe(`room:${lastRoomId}`);
      };
    }
  }, [isOpen, roomId]);

  const renderRoomContent = <RoomContent className="w-full" />;

  // Mobile layout with toggle
  if (isMobile && previewComponent) {
    return (
      <div className="flex flex-col h-full relative">
        {/* Show toolbar in preview mode, hide in chat mode */}
        {mobileActiveView !== 'preview' && (
          <GeneralToolbar
            isLoading={isLoading || !initialized.room}
            header={header}
          />
        )}

        {/* Main content area - conditional padding based on view */}
        <div
          className="flex-1 relative"
          style={{
            paddingBottom: mobileActiveView === 'chat' ? '0px' : '90px',
          }}
        >
          {mobileActiveView === 'chat' ? (
            <Threads hideInput />
          ) : (
            <div className="h-full w-full">{previewComponent}</div>
          )}
        </div>
      </div>
    );
  }

  // Original desktop layout
  return (
    <PanelGroup direction="horizontal">
      {isSmallScreen ? (
        <>
          <Drawer
            sx={{
              '& .MuiDrawer-paper': {
                width: '80vw',
              },
            }}
            variant="temporary"
            anchor="left"
            open={drawerOpen}
            onClose={onCloseDrawer}
          >
            {renderRoomContent}
          </Drawer>
        </>
      ) : (
        <>
          {drawerOpen && (
            <Panel
              id="drawer-panel"
              order={1}
              defaultSize={20}
              minSize={15}
              maxSize={40}
            >
              <div className="h-full border-r border-gray-200 dark:border-gray-700/30">
                {renderRoomContent}
              </div>
            </Panel>
          )}
          {drawerOpen && (
            <PanelResizeHandle className="w-1 bg-transparent hover:bg-gray-300/50 dark:hover:bg-gray-700/50 cursor-ew-resize" />
          )}
        </>
      )}
      <Panel
        id="main-room-panel"
        order={2}
      >
        <div className="flex flex-col w-full h-full relative">
          <GeneralToolbar
            isLoading={isLoading || !initialized.room}
            header={header}
          />
          <Threads />
        </div>
      </Panel>
    </PanelGroup>
  );
};

export default memo(DesktopRoom);
