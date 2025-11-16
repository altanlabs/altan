/**
 * Tabs Slice
 * Manages tab state for multi-threaded conversations
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { TabsState, Tab, CreateTabPayload, SwitchTabPayload } from '../types/state';

interface TabsSliceState {
  tabs: TabsState;
}

const initialState: TabsSliceState = {
  tabs: {
    byId: {},
    allIds: [],
    activeTabId: null,
    nextTabId: 1,
  },
};

const tabsSlice = createSlice({
  name: 'room/tabs',
  initialState,
  reducers: {
    createTab: (state, action: PayloadAction<CreateTabPayload>) => {
      const { threadId, threadName, isMainThread = false } = action.payload;

      // Check if a tab with this threadId already exists
      const existingTabId = state.tabs.allIds.find(
        (tabId) => state.tabs.byId[tabId]?.threadId === threadId,
      );

      // If tab with same threadId exists, switch to it instead of creating a new one
      if (existingTabId) {
        // Deactivate current active tab
        if (state.tabs.activeTabId && state.tabs.byId[state.tabs.activeTabId]) {
          state.tabs.byId[state.tabs.activeTabId].isActive = false;
        }

        // Activate existing tab
        state.tabs.activeTabId = existingTabId;
        state.tabs.byId[existingTabId].isActive = true;
        return;
      }

      // Create new tab only if no tab with this threadId exists
      const tabId = `tab-${state.tabs.nextTabId}`;

      state.tabs.byId[tabId] = {
        id: tabId,
        threadId,
        name: threadName || (isMainThread ? 'Main' : 'New Thread'),
        isMainThread,
        isActive: false,
        createdAt: new Date().toISOString(),
      };

      state.tabs.allIds.push(tabId);
      state.tabs.nextTabId += 1;

      // If this is the first tab or no active tab, make it active
      if (!state.tabs.activeTabId) {
        state.tabs.activeTabId = tabId;
        state.tabs.byId[tabId].isActive = true;
      }
    },

    switchTab: (state, action: PayloadAction<SwitchTabPayload>) => {
      const { tabId } = action.payload;

      if (!state.tabs.byId[tabId]) {
        return;
      }

      // Deactivate current active tab
      if (state.tabs.activeTabId && state.tabs.byId[state.tabs.activeTabId]) {
        state.tabs.byId[state.tabs.activeTabId].isActive = false;
      }

      // Activate new tab
      state.tabs.activeTabId = tabId;
      state.tabs.byId[tabId].isActive = true;
    },

    closeTab: (state, action: PayloadAction<{ tabId: string }>) => {
      const { tabId } = action.payload;

      if (!state.tabs.byId[tabId]) {
        return;
      }

      const wasActive = state.tabs.byId[tabId].isActive;

      // Remove tab
      delete state.tabs.byId[tabId];
      state.tabs.allIds = state.tabs.allIds.filter((id) => id !== tabId);

      // If this was the active tab, we need to switch to another tab
      if (wasActive) {
        if (state.tabs.allIds.length > 0) {
          // Switch to the last remaining tab
          const newActiveTabId = state.tabs.allIds[state.tabs.allIds.length - 1];
          state.tabs.activeTabId = newActiveTabId;
          state.tabs.byId[newActiveTabId].isActive = true;
        } else {
          // No tabs left
          state.tabs.activeTabId = null;
        }
      }
    },

    updateTab: (state, action: PayloadAction<{ tabId: string; changes: Partial<Tab> }>) => {
      const { tabId, changes } = action.payload;

      if (!state.tabs.byId[tabId]) {
        return;
      }

      Object.assign(state.tabs.byId[tabId], changes);
    },

    clearTabs: (state) => {
      state.tabs = {
        byId: {},
        allIds: [],
        activeTabId: null,
        nextTabId: 1,
      };
    },

    loadTabs: (state, action: PayloadAction<{ tabs: TabsState }>) => {
      const { tabs } = action.payload;
      if (tabs && typeof tabs === 'object') {
        state.tabs = {
          byId: tabs.byId || {},
          allIds: tabs.allIds || [],
          activeTabId: tabs.activeTabId || null,
          nextTabId: tabs.nextTabId || 1,
        };
      }
    },

    switchToThreadReducer: (state, action: PayloadAction<{ threadId: string; threadName?: string }>) => {
      const { threadId, threadName } = action.payload;

      if (!threadId) {
        return;
      }

      // Find if there's already a tab for this thread
      const existingTab = Object.values(state.tabs.byId).find((tab) => tab.threadId === threadId);

      if (existingTab) {
        // Switch to existing tab
        if (state.tabs.activeTabId && state.tabs.byId[state.tabs.activeTabId]) {
          state.tabs.byId[state.tabs.activeTabId].isActive = false;
        }

        state.tabs.activeTabId = existingTab.id;
        state.tabs.byId[existingTab.id].isActive = true;
      } else {
        // Create new tab for this thread
        const tabId = `tab-${state.tabs.nextTabId}`;

        state.tabs.byId[tabId] = {
          id: tabId,
          threadId,
          name: threadName || 'Thread',
          isMainThread: false,
          isActive: false,
          createdAt: new Date().toISOString(),
        };

        state.tabs.allIds.push(tabId);
        state.tabs.nextTabId += 1;

        // Deactivate current tab
        if (state.tabs.activeTabId && state.tabs.byId[state.tabs.activeTabId]) {
          state.tabs.byId[state.tabs.activeTabId].isActive = false;
        }

        // Activate new tab
        state.tabs.activeTabId = tabId;
        state.tabs.byId[tabId].isActive = true;
      }
    },
  },
});

export const {
  createTab,
  switchTab,
  closeTab,
  updateTab,
  clearTabs,
  loadTabs,
  switchToThreadReducer,
} = tabsSlice.actions;

export default tabsSlice.reducer;

