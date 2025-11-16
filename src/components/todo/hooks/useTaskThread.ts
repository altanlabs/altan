/**
 * Task Thread Navigation Hook
 * Handles navigation to task subthreads
 */

import { useCallback } from 'react';
import { useDispatch } from '../../../redux/store';
import { switchToThread } from '../../../redux/slices/room/thunks/threadThunks';
import { Task } from '../types';

interface UseTaskThreadReturn {
  openTaskThread: (task: Task) => void;
}

/**
 * Hook to handle task thread navigation
 * Follows Single Responsibility Principle - only handles thread navigation
 */
export const useTaskThread = (): UseTaskThreadReturn => {
  const dispatch = useDispatch();

  const openTaskThread = useCallback(
    (task: Task): void => {
      if (task.subthread_id) {
        dispatch(
          switchToThread({
            threadId: task.subthread_id,
            threadName: task.title || 'Task Thread',
          })
        );
      }
    },
    [dispatch]
  );

  return { openTaskThread };
};

