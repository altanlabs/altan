/**
 * Todo Widget Component
 * Main orchestrator for the task management widget
 * 
 * Architecture:
 * - Follows SOLID principles
 * - Uses custom hooks for logic separation
 * - Composed of smaller, focused components
 * - Type-safe with TypeScript
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { CollapsedRunningTask } from './components/CollapsedRunningTask';
import { TaskItem } from './components/TaskItem';
import { TodoWidgetHeader } from './components/TodoWidgetHeader';
import { useTaskFiltering } from './hooks/useTaskFiltering';
import { useTaskOperations } from './hooks/useTaskOperations';
import { useTaskThread } from './hooks/useTaskThread';
import { TodoWidgetProps } from './types';
import { findFirstRunningTask } from './utils/taskSortUtils';
import { isTaskActive } from './utils/taskStatusUtils';
import {
  fetchTasks,
  selectTasksByThread,
  selectPlanByThread,
  selectTasksLoading,
  selectTasksError,
  selectTasksExpanded,
  setTasksExpanded,
} from '../../redux/slices/tasks/index';
import { useSelector, useDispatch } from '../../redux/store';
import Iconify from '../iconify/Iconify';

/**
 * Main Todo Widget Component
 * 
 * Responsibilities:
 * - Orchestrates child components
 * - Manages widget state (expand/collapse)
 * - Fetches initial data
 * - Handles rendering conditions
 * 
 * Follows:
 * - Single Responsibility: Only orchestrates, delegates logic to hooks/components
 * - Open/Closed: Extensible through props and hooks
 * - Dependency Inversion: Depends on abstractions (hooks) not implementations
 */
export const TodoWidget = ({ threadId, mode = 'standard' }: TodoWidgetProps) => {
  const dispatch = useDispatch();
  const { altanerId } = useParams<{ altanerId: string }>();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Redux state
  const tasks = useSelector((state) => selectTasksByThread(state, threadId));
  const plan = useSelector((state) => selectPlanByThread(state, threadId));
  const isLoading = useSelector(selectTasksLoading(threadId));
  const error = useSelector(selectTasksError(threadId));
  const isExpanded = useSelector(selectTasksExpanded(threadId));

  // Custom hooks for business logic
  const { updateTaskStatus, deleteTask } = useTaskOperations({ threadId });
  const { openTaskThread } = useTaskThread();
  const { statusFilter, setStatusFilter, filteredTasks, totalTasksCount } = useTaskFiltering({
    tasks,
    isLoading,
  });

  // Find running task for collapsed view
  const runningTask = useMemo(
    () => (tasks ? findFirstRunningTask(tasks) : null),
    [tasks]
  );

  // Fetch tasks on mount if in altaner context
  useEffect(() => {
    if (altanerId && threadId) {
      dispatch(fetchTasks(threadId));
    }
  }, [altanerId, threadId, dispatch]);

  // Auto-expand on first load if there are active tasks
  useEffect(() => {
    if (!hasInitialized && filteredTasks.length > 0 && !isLoading) {
      const hasActiveTasks = filteredTasks.some(isTaskActive);

      if (hasActiveTasks) {
        dispatch(setTasksExpanded({ threadId, expanded: true }));
      }

      setHasInitialized(true);
    }
  }, [filteredTasks, isLoading, hasInitialized, dispatch, threadId]);

  // Early returns for various conditions
  if (!altanerId) {
    return null;
  }

  if (mode === 'mini') {
    return null;
  }

  if (!isLoading && (!tasks || tasks.length === 0)) {
    return null;
  }

  if (error) {
    return (
      <div className="w-full max-w-[700px] mx-auto">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-t-3xl bg-red-50/90 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 backdrop-blur-lg text-red-700 dark:text-red-300">
          <Iconify icon="mdi:alert-circle" className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Failed to load tasks</span>
        </div>
      </div>
    );
  }

  if (isLoading && (!tasks || tasks.length === 0)) {
    return null;
  }

  const handleToggleExpand = () => {
    dispatch(setTasksExpanded({ threadId, expanded: !isExpanded }));
  };

  return (
    <div className="w-full max-w-[700px] mx-auto">
      {/* Header */}
      <TodoWidgetHeader
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
        filteredTasksCount={filteredTasks.length}
        totalTasksCount={totalTasksCount}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        plan={plan}
      />

      {/* Collapsed Running Task Display */}
      {!isExpanded && runningTask && (
        <CollapsedRunningTask task={runningTask} onOpenSubthread={openTaskThread} />
      )}

      {/* Expandable Task List */}
      <div
        className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/90 dark:bg-[#1c1c1c]/90 border-x border-b border-gray-200/30 dark:border-gray-700/30 backdrop-blur-lg">
          <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 py-1 max-h-80">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onOpenSubthread={openTaskThread}
                onUpdateTask={updateTaskStatus}
                onDeleteTask={deleteTask}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

