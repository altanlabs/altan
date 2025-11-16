import React, { createContext, memo, useContext, useMemo, type ReactNode } from 'react';

import { useWebSocketConnection } from './hooks/useWebSocketConnection';
import { useWebSocketSubscriptions } from './hooks/useWebSocketSubscriptions';
import type { HermesWebSocketContextValue } from './types';
import { useAuthContext } from '../../auth/useAuthContext';
import { selectAccountId } from '../../redux/slices/general/index';
import { selectRoomAccountId } from '../../redux/slices/room/selectors/roomSelectors';
import { useSelector } from '../../redux/store';

const HermesWebSocketContext = createContext<HermesWebSocketContextValue | null>(null);

export const useHermesWebSocket = (): HermesWebSocketContextValue => {
  const context = useContext(HermesWebSocketContext);
  if (!context) {
    throw new Error('useHermesWebSocket must be used within HermesWebSocketProvider');
  }
  return context;
};

interface HermesWebSocketProviderProps {
  children: ReactNode;
}

const HermesWebSocketProvider: React.FC<HermesWebSocketProviderProps> = ({ children }) => {
  const generalAccountId = useSelector(selectAccountId);
  const roomAccountId = useSelector(selectRoomAccountId);
  // Convert (string | undefined) to (string | null)
  const accountId: string | null = generalAccountId || roomAccountId || null;
  const { isAuthenticated, logout, user } = useAuthContext();

  // Convert user?.id (string | undefined) to user_id (string | null)
  const user_id: string | null = user?.id ?? null;

  // Create subscription management first to get handleAck
  const { initialize, handleAck, subscribe, unsubscribe, activeSubscriptions } = useWebSocketSubscriptions();

  // Create explicit non-async wrapper for handleAck
  const onAck = React.useCallback(() => {
    handleAck();
    return;
  }, [handleAck]);

  // Use custom hooks for separation of concerns
  /* eslint-disable */
  const { wsRef, isOpen, disconnectWebSocket } = useWebSocketConnection({
    isAuthenticated,
    accountId,
    user_id,
    logout,
    onAck,
  });
  /* eslint-enable */

  // Initialize subscription hook with wsRef
  initialize(wsRef, isOpen);

  const memoizedValue = useMemo<HermesWebSocketContextValue>(
    () => ({
      websocket: wsRef.current,
      isOpen,
      activeSubscriptions,
      disconnect: disconnectWebSocket,
      subscribe,
      unsubscribe,
    }),
    [activeSubscriptions, isOpen, disconnectWebSocket, wsRef, subscribe, unsubscribe],
  );

  return (
    <HermesWebSocketContext.Provider value={memoizedValue}>
      {children}
    </HermesWebSocketContext.Provider>
  );
};

export default memo(HermesWebSocketProvider);

