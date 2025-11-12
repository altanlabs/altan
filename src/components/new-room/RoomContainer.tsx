import React from 'react';

import { ErrorState } from './components/ErrorState';
import { RoomErrorBoundary } from './components/RoomErrorBoundary';
import { RoomConfigProvider } from './contexts/RoomConfigContext';
import { useRoomInitialization } from './hooks/useRoomInitialization';
import { useRoomUrlState } from './hooks/useRoomUrlState';
import { useRoomWebSocket } from './hooks/useRoomWebSocket';
import { EphemeralRoom } from './modes/EphemeralRoom';
import { TabbedRoom } from './modes/TabbedRoom';
import type { RoomConfig } from './types/room.types';
import ContextMenuRoom from '../../components/contextmenu/ContextMenuRoom.jsx';
import { clearRoomState } from '../../redux/slices/room';
import { dispatch } from '../../redux/store';

interface RoomContainerProps extends Omit<RoomConfig, 'mode'> {
  mode?: 'ephemeral' | 'tabs';
}

/**
 * Main Room Container - Orchestrates the entire room experience
 * Handles:
 * - Room initialization
 * - WebSocket connection
 * - URL state management
 * - Mode selection (ephemeral vs tabs)
 * - Error handling
 * - Loading states
 */
export function RoomContainer({
  roomId,
  mode = 'tabs', // Default to tabs mode
  ...configProps
}: RoomContainerProps) {
  // Initialize room data
  const { initialized, loading, error } = useRoomInitialization(roomId);

  // Setup WebSocket
  useRoomWebSocket(roomId);

  // Handle URL state (context, message params)
  // In ephemeral mode, clear thread_id from URL
  useRoomUrlState(roomId, initialized, mode === 'ephemeral');

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      dispatch(clearRoomState());
    };
  }, [roomId]);

  // Build full config object
  const config: RoomConfig = React.useMemo(
    () => ({
      mode,
      roomId,
      ...configProps,
    }),
    [mode, roomId, configProps],
  );

  // Show error state
  if (error && !loading) {
    return (
      <ErrorState
        title="Failed to load room"
        message={error.message || "We couldn't load this room. Please try again."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Show loading state
  if (loading || !initialized) {
    return null;
  }

  // Render appropriate mode with error boundary and context menu
  return (
    <RoomErrorBoundary>
      <RoomConfigProvider config={config}>
        {mode === 'ephemeral' ? <EphemeralRoom /> : <TabbedRoom />}
        {/* Global context menu for messages */}
        <ContextMenuRoom />
      </RoomConfigProvider>
    </RoomErrorBoundary>
  );
}
