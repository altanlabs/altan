/**
 * Tab Service - Business logic layer for tab management
 * Implements Single Responsibility Principle by handling tab-specific business logic
 */

import type { Tab, TabsState } from './types';

/**
 * Tab Service - Handles tab state persistence and business logic
 */
export class TabService {
  private readonly storageKey = 'altan-room-tabs';

  /**
   * Create a new tab configuration
   * @param threadId - Thread ID
   * @param threadName - Thread name
   * @param isMainThread - Whether this is the main thread
   * @returns Tab configuration
   */
  createTab(threadId: string, threadName?: string, isMainThread = false): Tab {
    return {
      id: threadId,
      threadId,
      name: threadName || (isMainThread ? 'Main' : 'New Thread'),
      isMainThread,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Persist tabs to storage
   * @param tabsState - Tabs state {byId, allIds, activeTabId, nextTabId}
   * @param roomId - Room ID for scoping
   */
  async persistTabs(tabsState: TabsState, roomId: string): Promise<void> {
    try {
      const storageKey = `${this.storageKey}-${roomId}`;
      const serializedState = JSON.stringify({
        byId: tabsState.byId,
        allIds: tabsState.allIds,
        activeTabId: tabsState.activeTabId,
        nextTabId: tabsState.nextTabId,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(storageKey, serializedState);
    } catch (error) {
      console.warn('Failed to persist tabs:', error);
    }
  }

  /**
   * Load persisted tabs from storage
   * @param roomId - Room ID for scoping
   * @returns Tabs state or null if not found
   */
  loadPersistedTabs(roomId: string): TabsState | null {
    try {
      const storageKey = `${this.storageKey}-${roomId}`;
      const serializedState = localStorage.getItem(storageKey);

      if (!serializedState) {
        return null;
      }

      const state = JSON.parse(serializedState) as Partial<TabsState>;

      // Validate state structure
      if (!state.byId || !state.allIds || !Array.isArray(state.allIds)) {
        return null;
      }

      return {
        byId: state.byId,
        allIds: state.allIds,
        activeTabId: state.activeTabId ?? null,
        nextTabId: state.nextTabId || 1,
      };
    } catch (error) {
      console.warn('Failed to load persisted tabs:', error);
      return null;
    }
  }

  /**
   * Clear persisted tabs for a room
   * @param roomId - Room ID
   */
  clearPersistedTabs(roomId: string): void {
    try {
      const storageKey = `${this.storageKey}-${roomId}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear persisted tabs:', error);
    }
  }

  /**
   * Validate tab state
   * @param tabsState - Tabs state to validate
   * @returns Whether the state is valid
   */
  validateTabState(tabsState: unknown): tabsState is TabsState {
    if (!tabsState || typeof tabsState !== 'object') {
      return false;
    }

    const state = tabsState as Partial<TabsState>;

    if (!state.byId || typeof state.byId !== 'object') {
      return false;
    }

    if (!Array.isArray(state.allIds)) {
      return false;
    }

    // Ensure all allIds exist in byId
    for (const id of state.allIds) {
      if (!state.byId[id]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get tab by thread ID
   * @param tabsState - Current tabs state
   * @param threadId - Thread ID to find
   * @returns Tab or null if not found
   */
  getTabByThreadId(tabsState: TabsState, threadId: string): Tab | null {
    const tabId = tabsState.allIds.find(
      (id) => tabsState.byId[id]?.threadId === threadId
    );
    return tabId ? tabsState.byId[tabId] : null;
  }
}

// Singleton instance
let tabServiceInstance: TabService | null = null;

/**
 * Get or create TabService instance
 * @returns TabService instance
 */
export const getTabService = (): TabService => {
  if (!tabServiceInstance) {
    tabServiceInstance = new TabService();
  }
  return tabServiceInstance;
};

