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
  selectRoomStateLoading,
} from '../../redux/slices/room';
import { dispatch, useSelector } from '../../redux/store';

const selectInitializedRoom = selectRoomStateInitialized('room');
const selectLoadingRoom = selectRoomStateLoading('room');

const Room = ({
  roomId,
  // Deprecated: header prop is replaced by granular options
  header = true,
  previewComponent = null,
  isMobile = false,
  mobileActiveView = 'chat',
  // New personalization options
  tabs = false,
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
}) => {
  console.log('Room.renderCredits', renderCredits);
  const history = useHistory();
  const { guest, user, authenticated, loginAsGuest } = useAuthContext();
  const initialized = useSelector(selectInitializedRoom);
  const loading = useSelector(selectLoadingRoom);
  // Check if this is a guest access by detecting iframe context
  const isInIframe = window !== window.parent;
  const isGuestAccess = isInIframe;

  useEffect(() => {
    return () => {
      dispatch(clearRoomState());
    };
  }, [roomId]);

  // Auto-trigger guest authentication if in iframe and not authenticated
  useEffect(() => {
    if (isGuestAccess && !authenticated.guest && !guest) {
      // For iframe guest access, we don't need guestId/agentId from URL anymore
      // The loginAsGuest function will handle requesting auth from parent
      loginAsGuest(null, null)
        .then((guestData) => {
          console.log('🔐 ✅ Guest authentication successful:', guestData);
        })
        .catch((error) => {
          console.error('🔐 ❌ Guest authentication failed:', error);
        });
    } else {
      console.log('🔐 ⏳ Guest authentication not triggered - waiting for conditions');
    }
  }, [isGuestAccess, authenticated.guest, guest, loginAsGuest]);

  const handleFetchRoom = useCallback(() => {
    dispatch(fetchRoom({ roomId, user, guest }))
      .then((response) => {
        if (!response) {
          console.error('❌ No response from fetchRoom, redirecting to 404');
          history.replace('/404');
        } else {
          console.log('✅ Room fetched successfully:', response);
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
            console.error('Authentication error:', error);
            if (isGuestAccess) {
              // Guest auth failed, redirect to error
              console.error('Guest authentication failed, redirecting to 404');
              history.replace('/404');
            }
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
  }, [guest, history, isGuestAccess, roomId, user, authenticated]);

  useEffect(() => {
    if (!!roomId && !initialized) {
      if (isGuestAccess) {
        if (authenticated.guest && guest) {
          handleFetchRoom();
        } else {
          console.log('🏠 ⏳ Waiting for guest authentication...');
          console.log('🏠 ⏳ Has authenticated.guest:', !!authenticated.guest);
          console.log('🏠 ⏳ Has guest prop:', !!guest);
        }
      } else if (!!(user || guest)) {
        handleFetchRoom();
      } else {
        console.log('🏠 ⏳ Waiting for user authentication...');
      }
    } else {
      console.log('🏠 ❌ Conditions not met for room fetch:', {
        hasRoomId: !!roomId,
        notInitialized: !initialized,
      });
    }
  }, [roomId, initialized, handleFetchRoom, isGuestAccess, authenticated.guest, guest, user]);

  if (!initialized || loading) {
    return null;
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
        />
      </VoiceConversationProvider>
      {/* {isMobile() ? <MobileRoom /> : <DesktopRoom />} */}
    </RoomAuthGuard>
  );
};

export default memo(Room);
