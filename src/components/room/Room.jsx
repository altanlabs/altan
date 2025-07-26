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
  header = true,
  previewComponent = null,
  isMobile = false,
  mobileActiveView = 'chat',
}) => {
  const history = useHistory();
  const { guest, user, authenticated, loginAsGuest } = useAuthContext();
  console.log("guest", guest);
  console.log("user", user);
  console.log("authenticated", authenticated);
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
    console.log('🔐 === GUEST AUTH TRIGGER EFFECT ===');
    console.log('🔐 IsGuestAccess:', isGuestAccess);
    console.log('🔐 Authenticated guest:', !!authenticated.guest);
    console.log('🔐 Guest prop:', !!guest);
    console.log('🔐 Should trigger auth?', isGuestAccess && !authenticated.guest && !guest);
    
    if (isGuestAccess && !authenticated.guest && !guest) {
      console.log('🔐 ✅ Auto-triggering guest authentication for iframe');
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
    console.log('📡 Attempting to fetch room:', {
      roomId,
      hasUser: !!user,
      hasGuest: !!guest,
      isGuestAccess,
      authenticatedUser: authenticated.user,
      authenticatedGuest: authenticated.guest,
      authenticatedMember: authenticated.member,
    });

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
    console.log('🏠 === ROOM FETCH EFFECT ===');
    console.log('🏠 RoomId:', roomId);
    console.log('🏠 Initialized:', initialized);
    console.log('🏠 IsGuestAccess:', isGuestAccess);
    console.log('🏠 Authenticated guest:', !!authenticated.guest);
    console.log('🏠 Guest prop:', !!guest);
    console.log('🏠 User:', !!user);
    
    if (!!roomId && !initialized) {
      if (isGuestAccess) {
        if (authenticated.guest && guest) {
          console.log('🏠 ✅ Guest authentication ready - fetching room');
          handleFetchRoom();
        } else {
          console.log('🏠 ⏳ Waiting for guest authentication...');
          console.log('🏠 ⏳ Has authenticated.guest:', !!authenticated.guest);
          console.log('🏠 ⏳ Has guest prop:', !!guest);
        }
      } else if (!!(user || guest)) {
        // For regular user/member access
        console.log('🏠 ✅ User authentication ready - fetching room');
        handleFetchRoom();
      } else {
        console.log('🏠 ⏳ Waiting for user authentication...');
      }
    } else {
      console.log('🏠 ❌ Conditions not met for room fetch:', {
        hasRoomId: !!roomId,
        notInitialized: !initialized
      });
    }
  }, [roomId, initialized, handleFetchRoom, isGuestAccess, authenticated.guest, guest, user]);

  if (!initialized || loading) {
    return null;
  }

  return (
    <RoomAuthGuard>
      <VoiceConversationProvider>
        <DesktopRoom
          header={header}
          previewComponent={previewComponent}
          isMobile={isMobile}
          mobileActiveView={mobileActiveView}
        />
      </VoiceConversationProvider>
      {/* {isMobile() ? <MobileRoom /> : <DesktopRoom />} */}
    </RoomAuthGuard>
  );
};

export default memo(Room);
