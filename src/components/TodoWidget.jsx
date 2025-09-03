import { memo, useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { Typography } from '@mui/material';

import { TextShimmer } from './aceternity/text/text-shimmer.tsx';
import Iconify from './iconify/Iconify.jsx';
import {
  fetchTasks,
  selectTasksByThread,
  selectTasksLoading,
  selectTasksError,
} from '../redux/slices/tasks';
import { switchToThread } from '../redux/slices/room';
import { useSelector, useDispatch } from '../redux/store';

const TodoWidget = ({ threadId }) => {
  const dispatch = useDispatch();
  const { altanerId } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const tasks = useSelector(selectTasksByThread(threadId));
  const isLoading = useSelector(selectTasksLoading(threadId));
  const error = useSelector(selectTasksError(threadId));

  // eslint-disable-next-line no-console
  console.log("tasks", tasks);

  // Sort tasks by status priority: running -> ready -> to-do -> completed
  const sortedTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const statusPriority = {
      running: 1,
      ready: 2,
      'to-do': 3,
      todo: 3,
      pending: 3,
      completed: 4,
      done: 4,
    };

    return [...tasks].sort((a, b) => {
      const priorityA = statusPriority[a.status?.toLowerCase()] || 5;
      const priorityB = statusPriority[b.status?.toLowerCase()] || 5;
      return priorityA - priorityB;
    });
  }, [tasks]);

  // Handle opening subthread in a new tab
  const handleOpenSubthread = useCallback((task) => {
    if (task.subthread_id) {
      dispatch(switchToThread({
        threadId: task.subthread_id,
        threadName: task.task_name || 'Task Thread',
      }));
    }
  }, [dispatch]);

  // Get the first running task to show in collapsed state
  const runningTask = useMemo(() => {
    return sortedTasks.find(task => task.status?.toLowerCase() === 'running');
  }, [sortedTasks]);

  // Only fetch tasks if we're inside an altaner context
  useEffect(() => {
    if (altanerId && threadId) {
      dispatch(fetchTasks(threadId));
    }
  }, [altanerId, threadId, dispatch]);

  // Auto-expand on first load if there are active (non-completed) tasks
  useEffect(() => {
    if (!hasInitialized && sortedTasks.length > 0 && !isLoading) {
      const hasActiveTasks = sortedTasks.some(task => 
        !['completed', 'done'].includes(task.status?.toLowerCase())
      );
      
      if (hasActiveTasks) {
        setIsExpanded(true);
      }
      
      setHasInitialized(true);
    }
  }, [sortedTasks, isLoading, hasInitialized]);

  // Don't render if we're not in an altaner context
  if (!altanerId) {
    return null;
  }

  // Don't render if no tasks and not loading
  if (!isLoading && (!tasks || tasks.length === 0)) {
    return null;
  }

  const getTaskIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'mdi:check-circle';
      default:
        return 'mdi:circle-outline';
    }
  };

  const getTaskIconColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'text-green-600 dark:text-green-400';
      case 'ready':
        return 'text-amber-600 dark:text-amber-400';
      case 'running':
        return 'text-blue-600 dark:text-blue-400';
      case 'to-do':
      case 'todo':
      case 'pending':
        return 'text-gray-500 dark:text-gray-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getTaskTextStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'text-gray-600 dark:text-gray-400 line-through';
      case 'ready':
        return 'text-amber-700 dark:text-amber-300 font-medium';
      case 'to-do':
      case 'todo':
      case 'pending':
      case 'running':
        return 'text-gray-900 dark:text-gray-100';
      default:
        return 'text-gray-900 dark:text-gray-100';
    }
  };

  // Show compact error state
  if (error) {
    return (
      <div className="w-full max-w-[700px] mx-auto">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-t-3xl bg-red-50/90 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 backdrop-blur-lg text-red-700 dark:text-red-300">
          <Iconify
            icon="mdi:alert-circle"
            className="w-3.5 h-3.5"
          />
          <span className="text-xs font-medium">
            Failed to load tasks
          </span>
        </div>
      </div>
    );
  }

  // Don't show anything while loading - only show once loaded
  if (isLoading && (!tasks || tasks.length === 0)) {
    return null;
  }

  return (
    <div className="w-full max-w-[700px] mx-auto">
      {/* Compact Collapsible Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-3 py-1.5 rounded-t-3xl cursor-pointer bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-lg text-gray-900 dark:text-gray-100 transition-colors duration-200 hover:bg-white/95 dark:hover:bg-[#1c1c1c]/95 hover:border-gray-300/40 dark:hover:border-gray-600/40"
      >
        <div className="flex items-center gap-1.5">
          <Iconify
            icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-150"
          />
          <Iconify
            icon="mdi:format-list-checks"
            className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
          />
          <span className="text-xs font-medium">
            {sortedTasks.length} Task{sortedTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {/* Show running task when collapsed */}
        {!isExpanded && runningTask && (
          <div className="flex items-center gap-1.5 max-w-[200px]">
            <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
            <TextShimmer
              className="text-xs font-medium truncate leading-none"
              duration={2}
            >
              {runningTask.task_name || 'Running task...'}
            </TextShimmer>
            {runningTask.subthread_id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenSubthread(runningTask);
                }}
                className="p-0.5 rounded hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors group"
                title={`Open task thread: ${runningTask.task_name}`}
              >
                <Iconify
                  icon="mdi:open-in-new"
                  className="w-2.5 h-2.5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Compact Expandable Content */}
      <div
        className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/90 dark:bg-[#1c1c1c]/90 border-x border-b border-gray-200/30 dark:border-gray-700/30 backdrop-blur-lg">
          <div className="max-h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 py-1">
            {sortedTasks.map((task, index) => (
              <div
                key={task.id || index}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors duration-150"
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  <Iconify
                    icon={getTaskIcon(task.status)}
                    className={`w-3 h-3 ${getTaskIconColor(task.status)}`}
                  />
                </div>

                {/* Task Content with Status-Based Styling */}
                <div className="flex-1 min-w-0 flex items-center">
                  {task.status?.toLowerCase() === 'running' ? (
                    <TextShimmer
                      className="text-xs font-medium truncate leading-none"
                      duration={2}
                    >
                      {task.task_name || 'Untitled Task'}
                    </TextShimmer>
                  ) : (
                    <Typography
                      variant="caption"
                      className={`font-medium truncate text-xs leading-none ${getTaskTextStyle(task.status)}`}
                      title={task.task_name}
                    >
                      {task.task_name || 'Untitled Task'}
                    </Typography>
                  )}
                </div>

                {/* Subthread Icon - show if task has subthread_id */}
                {task.subthread_id && (
                  <div className="flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSubthread(task);
                      }}
                      className="p-0.5 rounded hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors group"
                      title={`Open task thread: ${task.task_name}`}
                    >
                      <Iconify
                        icon="mdi:open-in-new"
                        className="w-3 h-3 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(TodoWidget);
