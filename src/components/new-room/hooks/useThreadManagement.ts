import { useCallback, useMemo } from 'react';

import { selectTabsCount, selectActiveTab } from '../../../redux/slices/room/selectors/tabSelectors';
import {
  selectMainThread,
  selectRoomThreadMain,
} from '../../../redux/slices/room/selectors/threadSelectors';
import { switchTab , closeTab as closeTabAction } from '../../../redux/slices/room/slices/tabsSlice';
import { useSelector , dispatch } from '../../../redux/store';
import type { RoomMode } from '../types/room.types';

/**
 * Thread CRUD operations
 * - Create/delete threads
 * - Switch active thread
 * - Tab management (for tabs mode)
 */
export function useThreadManagement(mode: RoomMode): {
  activeThreadId: string | null;
  mainThreadId: string | null;
  tabsCount: number;
  createNewTab: (threadName?: string) => void;
  switchToThread: (tabId: string) => void;
  closeThreadTab: (tabId: string) => void;
} {
  const mainThread = useSelector(selectMainThread);
  const threadMain = useSelector(selectRoomThreadMain);
  const tabsCount = useSelector(selectTabsCount);
  const activeTab = useSelector(selectActiveTab);

  // Get current active thread ID
  const activeThreadId = useMemo(() => {

    if (mode === 'tabs') {
      return activeTab?.threadId || mainThread;
    }
    return threadMain.current || mainThread;
  }, [mode, activeTab, threadMain, mainThread]);

  // Create a new tab (tabs mode only)
  const createNewTab = useCallback(
    (threadName: string = 'New Thread') => {
      if (mode !== 'tabs') return;

      // Note: This is a placeholder - actual thread creation happens elsewhere
      // This would need a threadId to work properly
      // eslint-disable-next-line no-console
      console.warn('createNewTab called but needs threadId - use createNewThread thunk instead');
    },
    [mode],
  );

  // Switch to a different thread/tab
  const switchToThread = useCallback((tabId: string) => {
    dispatch(switchTab({ tabId }));
  }, []);

  // Close a tab (tabs mode only, cannot close main thread)
  const closeThreadTab = useCallback(
    (tabId: string) => {
      if (mode !== 'tabs') return;

      dispatch(closeTabAction({ tabId }));
    },
    [mode],
  );

  return {
    activeThreadId,
    mainThreadId: mainThread,
    tabsCount,
    createNewTab,
    switchToThread,
    closeThreadTab,
  };
}
