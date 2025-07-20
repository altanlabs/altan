import { memo, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useLocation } from 'react-router-dom';

import Room from '../components/room/Room.jsx';
import { selectRoomAttribute } from '../redux/slices/room';
import { useSelector } from '../redux/store';
import { optimai_root } from '../utils/axios';

const selectRoomName = selectRoomAttribute('name');
const selectRoomDescription = selectRoomAttribute('description');

const StandaloneRoomPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const roomName = useSelector(selectRoomName);
  const roomDescription = useSelector(selectRoomDescription);
  
  const [guestAuthStatus, setGuestAuthStatus] = useState('checking');

  // Extract guest_id from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const guestId = searchParams.get('guest_id');

  // Handle guest authentication if guest_id is present
  useEffect(() => {
    const authenticateGuest = async () => {
      if (!guestId) {
        setGuestAuthStatus('none');
        return;
      }

      try {
        console.log('Authenticating guest:', guestId);
        const response = await optimai_root.post(`/auth/login/guest?guest_id=${guestId}`, {}, {
          withCredentials: true,
        });

        console.log('Guest authentication successful:', response.data);
        setGuestAuthStatus('authenticated');
      } catch (error) {
        console.error('Guest authentication failed:', error);
        setGuestAuthStatus('failed');
      }
    };

    authenticateGuest();
  }, [guestId]);

  // Show loading while authenticating guest
  if (guestId && guestAuthStatus === 'checking') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '16px',
        }}
      >
        Connecting to chat...
      </div>
    );
  }

  // Show error if guest authentication failed
  if (guestId && guestAuthStatus === 'failed') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '16px',
          color: 'red',
        }}
      >
        Failed to connect to chat. Please try again.
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{roomName}</title>
        <meta
          name="description"
          content={roomDescription}
        />
      </Helmet>

      <Room
        key={roomId}
        roomId={roomId}
      />
    </>
  );
};
export default memo(StandaloneRoomPage);
