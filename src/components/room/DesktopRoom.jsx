import { Drawer } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import React, { memo, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useLocation, useHistory } from 'react-router-dom';

import RoomContent from './RoomContent.jsx';
import Threads from './Threads.jsx';
import useResponsive from '../../hooks/useResponsive.js';
import GeneralToolbar from '../../layouts/room/GeneralToolbar.jsx';
import { useWebSocket } from '../../providers/websocket/WebSocketProvider.jsx';
import { checkObjectsEqual } from '../../redux/helpers/memoize';
import {
  selectRoomId,
  selectRoomState,
  setDrawerOpen,
  createNewThread,
  sendMessage,
} from '../../redux/slices/room';
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
  // New personalization options
  tabs = true,
  conversation_history = true,
  members = true,
  settings = true,
  show_close_button = false,
  title = null,
  description = null,
  suggestions = [],
  renderCredits = false,
}) => {
  console.log('renderCredits', renderCredits);
  const { isOpen, subscribe, unsubscribe } = useWebSocket();
  const isSmallScreen = useResponsive('down', 'sm');
  const roomId = useSelector(selectRoomId);
  const { initialized, isLoading, drawerOpen } = useSelector(roomSelector);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (isOpen && roomId) {
      const lastRoomId = roomId;
      subscribe(`room:${roomId}`);
      return () => {
        unsubscribe(`room:${lastRoomId}`);
      };
    }
  }, [isOpen, roomId]);

  // Handle message query parameter
  useEffect(() => {
    if (initialized.room && roomId && location.search) {
      const searchParams = new URLSearchParams(location.search);
      const message = searchParams.get('message');

      if (message) {
        // Create a new thread and send the message
        dispatch(createNewThread())
          .then((threadId) => {
            if (threadId) {
              // Send the message to the new thread
              dispatch(
                sendMessage({
                  threadId,
                  content: decodeURIComponent(message),
                  attachments: [],
                }),
              );
            }
          })
          .catch((error) => {
            console.error('Error creating thread or sending message:', error);
          });

        // Clean up the URL by removing the message parameter
        searchParams.delete('message');
        const newSearch = searchParams.toString();
        history.replace({
          pathname: location.pathname,
          search: newSearch ? `?${newSearch}` : '',
        });
      }
    }
  }, [initialized.room, roomId, location.search, location.pathname, history]);

  const renderRoomContent = <RoomContent className="w-full" />;

  // Mobile layout with toggle
  if (isMobile && previewComponent) {
    return (
      <div className="flex flex-col h-full relative overflow-hidden">
        {/* Show toolbar in preview mode, hide in chat mode */}
        {mobileActiveView !== 'preview' && (
          <GeneralToolbar
            isLoading={isLoading || !initialized.room}
            header={header}
            tabs={tabs}
            conversation_history={conversation_history}
            members={members}
            settings={settings}
            show_close_button={show_close_button}
          />
        )}

        {/* Main content area - remove padding, let absolutely positioned FloatingTextArea handle spacing */}
        <div className="flex-1 relative overflow-hidden">
          {mobileActiveView === 'chat' ? (
            <Threads
              hideInput
              title={title}
              description={description}
              suggestions={suggestions}
            />
          ) : (
            <div
              className="h-full w-full overflow-auto"
              style={{
                paddingBottom: '112px', // Add padding to prevent content being hidden behind floating text area
              }}
            >
              {previewComponent}
            </div>
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
            tabs={tabs}
            conversation_history={conversation_history}
            members={members}
            settings={settings}
            show_close_button={show_close_button}
          />
          <Threads
            title={title}
            description={description}
            suggestions={suggestions}
            renderCredits={renderCredits}
          />
        </div>
      </Panel>
    </PanelGroup>
  );
};

export default memo(DesktopRoom);
