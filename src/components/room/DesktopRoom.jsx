import { Drawer } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import React, { memo, useEffect, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useLocation, useHistory } from 'react-router-dom';

import RoomContent from './RoomContent.jsx';
import Threads from './Threads.jsx';
import useResponsive from '../../hooks/useResponsive.js';
import GeneralToolbar from '../../layouts/room/GeneralToolbar.jsx';
import { useHermesWebSocket } from '../../providers/websocket/HermesWebSocketProvider.jsx';
import { checkObjectsEqual } from '../../redux/helpers/memoize';
import {
  selectRoomId,
  selectRoomState,
  setDrawerOpen,
  sendMessage,
  selectMainThread,
  clearRoomState,
  setRoomContext,
  selectRoomContext,
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
  show_fullscreen_button = false,
  show_sidebar_button = false,
  onFullscreen,
  onSidebar,
  onClose,
  title = null,
  description = null,
  suggestions = [],
  renderCredits = false,
  renderFeedback = false,
  initialMessage = null,
  show_mode_selector = false,
  ephemeral_mode = false,
}) => {
  const { isOpen, subscribe, unsubscribe } = useHermesWebSocket();

  const isSmallScreen = useResponsive('down', 'sm');
  const roomId = useSelector(selectRoomId);
  const { initialized, isLoading, drawerOpen } = useSelector(roomSelector);
  // const drawer = useSelector(selectThreadDrawerDetails);
  // const threadsById = useSelector(selectThreadsById);
  // const threadMain = useSelector(selectRoomThreadMain);
  const mainThreadId = useSelector(selectMainThread);
  const location = useLocation();
  const history = useHistory();

  // Track processed thread_id from URL to avoid loops
  const processedThreadIdRef = useRef(null);

  // Track previous roomId to detect room switches
  const prevRoomIdRef = useRef(null);

  // Track if initialMessage has been sent to avoid duplicates
  const initialMessageSentRef = useRef(false);

  // Track if this is initial page load to clear thread_id from URL
  const isInitialLoadRef = useRef(true);

  // Get room context from Redux store
  const roomContext = useSelector(selectRoomContext);

  // Clear old room state when switching to a new room - MUST happen AFTER WebSocket unsubscribe
  useEffect(() => {
    if (prevRoomIdRef.current !== null && prevRoomIdRef.current !== roomId) {
      // RoomId changed - clear the old room's state
      // This runs AFTER the previous effect's cleanup (which unsubscribes from WebSocket)
      dispatch(clearRoomState());
    }
    prevRoomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    if (isOpen && roomId) {
      const lastRoomId = roomId;
      subscribe(`room:${roomId}`);
      return () => {
        // Unsubscribe from old room BEFORE state is cleared
        unsubscribe(`room:${lastRoomId}`);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, roomId]);

  // Extract and store context from URL on room initialization
  useEffect(() => {
    if (initialized.room && roomId) {
      const searchParams = new URLSearchParams(location.search);
      const context = searchParams.get('context');

      if (context && !roomContext) {
        console.log('🔧 Setting room context:', decodeURIComponent(context));
        // Store the context in Redux for use in all messages
        dispatch(setRoomContext(decodeURIComponent(context)));

        // Clean up the URL by removing the context parameter
        searchParams.delete('context');
        const newSearch = searchParams.toString();
        history.replace({
          pathname: location.pathname,
          search: newSearch ? `?${newSearch}` : '',
        });
      }
    }
  }, [initialized.room, roomId, location.search, location.pathname, history, roomContext]);

  // Handle message query parameter
  useEffect(() => {
    if (initialized.room && roomId && mainThreadId && location.search) {
      const searchParams = new URLSearchParams(location.search);
      const message = searchParams.get('message');

      if (message) {
        // Prepare the message content
        let messageContent = decodeURIComponent(message);

        // Append context as hidden content if available
        if (roomContext) {
          messageContent += `\n<hide>${roomContext}</hide>`;
        }

        // Send the message to the MAIN thread (not a new thread)
        // This keeps things simple for new users
        dispatch(
          sendMessage({
            threadId: mainThreadId,
            content: messageContent,
            attachments: [],
          }),
        );

        // Clean up the URL by removing the message parameter
        searchParams.delete('message');
        const newSearch = searchParams.toString();
        history.replace({
          pathname: location.pathname,
          search: newSearch ? `?${newSearch}` : '',
        });
      }
    }
  }, [
    initialized.room,
    roomId,
    mainThreadId,
    location.search,
    location.pathname,
    history,
    roomContext,
  ]);

  // Handle initialMessage prop (for embedded rooms)
  useEffect(() => {
    if (
      initialized.room &&
      roomId &&
      initialMessage &&
      mainThreadId &&
      !initialMessageSentRef.current
    ) {
      // Mark as sent to avoid duplicates
      initialMessageSentRef.current = true;

      // Prepare the message content
      let messageContent = initialMessage;

      // Append context as hidden content if available
      if (roomContext) {
        messageContent += `\n<hide>${roomContext}</hide>`;
      }

      // Send the message to the main thread
      dispatch(
        sendMessage({
          threadId: mainThreadId,
          content: messageContent,
          attachments: [],
        }),
      );
    }
  }, [initialized.room, roomId, initialMessage, mainThreadId, roomContext]);

  // Reset the sent flag when roomId changes
  useEffect(() => {
    initialMessageSentRef.current = false;
  }, [roomId]);

  // Clear thread_id from URL on initial page load to ensure users always start at main thread
  useEffect(() => {
    if (!initialized.room || !roomId) return;

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;

      const searchParams = new URLSearchParams(location.search);
      const hasThreadId = searchParams.has('thread_id');

      if (hasThreadId) {
        // Remove thread_id from URL on page reload to prevent sending messages to wrong thread
        searchParams.delete('thread_id');
        const newSearch = searchParams.toString();
        history.replace({
          pathname: location.pathname,
          search: newSearch ? `?${newSearch}` : '',
        });
        processedThreadIdRef.current = null;
      }
    }
  }, [initialized.room, roomId, location.pathname, location.search, history]);

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
            show_fullscreen_button={show_fullscreen_button}
            show_sidebar_button={show_sidebar_button}
            onFullscreen={onFullscreen}
            onSidebar={onSidebar}
            onClose={onClose}
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
              renderFeedback={renderFeedback}
              renderCredits={renderCredits}
              show_mode_selector={show_mode_selector}
              ephemeral_mode={ephemeral_mode}
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
            show_fullscreen_button={show_fullscreen_button}
            show_sidebar_button={show_sidebar_button}
            onFullscreen={onFullscreen}
            onSidebar={onSidebar}
            onClose={onClose}
          />
          <Threads
            title={title}
            description={description}
            suggestions={suggestions}
            renderCredits={renderCredits}
            renderFeedback={renderFeedback}
            show_mode_selector={show_mode_selector}
            ephemeral_mode={ephemeral_mode}
          />
        </div>
      </Panel>
    </PanelGroup>
  );
};

export default memo(DesktopRoom);
