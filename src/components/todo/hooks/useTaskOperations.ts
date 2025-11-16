/**
 * Task Operations Hook
 * Handles task CRUD operations with API and Redux integration
 */

import axios from 'axios';
import { useCallback } from 'react';

import { updateTask, removeTask } from '../../../redux/slices/tasks/index';
import { useDispatch } from '../../../redux/store';
import { API_BASE_URL } from '../constants';
import { TaskUpdates } from '../types';

interface UseTaskOperationsProps {
  threadId: string;
}

interface UseTaskOperationsReturn {
  updateTaskStatus: (taskId: string, updates: TaskUpdates) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

/**
 * Hook to manage task operations (update, delete)
 * Follows Single Responsibility Principle - only handles task operations
 */
export const useTaskOperations = ({
  threadId,
}: UseTaskOperationsProps): UseTaskOperationsReturn => {
  const dispatch = useDispatch();

  const updateTaskStatus = useCallback(
    async (taskId: string, updates: TaskUpdates): Promise<void> => {
      try {
        // Update backend first
        await axios.patch(`${API_BASE_URL}/tasks/${taskId}`, updates);

        // Then update Redux store
        dispatch(updateTask({ threadId, taskId, updates }));
      } catch (error) {
        console.error('Failed to update task:', error);
        // TODO: Add proper error notification
        throw error;
      }
    },
    [dispatch, threadId]
  );

  const deleteTask = useCallback(
    async (taskId: string): Promise<void> => {
      try {
        // Delete from backend first
        await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);

        // Then remove from Redux store
        dispatch(removeTask({ threadId, taskId }));
      } catch (error) {
        console.error('Failed to delete task:', error);
        // TODO: Add proper error notification
        throw error;
      }
    },
    [dispatch, threadId]
  );

  return {
    updateTaskStatus,
    deleteTask,
  };
};

