import { useState, useEffect, useCallback, useRef } from 'react';
import { dispatch } from '../../../../redux/store';
import { sendMessage } from '../../../../redux/slices/room/thunks/messageThunks';
import type { AuthorizationData, Connection, ConnectionType } from '../types';

interface UseAuthorizationParams {
  connectionTypeId: string;
  threadId: string;
  connectionsByType: Connection[] | undefined;
  connectionType: ConnectionType | undefined;
}

interface UseAuthorizationReturn {
  isAuthorized: AuthorizationData | null;
  selectedConnectionId: string;
  showCreateNew: boolean;
  handleSelectConnection: (connectionId: string) => void;
  handleCreateNew: () => void;
  handleClearAuthorization: () => void;
  setShowCreateNew: (show: boolean) => void;
}

export function useAuthorization({
  connectionTypeId,
  threadId,
  connectionsByType,
  connectionType,
}: UseAuthorizationParams): UseAuthorizationReturn {
  const storageKey = `altan_auth_${connectionTypeId}_${threadId}`;
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState('');

  // Load authorization from localStorage
  const [isAuthorized, setIsAuthorized] = useState<AuthorizationData | null>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Track connection count for auto-selection
  const previousConnectionCount = useRef(connectionsByType?.length || 0);

  const handleSelectConnection = useCallback(
    (connectionId: string) => {
      const connection = connectionsByType?.find((c) => c.id === connectionId);
      if (!connection) return;

      setSelectedConnectionId(connectionId);

      // Store authorization
      const authData: AuthorizationData = {
        connectionId,
        connectionName: connection.name,
        connectionType: connectionType?.name || '',
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(authData));
      setIsAuthorized(authData);

      // Send message to room
      if (threadId && connectionId) {
        dispatch(
          sendMessage({
            content: `Authorized connection, Connection id is: ${connectionId}`,
            threadId,
          }),
        );
      }
    },
    [threadId, connectionsByType, connectionType, storageKey],
  );

  const handleCreateNew = useCallback(() => {
    setShowCreateNew(true);
  }, []);

  const handleClearAuthorization = useCallback(() => {
    localStorage.removeItem(storageKey);
    setIsAuthorized(null);
    setSelectedConnectionId('');
  }, [storageKey]);

  // Auto-select newest connection when one is created
  useEffect(() => {
    if (connectionsByType && connectionsByType.length > previousConnectionCount.current) {
      const newestConnection = connectionsByType.reduce((newest, connection) => {
        return new Date(connection.date_creation) > new Date(newest.date_creation)
          ? connection
          : newest;
      });
      handleSelectConnection(newestConnection.id);
    }
    previousConnectionCount.current = connectionsByType?.length || 0;
  }, [connectionsByType, handleSelectConnection]);

  return {
    isAuthorized,
    selectedConnectionId,
    showCreateNew,
    handleSelectConnection,
    handleCreateNew,
    handleClearAuthorization,
    setShowCreateNew,
  };
}

