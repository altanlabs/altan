import { useEffect, useRef } from 'react';
import { useHermesWebSocket } from '../../../providers/websocket/HermesWebSocketProvider';

/**
 * Clean WebSocket lifecycle management
 * - Subscribe/unsubscribe to room channel
 * - Handle room switching
 * - Proper cleanup sequencing
 */
export function useRoomWebSocket(roomId: string | null) {
  const { isOpen, subscribe, unsubscribe } = useHermesWebSocket();
  const lastRoomIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen && roomId) {
      const channelName = `room:${roomId}`;

      // Subscribe to new room
      subscribe(channelName);

      // Store current room ID
      lastRoomIdRef.current = roomId;

      // Cleanup: unsubscribe when room changes or component unmounts
      return () => {
        if (lastRoomIdRef.current) {
          unsubscribe(`room:${lastRoomIdRef.current}`);
        }
      };
    }
  }, [isOpen, roomId, subscribe, unsubscribe]);

  return {
    isConnected: isOpen,
  };
}
