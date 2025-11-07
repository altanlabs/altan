import React, { createContext, memo, useContext, useMemo } from 'react';

import { useWebSocketConnection } from './hooks/useWebSocketConnection';
import { useWebSocketSubscriptions } from './hooks/useWebSocketSubscriptions';
import { useAuthContext } from '../../auth/useAuthContext';
import { selectAccountId } from '../../redux/slices/general';
import { selectRoomAccountId } from '../../redux/slices/room';
import { useSelector } from '../../redux/store';

const HermesWebSocketContext = createContext(null);

export const useHermesWebSocket = () => useContext(HermesWebSocketContext);

const HermesWebSocketProvider = ({ children }) => {
  const generalAccountId = useSelector(selectAccountId);
  const roomAccountId = useSelector(selectRoomAccountId);
  const accountId = generalAccountId || roomAccountId;
  const { isAuthenticated, logout, user, guest } = useAuthContext();

  const user_id = user?.id;

  // Create subscription management first to get handleAck
  const subscriptionHook = useWebSocketSubscriptions();

  // Use custom hooks for separation of concerns
  const { wsRef, isOpen, disconnectWebSocket } = useWebSocketConnection({
    isAuthenticated,
    accountId,
    user_id,
    guest,
    logout,
    onAck: subscriptionHook.handleAck,
  });

  // Initialize subscription hook with wsRef
  subscriptionHook.initialize(wsRef, isOpen);

  const memoizedValue = useMemo(
    () => ({
      websocket: wsRef.current,
      isOpen,
      activeSubscriptions: subscriptionHook.activeSubscriptions,
      disconnect: disconnectWebSocket,
      subscribe: subscriptionHook.subscribe,
      unsubscribe: subscriptionHook.unsubscribe,
    }),
    [subscriptionHook, isOpen, disconnectWebSocket, wsRef],
  );

  return (
    <HermesWebSocketContext.Provider value={memoizedValue}>
      {children}
    </HermesWebSocketContext.Provider>
  );
};

export default memo(HermesWebSocketProvider);
