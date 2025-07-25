/**
 * React Hooks for Altan AI SDK
 * Provides easy integration with React applications
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AltanSDK, AltanConfig, GuestData, RoomData, AuthTokens, AltanEventMap } from './altan-sdk';

/**
 * Hook to create and manage an Altan SDK instance
 */
export function useAltanSDK(config: AltanConfig) {
  const sdkRef = useRef<AltanSDK | null>(null);
  
  if (!sdkRef.current) {
    sdkRef.current = new AltanSDK(config);
  }

  return sdkRef.current;
}

/**
 * Hook to manage authentication state
 */
export function useAltanAuth(sdk: AltanSDK) {
  const [authState, setAuthState] = useState(() => sdk.getAuthState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleAuthSuccess = ({ guest, tokens }: { guest: GuestData; tokens: AuthTokens }) => {
      setAuthState({ guest, tokens, isAuthenticated: true });
      setError(null);
      setIsLoading(false);
    };

    const handleAuthRefresh = ({ tokens }: { tokens: AuthTokens }) => {
      setAuthState(prev => ({ ...prev, tokens }));
      setError(null);
    };

    const handleAuthError = ({ error }: { error: Error }) => {
      setError(error);
      setIsLoading(false);
    };

    sdk.on('auth:success', handleAuthSuccess);
    sdk.on('auth:refresh', handleAuthRefresh);
    sdk.on('auth:error', handleAuthError);

    return () => {
      sdk.off('auth:success', handleAuthSuccess);
      sdk.off('auth:refresh', handleAuthRefresh);
      sdk.off('auth:error', handleAuthError);
    };
  }, [sdk]);

  const authenticate = useCallback(async (guestId: string, accountId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.authenticateGuest(guestId, accountId);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, [sdk]);

  const refreshTokens = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.refreshTokens();
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, [sdk]);

  const clearAuth = useCallback(() => {
    sdk.clearAuth();
    setAuthState({ guest: null, tokens: null, isAuthenticated: false });
    setError(null);
  }, [sdk]);

  return {
    ...authState,
    isLoading,
    error,
    authenticate,
    refreshTokens,
    clearAuth,
  };
}

/**
 * Hook to manage chat rooms
 */
export function useAltanRoom(sdk: AltanSDK) {
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(() => sdk.getStoredRoom());
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleRoomCreated = ({ room }: { room: RoomData }) => {
      setCurrentRoom(room);
      setError(null);
      setIsCreating(false);
    };

    const handleError = ({ error }: { error: Error }) => {
      setError(error);
      setIsCreating(false);
    };

    sdk.on('room:created', handleRoomCreated);
    sdk.on('error', handleError);

    return () => {
      sdk.off('room:created', handleRoomCreated);
      sdk.off('error', handleError);
    };
  }, [sdk]);

  const createRoom = useCallback(async (guestInfo?: Partial<GuestData>) => {
    setIsCreating(true);
    setError(null);
    try {
      const { room, tokens } = await sdk.createRoom(guestInfo);
      return { room, tokens };
    } catch (err) {
      setError(err as Error);
      setIsCreating(false);
      throw err;
    }
  }, [sdk]);

  const getRoomUrl = useCallback((roomId?: string) => {
    const id = roomId || currentRoom?.room_id;
    return id ? sdk.getRoomUrl(id) : null;
  }, [sdk, currentRoom]);

  return {
    currentRoom,
    isCreating,
    error,
    createRoom,
    getRoomUrl,
  };
}

/**
 * Hook to listen to specific SDK events
 */
export function useAltanEvent<T extends keyof AltanEventMap>(
  sdk: AltanSDK,
  event: T,
  handler: (data: AltanEventMap[T]) => void
) {
  useEffect(() => {
    sdk.on(event, handler);
    return () => sdk.off(event, handler);
  }, [sdk, event, handler]);
}

/**
 * Hook for connection status
 */
export function useAltanConnection(sdk: AltanSDK) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnectionStatus = ({ connected }: { connected: boolean }) => {
      setIsConnected(connected);
    };

    sdk.on('connection:status', handleConnectionStatus);
    return () => sdk.off('connection:status', handleConnectionStatus);
  }, [sdk]);

  return isConnected;
}

/**
 * Combined hook for easier setup
 */
export function useAltan(config: AltanConfig) {
  const sdk = useAltanSDK(config);
  const auth = useAltanAuth(sdk);
  const room = useAltanRoom(sdk);
  const isConnected = useAltanConnection(sdk);

  const initialize = useCallback(async (guestInfo?: Partial<GuestData>) => {
    try {
      // Check for existing room first
      if (room.currentRoom && auth.isAuthenticated) {
        return { room: room.currentRoom, tokens: auth.tokens! };
      }

      // Create new room and authenticate
      return await room.createRoom(guestInfo);
    } catch (error) {
      console.error('Failed to initialize Altan:', error);
      throw error;
    }
  }, [room, auth]);

  return {
    sdk,
    auth,
    room,
    isConnected,
    initialize,
  };
} 