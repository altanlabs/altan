import React, { memo, useEffect, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

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
  const { guest, user, authenticated } = useAuthContext();
  const location = useLocation();
  const initialized = useSelector(selectInitializedRoom);
  const loading = useSelector(selectLoadingRoom);
  // Check if this is a guest access via URL parameter
  const searchParams = new URLSearchParams(location.search);
  const guestId = searchParams.get('guest_id');
  const isGuestAccess = !!guestId;

  useEffect(() => {
    return () => {
      dispatch(clearRoomState());
    };
  }, [roomId]);

  const handleFetchRoom = useCallback(() => {
    console.log('handleFetchRoom');
    console.log("user", user);
    console.log("guest", guest);

    dispatch(fetchRoom({ roomId, user, guest }))
      .then((response) => !response && history.replace('/404'))
      .catch((error) => {
        const statusCode = error.response?.status || error?.status;
        switch (statusCode) {
          case 401:
            console.error('Authentication error:', error);
            if (isGuestAccess) {
              // Guest auth failed, redirect to error
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
  }, [guest, history, isGuestAccess, roomId, user]);

  useEffect(() => {
    if (!!roomId && !initialized) {
      if (isGuestAccess) {
        if (authenticated.guest && guest) {
          handleFetchRoom();
        } else {
        }
      } else if (!!(user || guest)) {
        // For regular user/member access
        handleFetchRoom();
      } else {
      }
    } else {
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
