/**
 * React Hooks for Altan AI SDK
 * Account-centric hooks for the modular SDK
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { AltanSDK, AltanSDKConfig, GuestData, RoomData, AuthTokens, CreateGuestRequest, AltanEventMap } from './altan-sdk';

/**
 * Hook to create and manage an Altan SDK instance
 */
export function useAltanSDK(config: AltanSDKConfig): AltanSDK {
  const sdkRef = useRef<AltanSDK | null>(null);
  
  if (!sdkRef.current) {
    sdkRef.current = new AltanSDK(config);
  }

  return sdkRef.current;
}

/**
 * Hook to manage guest operations
 */
export function useAltanGuest(sdk: AltanSDK): {
  currentGuest: GuestData | null;
  isLoading: boolean;
  error: Error | null;
  createGuest: (guestInfo?: CreateGuestRequest) => Promise<GuestData>;
  updateGuest: (guestId: string, updates: Partial<CreateGuestRequest>) => Promise<GuestData>;
  getGuestByExternalId: (externalId: string) => Promise<GuestData>;
} {
  const [currentGuest, setCurrentGuest] = useState<GuestData | null>(() => sdk.getStoredGuest());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleGuestCreated = ({ guest }: { guest: GuestData }): void => {
      setCurrentGuest(guest);
      setError(null);
      setIsLoading(false);
    };

    const handleGuestUpdated = ({ guest }: { guest: GuestData }): void => {
      setCurrentGuest(guest);
      setError(null);
      setIsLoading(false);
    };

    const handleError = ({ error }: { error: Error }): void => {
      setError(error);
      setIsLoading(false);
    };

    sdk.on('guest:created', handleGuestCreated);
    sdk.on('guest:updated', handleGuestUpdated);
    sdk.on('error', handleError);

    return () => {
      sdk.off('guest:created', handleGuestCreated);
      sdk.off('guest:updated', handleGuestUpdated);
      sdk.off('error', handleError);
    };
  }, [sdk]);

  const createGuest = useCallback(async (guestInfo: CreateGuestRequest = {}): Promise<GuestData> => {
    setIsLoading(true);
    setError(null);
    try {
      const guest = await sdk.createGuest(guestInfo);
      return guest;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }, [sdk]);

  const updateGuest = useCallback(async (guestId: string, updates: Partial<CreateGuestRequest>): Promise<GuestData> => {
    setIsLoading(true);
    setError(null);
    try {
      const guest = await sdk.updateGuest(guestId, updates);
      return guest;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }, [sdk]);

  const getGuestByExternalId = useCallback(async (externalId: string): Promise<GuestData> => {
    setIsLoading(true);
    setError(null);
    try {
      const guest = await sdk.getGuestByExternalId(externalId);
      setCurrentGuest(guest);
      return guest;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }, [sdk]);

  return {
    currentGuest,
    isLoading,
    error,
    createGuest,
    updateGuest,
    getGuestByExternalId,
  };
}

/**
 * Hook to manage authentication
 */
export function useAltanAuth(sdk: AltanSDK): {
  tokens: AuthTokens | null;
  authenticatedGuest: GuestData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  authenticate: (guestId: string) => Promise<AuthTokens>;
  refreshTokens: () => Promise<AuthTokens>;
  clearAuth: () => void;
} {
  const [tokens, setTokens] = useState<AuthTokens | null>(() => sdk.getStoredTokens());
  const [authenticatedGuest, setAuthenticatedGuest] = useState<GuestData | null>(() => sdk.getStoredGuest());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!sdk.getStoredTokens());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleAuthSuccess = ({ guest, tokens }: { guest: GuestData; tokens: AuthTokens }): void => {
      setTokens(tokens);
      setAuthenticatedGuest(guest);
      setIsAuthenticated(true);
      setError(null);
      setIsLoading(false);
    };

    const handleAuthRefresh = ({ tokens }: { tokens: AuthTokens }): void => {
      setTokens(tokens);
      setError(null);
    };

    const handleAuthError = ({ error }: { error: Error }): void => {
      setError(error);
      setIsLoading(false);
      setIsAuthenticated(false);
      setTokens(null);
      setAuthenticatedGuest(null);
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

  const authenticate = useCallback(async (guestId: string): Promise<AuthTokens> => {
    setIsLoading(true);
    setError(null);
    try {
      const tokens = await sdk.authenticateGuest(guestId);
      return tokens;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }, [sdk]);

  const refreshTokens = useCallback(async (): Promise<AuthTokens> => {
    setIsLoading(true);
    setError(null);
    try {
      const tokens = await sdk.refreshTokens();
      return tokens;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }, [sdk]);

  const clearAuth = useCallback((): void => {
    sdk.clearAuth();
    setTokens(null);
    setAuthenticatedGuest(null);
    setIsAuthenticated(false);
    setError(null);
  }, [sdk]);

  return {
    tokens,
    authenticatedGuest,
    isAuthenticated,
    isLoading,
    error,
    authenticate,
    refreshTokens,
    clearAuth,
  };
}

/**
 * Hook to manage rooms
 */
export function useAltanRoom(sdk: AltanSDK): {
  currentRoom: RoomData | null;
  isCreating: boolean;
  isJoining: boolean;
  error: Error | null;
  createRoom: (guestId: string, agentId: string) => Promise<RoomData>;
  joinRoom: (roomId: string, guestId: string) => Promise<void>;
  getRoomUrl: (roomId?: string) => string | null;
} {
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleRoomCreated = ({ room }: { room: RoomData }): void => {
      setCurrentRoom(room);
      setError(null);
      setIsCreating(false);
    };

    const handleRoomJoined = ({ roomId }: { roomId: string; guestId: string }): void => {
      setError(null);
      setIsJoining(false);
      // Note: We don't have room data from join, could fetch if needed
    };

    const handleError = ({ error }: { error: Error }): void => {
      setError(error);
      setIsCreating(false);
      setIsJoining(false);
    };

    sdk.on('room:created', handleRoomCreated);
    sdk.on('room:joined', handleRoomJoined);
    sdk.on('error', handleError);

    return () => {
      sdk.off('room:created', handleRoomCreated);
      sdk.off('room:joined', handleRoomJoined);
      sdk.off('error', handleError);
    };
  }, [sdk]);

  const createRoom = useCallback(async (guestId: string, agentId: string): Promise<RoomData> => {
    setIsCreating(true);
    setError(null);
    try {
      const room = await sdk.createRoom(guestId, agentId);
      return room;
    } catch (err) {
      setError(err as Error);
      setIsCreating(false);
      throw err;
    }
  }, [sdk]);

  const joinRoom = useCallback(async (roomId: string, guestId: string): Promise<void> => {
    setIsJoining(true);
    setError(null);
    try {
      await sdk.joinRoom(roomId, guestId);
    } catch (err) {
      setError(err as Error);
      setIsJoining(false);
      throw err;
    }
  }, [sdk]);

  const getRoomUrl = useCallback((roomId?: string): string | null => {
    const id = roomId || currentRoom?.room_id;
    return id ? sdk.getRoomUrl(id) : null;
  }, [sdk, currentRoom]);

  return {
    currentRoom,
    isCreating,
    isJoining,
    error,
    createRoom,
    joinRoom,
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
): void {
  useEffect(() => {
    sdk.on(event, handler);
    return () => sdk.off(event, handler);
  }, [sdk, event, handler]);
}

/**
 * Combined hook for easy usage - modular approach
 */
export function useAltan(config: AltanSDKConfig): {
  sdk: AltanSDK;
  guest: ReturnType<typeof useAltanGuest>;
  auth: ReturnType<typeof useAltanAuth>;
  room: ReturnType<typeof useAltanRoom>;
  createSession: (agentId: string, guestInfo?: CreateGuestRequest) => Promise<{ guest: GuestData; room: RoomData; tokens: AuthTokens; }>;
  initializeExistingGuest: (externalId: string) => Promise<{ guest: GuestData; tokens: AuthTokens; }>;
  joinExistingRoom: (roomId: string, guestInfo?: CreateGuestRequest) => Promise<{ guest: GuestData; tokens: AuthTokens; roomUrl: string; }>;
} {
  const sdk = useAltanSDK(config);
  const guest = useAltanGuest(sdk);
  const auth = useAltanAuth(sdk);
  const room = useAltanRoom(sdk);

  // Convenience method for common workflow
  const createSession = useCallback(async (agentId: string, guestInfo: CreateGuestRequest = {}): Promise<{ guest: GuestData; room: RoomData; tokens: AuthTokens; }> => {
    try {
      return await sdk.createSession(agentId, guestInfo);
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }, [sdk]);

  // Convenience method for returning users
  const initializeExistingGuest = useCallback(async (externalId: string): Promise<{ guest: GuestData; tokens: AuthTokens; }> => {
    try {
      const existingGuest = await guest.getGuestByExternalId(externalId);
      const tokens = await auth.authenticate(existingGuest.id);
      return { guest: existingGuest, tokens };
    } catch (error) {
      console.error('Failed to initialize existing guest:', error);
      throw error;
    }
  }, [guest, auth]);

  // Convenience method for joining existing room
  const joinExistingRoom = useCallback(async (roomId: string, guestInfo: CreateGuestRequest = {}): Promise<{ guest: GuestData; tokens: AuthTokens; roomUrl: string; }> => {
    try {
      let guestData: GuestData;
      
      if (guestInfo.external_id) {
        try {
          guestData = await guest.getGuestByExternalId(guestInfo.external_id);
        } catch {
          guestData = await guest.createGuest(guestInfo);
        }
      } else {
        guestData = await guest.createGuest(guestInfo);
      }

      await room.joinRoom(roomId, guestData.id);
      const tokens = await auth.authenticate(guestData.id);
      
      return { guest: guestData, tokens, roomUrl: sdk.getRoomUrl(roomId) };
    } catch (error) {
      console.error('Failed to join existing room:', error);
      throw error;
    }
  }, [guest, room, auth, sdk]);

  return {
    sdk,
    guest,
    auth,
    room,
    // Convenience methods
    createSession,
    initializeExistingGuest,
    joinExistingRoom,
  };
} 