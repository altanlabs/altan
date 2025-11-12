import React, { createContext, useContext, useMemo } from 'react';

import type { RoomConfig } from '../types/room.types';

/**
 * Extended context value with computed properties
 */
interface RoomConfigContextValue extends RoomConfig {
  isEphemeralMode: boolean;
  isTabsMode: boolean;
}

const RoomConfigContext = createContext<RoomConfigContextValue | null>(null);

interface RoomConfigProviderProps {
  children: React.ReactNode;
  config: RoomConfig;
}

/**
 * Room Config Provider
 * Eliminates prop drilling - provides config to all descendants
 * Replaces passing 9+ props through 5 component levels
 */
export function RoomConfigProvider({ children, config }: RoomConfigProviderProps) {
  const value = useMemo<RoomConfigContextValue>(
    () => ({
      ...config,
      isEphemeralMode: config.mode === 'ephemeral',
      isTabsMode: config.mode === 'tabs',
    }),
    [config],
  );

  return <RoomConfigContext.Provider value={value}>{children}</RoomConfigContext.Provider>;
}

/**
 * Hook to access room configuration
 */
export function useRoomConfig(): RoomConfigContextValue {
  const context = useContext(RoomConfigContext);

  if (!context) {
    throw new Error('useRoomConfig must be used within RoomConfigProvider');
  }

  return context;
}
