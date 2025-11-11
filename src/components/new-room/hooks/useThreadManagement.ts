import { useCallback, useMemo } from 'react';

import {
  selectMainThread,
  selectRoomThreadMain,
  selectTabsCount,
  createTab,
  switchTab,
  closeTab as closeTabAction,
} from '../../../redux/slices/room';
import { useSelector , dispatch } from '../../../redux/store';
import type { RoomMode } from '../types/room.types';

/**
 * Thread CRUD operations
 * - Create/delete threads
 * - Switch active thread
 * - Tab management (for tabs mode)
 */
export function useThreadManagement(mode: RoomMode) {
  const mainThread = useSelector(selectMainThread);
  const threadMain = useSelector(selectRoomThreadMain);
  const tabsCount = useSelector(selectTabsCount);

  // Get current active thread ID
  const activeThreadId = useMemo(() => {
    if (mode === 'ephemeral') {
      return threadMain.current || mainThread;
    }
    return threadMain.current || mainThread;
  }, [mode, threadMain, mainThread]);

  // Create a new tab (tabs mode only)
  const createNewTab = useCallback(
    (threadName: string = 'New Thread') => {
      if (mode !== 'tabs') return;

      // In tabs mode, create a new tab which will create a new thread
      dispatch(
        createTab({
          threadName,
          isMainThread: false,
        }),
      );
    },
    [mode],
  );

  // Switch to a different thread/tab
  const switchToThread = useCallback((threadId: string) => {
    dispatch(switchTab(threadId));
  }, []);

  // Close a tab (tabs mode only, cannot close main thread)
  const closeThreadTab = useCallback(
    (threadId: string) => {
      if (mode !== 'tabs') return;
      if (threadId === mainThread) return; // Cannot close main thread

      dispatch(closeTabAction(threadId));
    },
    [mode, mainThread],
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
