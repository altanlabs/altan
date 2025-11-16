import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuthContext } from '../../../auth/useAuthContext';
import { fetchRoom } from '../../../redux/slices/room/thunks/roomThunks';
import { store, useSelector } from '../../../redux/store';
import type { RoomInitState } from '../types/room.types';

/**
 * Room initialization hook
 * Fetches room data and tracks loading/initialized/error states
 */
export function useRoomInitialization(roomId: string): RoomInitState {
  const history = useHistory();
  const { user, isInitialized: authInitialized } = useAuthContext();
  
  // Redux state - access nested structure directly
  const initialized = useSelector((state) => state.room._ui?.initialized?.room ?? false);
  const loading = useSelector((state) => state.room._ui?.loading?.room ?? false);
  
  // Local error state for UI-specific error handling
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip if auth hasn't initialized yet
    if (!authInitialized) {
      return;
    }

    // Skip if no required data or already initialized/loading
    if (!roomId || !user || initialized || loading) {
      return;
    }

    setError(null);

    // Dispatch the thunk and handle errors
    store.dispatch(fetchRoom({ roomId, user }) as any)
      .catch((err: any) => {
        const statusCode = err.response?.status || err?.status;

        // Handle specific error codes
        if (statusCode === 404) {
          history.replace('/404');
        } else if (statusCode === 403) {
          history.push(`/room/${roomId}/access`);
        } else if (statusCode !== 401) {
          // Don't show error for 401 (auth retry in progress)
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user, initialized, loading, authInitialized]);

  return {
    initialized,
    loading,
    error,
  };
}

