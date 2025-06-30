import React, { memo, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

import { isMobile } from './utils';
import RoomAuthGuard from '../../auth/room/RoomAuthGuard.jsx';
import { useAuthContext } from '../../auth/useAuthContext';
import {
  fetchRoom,
  clearRoomState,
  selectRoomStateInitialized,
  selectRoomStateLoading,
} from '../../redux/slices/room';
import { dispatch, useSelector } from '../../redux/store';

import DesktopRoom from './DesktopRoom.jsx';

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

const Room = ({ roomId, header = true }) => {
  const navigate = useNavigate();
  const { guest, user } = useAuthContext();

  const initialized = useSelector(selectInitializedRoom);
  const loading = useSelector(selectLoadingRoom);

  useEffect(() => {
    return () => {
      dispatch(clearRoomState());
    };
  }, [roomId]);

  const handleFetchRoom = useCallback(() => {
    dispatch(fetchRoom({ roomId, user, guest }))
      .then((response) => !response && navigate('/404', { replace: true }))
      .catch((error) => {
        const statusCode = error.response?.status || error?.status;
        switch (statusCode) {
          case 401:
            break;
          case 404:
            navigate('/404');
            break;
          case 403:
            navigate(`/room/${roomId}/access`);
            break;
          default:
            console.error('Error fetching gate room:', error);
        }
      });
  }, [guest, navigate, roomId, user]);

  useEffect(() => {
    if (!!roomId && !initialized && !!(user || guest)) {
      handleFetchRoom();
    }
  }, [roomId, initialized]);

  if (!initialized || loading) {
    return null;
  }

  return (
    <RoomAuthGuard>
      <DesktopRoom header={header} />
      {/* {isMobile() ? <MobileRoom /> : <DesktopRoom />} */}
    </RoomAuthGuard>
  );
};

export default memo(Room);
