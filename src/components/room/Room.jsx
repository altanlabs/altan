import React, { memo, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import DesktopRoom from './DesktopRoom.jsx';
import RoomAuthGuard from '../../auth/room/RoomAuthGuard.jsx';
import { useAuthContext } from '../../auth/useAuthContext';
import { VoiceConversationProvider } from '../../providers/voice/VoiceConversationProvider.jsx';
import {
  fetchRoom,
  clearRoomState,
  selectRoomStateInitialized,
  // selectRoomStateLoading, // Not needed - let DesktopRoom handle loading
} from '../../redux/slices/room';
import { dispatch, useSelector } from '../../redux/store';

const selectInitializedRoom = selectRoomStateInitialized('room');
// const selectLoadingRoom = selectRoomStateLoading('room'); // Not needed

const Room = ({
  roomId,
  // Deprecated: header prop is replaced by granular options
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
  title = null, // Custom title to override 'room.howCanIHelp'
  description = null, // Description to show below title
  suggestions = [], // Array of suggestion strings
  voice_enabled = null, // Boolean to override room.policy.voice_enabled
  renderCredits = false,
  renderFeedback = false,
  initialMessage = null, // Initial message to send when room loads
  show_mode_selector = false, // Boolean to show/hide the mode selector (auto/instant/plan)
}) => {
  const history = useHistory();
  const { guest, user } = useAuthContext();
  const initialized = useSelector(selectInitializedRoom);
  // const loading = useSelector(selectLoadingRoom); // Not needed - let DesktopRoom handle loading

  // Clean up when roomId changes or on unmount
  useEffect(() => {
    // Clear state when roomId changes
    return () => {
      dispatch(clearRoomState());
    };
  }, [roomId]);

  const handleFetchRoom = useCallback(() => {
    dispatch(fetchRoom({ roomId, user, guest }))
      .then((response) => {
        if (!response) {
          console.error('🏠 ❌ Room fetch returned no data');
          history.replace('/404');
        } else {
          console.log('🏠 ✅ Room fetch successful:', response);
        }
      })
      .catch((error) => {
        console.error('❌ Room fetch error:', {
          error,
          status: error.response?.status || error?.status,
          message: error.message,
          responseData: error.response?.data,
        });
        const statusCode = error.response?.status || error?.status;
        switch (statusCode) {
          case 401:
            console.error('🏠 ❌ Authentication error - axios might not have auth headers set yet');
            // Don't redirect on 401 - might just be a timing issue
            // The interceptor will retry with refreshed token
            break;
          case 404:
            history.replace('/404');
            break;
          case 403:
            history.push(`/room/${roomId}/access`);
            break;
          default:
            console.error('Error fetching room:', error);
        }
      });
  }, [guest, history, roomId, user]);

  useEffect(() => {
    if (!!roomId && !initialized) {
      if (!!(user || guest)) {
        console.log('🏠 ✅ Fetching room data...', { roomId, hasUser: !!user, hasGuest: !!guest });
        handleFetchRoom();
      } else {
        console.log('🏠 ⏳ Waiting for user authentication...');
      }
    } else if (!roomId) {
      console.log('🏠 ❌ No roomId provided');
    } else if (initialized) {
      console.log('🏠 ✅ Room already initialized');
    }
  }, [roomId, initialized, handleFetchRoom, guest, user]);

  // Only return null if there's no roomId at all
  if (!roomId) {
    return null;
  }

  // Show loading state while room is initializing
  // This prevents blank screens while waiting for fetch to complete
  if (!initialized) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.5,
        }}
      >
        {/* Empty loading state - could add spinner here if needed */}
      </div>
    );
  }

  return (
    <RoomAuthGuard>
      <VoiceConversationProvider voiceEnabled={voice_enabled}>
        <DesktopRoom
          header={header}
          previewComponent={previewComponent}
          isMobile={isMobile}
          mobileActiveView={mobileActiveView}
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
          title={title}
          description={description}
          suggestions={suggestions}
          renderCredits={renderCredits}
          renderFeedback={renderFeedback}
          initialMessage={initialMessage}
          show_mode_selector={show_mode_selector}
        />
      </VoiceConversationProvider>
    </RoomAuthGuard>
  );
};

export default memo(Room);
