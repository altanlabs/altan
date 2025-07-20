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

// import AltanLogo from '../loaders/AltanLogo.jsx';

// const AltanLogoFixed = (
//   <AltanLogo
//     wrapped
//     fixed
//   />
// );

// eslint-disable-next-line react/display-name
// const Loadable = (Component) => (props) => (
//   <Suspense fallback={AltanLogoFixed}>
//     <Component {...props} />
//   </Suspense>
// );

// const MobileRoom = Loadable(lazy(() => import('./MobileRoom.jsx')));
// const DesktopRoom = Loadable(lazy(() => import('./DesktopRoom.jsx')));

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
  const { guest, user } = useAuthContext();
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
    // For guest access, create a mock guest object to satisfy the fetchRoom function
    const guestObj = isGuestAccess ? { id: guestId, member: { id: guestId } } : guest;

    dispatch(fetchRoom({ roomId, user, guest: guestObj }))
      .then((response) => !response && history.replace('/404'))
      .catch((error) => {
        const statusCode = error.response?.status || error?.status;
        switch (statusCode) {
          case 401:
            // For guest access, ignore 401 errors as auth is handled differently
            if (!isGuestAccess) {
              console.error('Authentication error for user:', error);
            }
            break;
          case 404:
            history.replace('/404');
            break;
          case 403:
            history.push(`/room/${roomId}/access`);
            break;
          default:
            console.error('Error fetching gate room:', error);
        }
      });
  }, [guest, guestId, history, isGuestAccess, roomId, user]);

  useEffect(() => {
    if (!!roomId && !initialized && (!!(user || guest) || isGuestAccess)) {
      handleFetchRoom();
    }
  }, [roomId, initialized, handleFetchRoom]);

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
