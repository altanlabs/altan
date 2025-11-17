/**
 * Tasks Section
 * Displays standalone tasks (outside of plans) within the action cockpit
 */

import React, { memo, useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from '../../../redux/store';

import { CollapsedRunningTask } from '../../todo/components/CollapsedRunningTask';
import { TaskItem } from '../../todo/components/TaskItem';
import { TodoWidgetHeader } from '../../todo/components/TodoWidgetHeader';
import { useTaskFiltering } from '../../todo/hooks/useTaskFiltering';
import { useTaskOperations } from '../../todo/hooks/useTaskOperations';
import { useTaskThread } from '../../todo/hooks/useTaskThread';
import { findFirstRunningTask } from '../../todo/utils/taskSortUtils';
import { isTaskActive } from '../../todo/utils/taskStatusUtils';
import {
  fetchTasks,
  selectTasksByThread,
  selectTasksLoading,
  selectTasksError,
  selectTasksExpanded,
  setTasksExpanded,
} from '../../../redux/slices/tasks/index';
import Iconify from '../../iconify/Iconify';

interface TasksSectionProps {
  threadId: string;
}

const TasksSection: React.FC<TasksSectionProps> = ({ threadId }) => {
  const dispatch = useDispatch();
  const { altanerId } = useParams<{ altanerId: string }>();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Redux state
  const tasks = useSelector((state) => selectTasksByThread(state, threadId));
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

  if (!isLoading && (!tasks || tasks.length === 0)) {
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5 border border-red-200 dark:border-red-800/30 rounded bg-red-50/90 dark:bg-red-900/20 text-red-700 dark:text-red-300">
        <Iconify icon="mdi:alert-circle" className="w-3 h-3" />
        <span className="text-xs font-medium">Failed to load tasks</span>
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
    <div>
      {/* Header */}
      <TodoWidgetHeader
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
        filteredTasksCount={filteredTasks.length}
        totalTasksCount={totalTasksCount}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        plan={null}
      />

      {/* Collapsed Running Task Display */}
      {!isExpanded && runningTask && (
        <CollapsedRunningTask task={runningTask} onOpenSubthread={openTaskThread} />
      )}

      {/* Expandable Task List */}
      {isExpanded && (
        <div className="border-x border-b border-neutral-200 dark:border-neutral-800 rounded-b max-h-80 overflow-y-auto">
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
      )}
    </div>
  );
};

export default memo(TasksSection);
export { TasksSection };

