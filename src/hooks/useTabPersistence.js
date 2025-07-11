import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectTabs,
  selectRoomId,
  selectThreadsById,
  loadTabs,
  clearTabs,
  updateTab,
} from '../redux/slices/room';

const STORAGE_KEY = 'roomTabState';

export const useTabPersistence = () => {
  const dispatch = useDispatch();
  const tabs = useSelector(selectTabs);
  const roomId = useSelector(selectRoomId);
  const threadsById = useSelector(selectThreadsById);

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
      if (thread && thread.name && thread.name !== tab.name) {
        dispatch(updateTab({
          tabId: tab.id,
          changes: { name: thread.name }
        }));
      }
    });
  }, [tabs, threadsById, dispatch]);

  // Load tabs when room changes
  useEffect(() => {
    if (!roomId) return;

    const savedTabs = loadTabsFromStorage(roomId);
    if (savedTabs) {
      dispatch(loadTabs({ tabs: savedTabs }));
    } else {
      // Clear tabs if no saved state
      dispatch(clearTabs());
    }
  }, [roomId, dispatch, loadTabsFromStorage]);

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