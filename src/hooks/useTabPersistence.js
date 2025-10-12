import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectTabs,
  selectRoomId,
  selectThreadsById,
  loadTabs,
  clearTabs,
  updateTab,
  fetchThread,
} from '../redux/slices/room';

const STORAGE_KEY = 'roomTabState';

export const useTabPersistence = () => {
  const dispatch = useDispatch();
  const tabs = useSelector(selectTabs);
  const roomId = useSelector(selectRoomId);
  const threadsById = useSelector(selectThreadsById);
  const hasLoadedRef = useRef(false);

  // Generate storage key based on room ID
  const getStorageKey = useCallback((roomId) => {
    return roomId ? `${STORAGE_KEY}:${roomId}` : null;
  }, []);

  // Save tabs to localStorage
  const saveTabsToStorage = useCallback((roomId, tabsState) => {
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
      console.error('Error saving tabs to localStorage:', error);
    }
  }, [getStorageKey]);

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
      console.error('Error loading tabs from localStorage:', error);
      // Remove corrupted data
      const storageKey = getStorageKey(roomId);
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
      return null;
    }
  }, [getStorageKey]);

  // Sync tab names with thread names
  const syncTabNames = useCallback(() => {
    if (!tabs || !threadsById) return;

    Object.values(tabs.byId).forEach(tab => {
      const thread = threadsById[tab.threadId];
      if (thread) {
        let expectedName;
        if (thread.is_main) {
          expectedName = 'Main';
        } else {
          expectedName = thread.name || 'Thread';
        }
        
        if (expectedName !== tab.name) {
          dispatch(updateTab({
            tabId: tab.id,
            changes: { name: expectedName }
          }));
        }
      }
    });
  }, [tabs, threadsById, dispatch]);

  // Load tabs when room changes
  useEffect(() => {
    if (!roomId) {
      hasLoadedRef.current = false;
      return;
    }

    // Only load once per room to prevent reloading after tab operations
    if (hasLoadedRef.current) {
      return;
    }

    const savedTabs = loadTabsFromStorage(roomId);
    if (savedTabs) {
      dispatch(loadTabs({ tabs: savedTabs }));
    } else {
      // Clear tabs if no saved state
      dispatch(clearTabs());
    }
    
    hasLoadedRef.current = true;
  }, [roomId, dispatch, loadTabsFromStorage]);

  // Fetch threads for tabs that don't have their threads loaded yet
  useEffect(() => {
    if (!tabs || !threadsById || !roomId) return;

    Object.values(tabs.byId).forEach(tab => {
      const threadExists = threadsById[tab.threadId];
      if (!threadExists && tab.threadId) {
        // Fetch the thread if it doesn't exist yet
        dispatch(fetchThread({ threadId: tab.threadId })).catch(error => {
          console.warn(`Failed to fetch thread ${tab.threadId} for tab ${tab.id}:`, error);
        });
      }
    });
  }, [tabs, threadsById, roomId, dispatch]);

  // Save tabs when they change
  useEffect(() => {
    if (!roomId || !tabs || Object.keys(tabs.byId).length === 0) return;

    // Only save if tabs have been initialized (not empty)
    if (tabs.allIds.length > 0) {
      saveTabsToStorage(roomId, tabs);
    }
  }, [roomId, tabs, saveTabsToStorage]);

  // Sync tab names with thread names when threads change
  useEffect(() => {
    syncTabNames();
  }, [threadsById, syncTabNames]);

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