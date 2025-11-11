import { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuthContext } from '../../../auth/useAuthContext';
import { fetchRoom, selectRoomStateInitialized } from '../../../redux/slices/room';
import { dispatch, useSelector } from '../../../redux/store';
import type { RoomInitState } from '../types/room.types';

/**
 * Single hook to handle ALL room initialization
 * Replaces multiple scattered useEffects in old code
 */
export function useRoomInitialization(roomId: string): RoomInitState {
  const history = useHistory();
  const { guest, user } = useAuthContext();
  const initialized = useSelector(selectRoomStateInitialized('room'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handleFetchRoom = useCallback(() => {
    if (!roomId || !( user || guest)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    dispatch(fetchRoom({ roomId, user, guest }))
      .then((response) => {
        if (!response) {
          throw new Error('Room fetch returned no data');
        }
        setLoading(false);
      })
      .catch((err) => {
        const statusCode = err.response?.status || err?.status;
        
        switch (statusCode) {
          case 401:
            // Don't redirect on 401 - might just be timing issue
            // The interceptor will retry with refreshed token
            setError(new Error('Authentication error'));
            break;
          case 404:
            history.replace('/404');
            break;
          case 403:
            history.push(`/room/${roomId}/access`);
            break;
          default:
            setError(err);
        }
        
        setLoading(false);
      });
  }, [roomId, user, guest, history]);

  useEffect(() => {
    if (roomId && !initialized && (user || guest)) {
      handleFetchRoom();
    }
  }, [roomId, initialized, user, guest, handleFetchRoom]);

  return {
    initialized,
    loading,
    error,
  };
}

