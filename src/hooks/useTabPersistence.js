import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectRoomId } from '../redux/slices/room/selectors/roomSelectors';
import { selectTabs } from '../redux/slices/room/selectors/tabSelectors';
import { selectThreadsById } from '../redux/slices/room/selectors/threadSelectors';
import { clearTabs, updateTab } from '../redux/slices/room/slices/tabsSlice';

const STORAGE_KEY = 'roomTabState';
const SAVE_DEBOUNCE_MS = 500; // Debounce saves by 500ms

export const useTabPersistence = () => {
  const dispatch = useDispatch();
  const tabs = useSelector(selectTabs);
  const roomId = useSelector(selectRoomId);
  const threadsById = useSelector(selectThreadsById);
  const hasLoadedRef = useRef(false);

  // Track fetching state to avoid duplicate fetches
  const fetchingThreadsRef = useRef(new Set());
  // Track if tabs have been loaded for current room
  const loadedRoomRef = useRef(null);
  // Debounce timer for saves
  const saveTimerRef = useRef(null);

  // Generate storage key based on room ID
  const getStorageKey = useCallback((roomId) => {
    return roomId ? `${STORAGE_KEY}:${roomId}` : null;
  }, []);

  // Save tabs to localStorage (internal, not debounced)
  const saveTabsToStorageImmediate = useCallback((roomId, tabsState) => {
    if (!roomId) return;

    const storageKey = getStorageKey(roomId);
    if (!storageKey) return;

    try {
      const dataToSave = {
        tabs: tabsState,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving tabs to localStorage:', error);
    }
  }, [getStorageKey]);

  // Public save function (can be called directly if needed)
  const saveTabsToStorage = useCallback((roomId, tabsState) => {
    saveTabsToStorageImmediate(roomId, tabsState);
  }, [saveTabsToStorageImmediate]);

  // Load tabs from localStorage
  const loadTabsFromStorage = useCallback((roomId) => {
    if (!roomId) return null;

    const storageKey = getStorageKey(roomId);
    if (!storageKey) return null;

    try {
      const savedData = localStorage.getItem(storageKey);
      if (!savedData) return null;

      const parsedData = JSON.parse(savedData);

      // Only restore state if it's less than 7 days old
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      if (Date.now() - parsedData.lastUpdated > maxAge) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return parsedData.tabs;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading tabs from localStorage:', error);
      // Remove corrupted data
      const storageKey = getStorageKey(roomId);
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
      return null;
    }
  }, [getStorageKey]);

  // Sync tab names with thread names (stable callback without tabs dependency)
  const syncTabNames = useCallback(() => {
    // This will be called from an effect that has tabs/threadsById as dependencies
    // So we don't need them in the callback dependencies
  }, []);

  // Load tabs when room changes
  useEffect(() => {
    if (!roomId) {
      loadedRoomRef.current = null;
      return;
    }

    // Only load once per room
    if (loadedRoomRef.current === roomId) return;

    loadedRoomRef.current = roomId;
    fetchingThreadsRef.current.clear(); // Clear fetching state for new room

    // DISABLED: localStorage tab persistence causes race conditions
    // Always clear tabs on room load - GeneralToolbar will create the main thread tab
    // This ensures we always start with a clean slate and avoid stale thread_ids
    dispatch(clearTabs());
    hasLoadedRef.current = true;
  }, [roomId, dispatch]);

  // DISABLED: Fetch threads for tabs that don't have their threads loaded yet
  // This was needed for localStorage persistence to handle stale tabs.
  // Since we no longer load tabs from storage, we don't need orphan tab cleanup.
  // Tabs are now always created fresh from the main thread or URL parameters.
  // useEffect(() => {
  //   if (!tabs || !threadsById || !roomId) return;
  //
  //   const tabsArray = Object.values(tabs.byId);
  //
  //   tabsArray.forEach(tab => {
  //     const threadId = tab.threadId;
  //     if (!threadId) return;
  //
  //     const threadExists = threadsById[threadId];
  //     const isFetching = fetchingThreadsRef.current.has(threadId);
  //
  //     if (!threadExists && !isFetching) {
  //       // Mark as fetching
  //       fetchingThreadsRef.current.add(threadId);
  //
  //       // Fetch the thread
  //       dispatch(fetchThread({ threadId }))
  //         .then(() => {
  //           // Remove from fetching set after successful fetch
  //           fetchingThreadsRef.current.delete(threadId);
  //         })
  //         .catch(() => {
  //           // Remove from fetching set on error
  //           fetchingThreadsRef.current.delete(threadId);
  //
  //           // IMPORTANT: Close the orphan tab since it doesn't belong to this room
  //           dispatch(closeTab({ tabId: tab.id }));
  //         });
  //     }
  //   });
  // }, [tabs, threadsById, roomId, dispatch]);

  // DISABLED: Save tabs when they change (debounced)
  // Tab persistence to localStorage has been disabled to prevent race conditions
  // where users could send messages to wrong threads from stale localStorage data
  // useEffect(() => {
  //   if (!roomId || !tabs || Object.keys(tabs.byId).length === 0) return;
  //
  //   // Only save if tabs have been initialized (not empty)
  //   if (tabs.allIds.length === 0) return;
  //
  //   // Clear existing timer
  //   if (saveTimerRef.current) {
  //     clearTimeout(saveTimerRef.current);
  //   }
  //
  //   // Set new debounced save
  //   saveTimerRef.current = setTimeout(() => {
  //     saveTabsToStorageImmediate(roomId, tabs);
  //     saveTimerRef.current = null;
  //   }, SAVE_DEBOUNCE_MS);
  //
  //   // Cleanup on unmount
  //   return () => {
  //     if (saveTimerRef.current) {
  //       clearTimeout(saveTimerRef.current);
  //     }
  //   };
  // }, [roomId, tabs, saveTabsToStorageImmediate]);

  // Sync tab names with thread names when threads change
  useEffect(() => {
    if (!tabs || !threadsById) return;

    // Directly update tab names based on thread names
    Object.values(tabs.byId).forEach(tab => {
      const thread = threadsById[tab.threadId];
      if (thread) {
        let expectedName;
        if (thread.is_main) {
          expectedName = 'Main';
        } else {
          expectedName = thread.name || 'Thread';
        }

        // Only dispatch if name actually changed
        if (expectedName !== tab.name) {
          dispatch(updateTab({
            tabId: tab.id,
            changes: { name: expectedName },
          }));
        }
      }
    });
  }, [threadsById, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear tabs from localStorage for specific room
  const clearTabsFromStorage = useCallback((roomId) => {
    if (!roomId) return;

    const storageKey = getStorageKey(roomId);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [getStorageKey]);

  // Get all stored tab rooms (for debugging)
  const getAllStoredTabRooms = useCallback(() => {
    const tabRooms = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY)) {
        const roomId = key.split(':')[1];
        if (roomId) {
          tabRooms.push(roomId);
        }
      }
    }
    return tabRooms;
  }, []);

  return {
    saveTabsToStorage,
    loadTabsFromStorage,
    clearTabsFromStorage,
    getAllStoredTabRooms,
    syncTabNames,
  };
};
