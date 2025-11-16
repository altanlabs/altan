import { useCallback, useEffect, useRef } from 'react';

import { integrateRealTimeUpdates, clearRealTimeUpdateFlags } from '../../../../../redux/slices/bases.ts';
import { useDispatch } from '../../../../../redux/store.ts';

/**
 * Custom hook for handling WebSocket real-time updates with AG Grid async transactions
 * Optimized for high-frequency updates and proper pagination handling
 */
export const useWebSocketIntegration = (tableId, onRecordUpdate, onRecordAdd, onRecordDelete) => {
  const dispatch = useDispatch();
  const updateBuffer = useRef({
    updates: new Map(),
    additions: new Map(),
    deletions: new Set(),
    lastFlush: Date.now(),
    timeoutId: null,
  });

  // Flush buffered updates using async transactions
  const flushBuffer = useCallback(() => {
    const buffer = updateBuffer.current;

    if (buffer.updates.size === 0 && buffer.additions.size === 0 && buffer.deletions.size === 0) {
      return;
    }

    const updates = Array.from(buffer.updates.values());
    const additions = Array.from(buffer.additions.values());
    const deletions = Array.from(buffer.deletions);

    // Apply updates to Redux store first (for pagination state)
    if (updates.length > 0 || additions.length > 0 || deletions.length > 0) {
      dispatch(integrateRealTimeUpdates({
        tableId,
        updates: updates.length > 0 ? updates : undefined,
        additions: additions.length > 0 ? additions : undefined,
        deletions: deletions.length > 0 ? deletions : undefined,
      }));
    }

    // Apply updates to AG Grid using high-frequency async transactions
    if (updates.length > 0) {
      updates.forEach((record) => {
        onRecordUpdate?.(record.id, record, true); // true = isHighFrequency
      });
    }

    if (additions.length > 0) {
      additions.forEach((record) => {
        onRecordAdd?.(record, true); // true = isHighFrequency
      });
    }

    if (deletions.length > 0) {
      onRecordDelete?.(deletions, true); // true = isHighFrequency
    }

    // Clear buffers
    buffer.updates.clear();
    buffer.additions.clear();
    buffer.deletions.clear();
    buffer.lastFlush = Date.now();
    buffer.timeoutId = null;
  }, [tableId, dispatch, onRecordUpdate, onRecordAdd, onRecordDelete]);

  // Buffer WebSocket updates for batch processing
  const bufferUpdate = useCallback((type, data) => {
    const buffer = updateBuffer.current;

    switch (type) {
      case 'update':
        buffer.updates.set(data.id, data);
        break;
      case 'add':
        buffer.additions.set(data.id, data);
        // Remove from deletions if it was previously marked for deletion
        buffer.deletions.delete(data.id);
        break;
      case 'delete':
        buffer.deletions.add(data.id);
        // Remove from updates and additions if they exist
        buffer.updates.delete(data.id);
        buffer.additions.delete(data.id);
        break;
      default:
        return;
    }

    // Clear existing timeout
    if (buffer.timeoutId) {
      clearTimeout(buffer.timeoutId);
    }

    // Schedule flush - shorter timeout for more responsive updates
    buffer.timeoutId = setTimeout(flushBuffer, 150);
  }, [flushBuffer]);

  // Force flush all pending updates (useful for component unmount or manual sync)
  const forceFlush = useCallback(() => {
    const buffer = updateBuffer.current;
    if (buffer.timeoutId) {
      clearTimeout(buffer.timeoutId);
    }
    flushBuffer();
  }, [flushBuffer]);

  // Clear real-time update flags (useful after pagination refresh)
  const clearUpdateFlags = useCallback(() => {
    dispatch(clearRealTimeUpdateFlags({ tableId }));
  }, [tableId, dispatch]);

  // Get buffered update stats
  const getBufferStats = useCallback(() => {
    const buffer = updateBuffer.current;
    return {
      pendingUpdates: buffer.updates.size,
      pendingAdditions: buffer.additions.size,
      pendingDeletions: buffer.deletions.size,
      lastFlush: buffer.lastFlush,
      hasPending: buffer.updates.size > 0 || buffer.additions.size > 0 || buffer.deletions.size > 0,
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const currentBuffer = updateBuffer.current;
    return () => {
      // Use the captured reference to avoid stale closure issues
      if (currentBuffer.timeoutId) {
        clearTimeout(currentBuffer.timeoutId);
      }
      // Force flush any remaining updates
      if (currentBuffer.updates.size > 0 || currentBuffer.additions.size > 0 || currentBuffer.deletions.size > 0) {
        flushBuffer();
      }
    };
  }, [flushBuffer]);

  return {
    // Main functions for WebSocket event handling
    handleWebSocketUpdate: useCallback((data) => bufferUpdate('update', data), [bufferUpdate]),
    handleWebSocketAdd: useCallback((data) => bufferUpdate('add', data), [bufferUpdate]),
    handleWebSocketDelete: useCallback((data) => bufferUpdate('delete', data), [bufferUpdate]),

    // Utility functions
    forceFlush,
    clearUpdateFlags,
    getBufferStats,

    // Direct flush function for immediate updates (when not using high-frequency mode)
    flushBuffer,
  };
};

export default useWebSocketIntegration;