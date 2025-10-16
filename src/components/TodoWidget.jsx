import { Tooltip, Typography } from '@mui/material';
import { memo, useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';

import { TextShimmer } from './aceternity/text/text-shimmer.tsx';
import Iconify from './iconify/Iconify.jsx';
import Message from './room/thread/Message.jsx';
import { switchToThread, makeSelectSortedThreadMessageIds } from '../redux/slices/room';
import {
  fetchTasks,
  selectTasksByThread,
  selectTasksLoading,
  selectTasksError,
  selectTasksExpanded,
  setTasksExpanded,
} from '../redux/slices/tasks';
import { useSelector, useDispatch } from '../redux/store';

// Separate component to handle each task's thread messages
const TaskThreadPreview = memo(({ task, isExpanded }) => {
  const messagesSelector = useMemo(() => makeSelectSortedThreadMessageIds(), []);
  const taskMessages = useSelector((state) =>
    task.subthread_id ? messagesSelector(state, task.subthread_id) : [],
  );

  if (!task.subthread_id || taskMessages.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-md overflow-hidden transition-all duration-300 ${
        isExpanded ? 'h-[450px]' : 'h-24'
      }`}
    >
      <Virtuoso
        key={`${task.id}-${taskMessages.length}`}
        data={taskMessages}
        alignToBottom
        followOutput="smooth"
        itemContent={(index, messageId) => (
          <div className={isExpanded ? 'px-2 py-1' : ''}>
            <Message
              messageId={messageId}
              threadId={task.subthread_id}
              mode="mini"
              disableEndButtons={true}
              previousMessageId={messageId}
            />
          </div>
        )}
        className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
      />
    </div>
  );
});

TaskThreadPreview.displayName = 'TaskThreadPreview';

const TodoWidget = ({ threadId, mode = 'standard' }) => {
  const dispatch = useDispatch();
  const { altanerId } = useParams();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  // Agent avatar mapping
  const agentAvatars = {
    Database:
      'https://api.altan.ai/platform/media/3f19f77d-7144-4dc0-a30d-722e6eebf131?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
    Genesis:
      'https://api.altan.ai/platform/media/a4ac5478-b3ae-477d-b1eb-ef47e710de7c?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
    Flow: 'https://api.altan.ai/platform/media/11bbbc50-3e4b-4465-96d2-e8f316e92130?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
    Interface:
      'https://api.altan.ai/platform/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
    Cloud:
      'https://api.altan.ai/platform/media/56a7aab7-7200-4367-856b-df82b6fa3eee?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
    Functions:
      'https://api.altan.ai/platform/media/22ed3f84-a15c-4050-88f0-d33cc891dc50?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
  };

  const tasks = useSelector(selectTasksByThread(threadId));
  const isLoading = useSelector(selectTasksLoading(threadId));
  const error = useSelector(selectTasksError(threadId));
  const isExpanded = useSelector(selectTasksExpanded(threadId));

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
  const handleOpenSubthread = useCallback(
    (task) => {
      if (task.subthread_id) {
        dispatch(
          switchToThread({
            threadId: task.subthread_id,
            threadName: task.task_name || 'Task Thread',
          }),
        );
      }
    },
    [dispatch],
  );

  // Get the first running task to show in collapsed state
  const runningTask = useMemo(() => {
    return sortedTasks.find((task) => task.status?.toLowerCase() === 'running');
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
      const hasActiveTasks = sortedTasks.some(
        (task) => !['completed', 'done'].includes(task.status?.toLowerCase()),
      );

      if (hasActiveTasks) {
        dispatch(setTasksExpanded({ threadId, expanded: true }));
      }

      setHasInitialized(true);
    }
  }, [sortedTasks, isLoading, hasInitialized, dispatch, threadId]);

  // Don't render if we're not in an altaner context
  if (!altanerId) {
    return null;
  }

  // Don't render in mini mode
  if (mode === 'mini') {
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
          <span className="text-xs font-medium">Failed to load tasks</span>
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
        onClick={() => dispatch(setTasksExpanded({ threadId, expanded: !isExpanded }))}
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

        {/* Show running task info when collapsed */}
        {!isExpanded && runningTask && (
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>

            {/* Assigned Agent Avatar in collapsed view */}
            {runningTask.assigned_agent_name && agentAvatars[runningTask.assigned_agent_name] && (
              <Tooltip title={`Assigned to: ${runningTask.assigned_agent_name}`}>
                <div className="flex-shrink-0">
                  <img
                    src={agentAvatars[runningTask.assigned_agent_name]}
                    alt={runningTask.assigned_agent_name}
                    className="w-3.5 h-3.5 rounded-full border border-white/20 dark:border-gray-700/50 shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </Tooltip>
            )}

            <div className="flex-1 min-w-0">
              {(() => {
                try {
                  const taskName = runningTask?.task_name;
                  const safeTaskName =
                    taskName !== null && taskName !== undefined && taskName !== ''
                      ? String(taskName).trim()
                      : 'Running task...';

                  if (!safeTaskName || safeTaskName.length === 0) {
                    return (
                      <span className="text-xs font-medium truncate leading-none text-gray-600 dark:text-gray-300">
                        Running task...
                      </span>
                    );
                  }

                  return (
                    <TextShimmer
                      className="text-xs font-medium truncate leading-none text-gray-600 dark:text-gray-300"
                      duration={2}
                    >
                      {safeTaskName}
                    </TextShimmer>
                  );
                } catch (error) {
                  // eslint-disable-next-line no-console
                  console.error('TextShimmer error in collapsed TodoWidget:', error, runningTask);
                  return (
                    <span className="text-xs font-medium truncate leading-none text-gray-600 dark:text-gray-300">
                      Running task...
                    </span>
                  );
                }
              })()}
            </div>

            {/* Compact action buttons */}
            {runningTask.subthread_id && (
              <div className="flex items-center gap-0.5 ml-1">
                <Tooltip title={`Open task thread: ${runningTask.task_name}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSubthread(runningTask);
                    }}
                    className="p-0.5 rounded transition-colors group hover:bg-gray-200/50 dark:hover:bg-gray-600/50"
                  >
                    <Iconify
                      icon="mdi:open-in-new"
                      className="w-2.5 h-2.5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compact Expandable Content */}
      <div
        className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
          isExpanded
            ? expandedTasks.size > 0
              ? 'max-h-[800px] opacity-100'
              : 'max-h-96 opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/90 dark:bg-[#1c1c1c]/90 border-x border-b border-gray-200/30 dark:border-gray-700/30 backdrop-blur-lg">
          <div
            className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 py-1 ${
              expandedTasks.size > 0 ? 'max-h-[550px]' : 'max-h-80'
            }`}
          >
            {sortedTasks.map((task, index) => (
              <div
                key={task.id || index}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors duration-150"
              >
                <div className="flex items-center gap-2 px-3 py-1.5">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    <Iconify
                      icon={getTaskIcon(task.status)}
                      className={`w-3 h-3 ${getTaskIconColor(task.status)}`}
                    />
                  </div>

                  {/* Assigned Agent Avatar */}
                  {task.assigned_agent_name && agentAvatars[task.assigned_agent_name] && (
                    <div className="flex-shrink-0">
                      <Tooltip title={`Assigned to: ${task.assigned_agent_name}`}>
                        <img
                          src={agentAvatars[task.assigned_agent_name]}
                          alt={task.assigned_agent_name}
                          className="w-4 h-4 rounded-full border border-white/30 dark:border-gray-600/50 shadow-sm hover:shadow-md transition-shadow"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </Tooltip>
                    </div>
                  )}

                  {/* Task Content with Status-Based Styling */}
                  <div className="flex-1 min-w-0">
                    {task.status?.toLowerCase() === 'running' ? (
                      (() => {
                        try {
                          const taskName = task?.task_name;
                          const safeTaskName =
                            taskName !== null && taskName !== undefined && taskName !== ''
                              ? String(taskName).trim()
                              : 'Untitled Task';

                          if (!safeTaskName || safeTaskName.length === 0) {
                            return (
                              <span className="text-xs font-medium truncate leading-none text-gray-900 dark:text-gray-100">
                                Untitled Task
                              </span>
                            );
                          }

                          return (
                            <TextShimmer
                              className="text-xs font-medium truncate leading-none"
                              duration={2}
                            >
                              {safeTaskName}
                            </TextShimmer>
                          );
                        } catch (error) {
                          // eslint-disable-next-line no-console
                          console.error('TextShimmer error in TodoWidget:', error, task);
                          return (
                            <span className="text-xs font-medium truncate leading-none text-gray-900 dark:text-gray-100">
                              Task Error
                            </span>
                          );
                        }
                      })()
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

                  {/* Subthread Actions - show if task has subthread_id */}
                  {task.subthread_id && (
                    <div className="flex-shrink-0 flex items-center gap-1">
                      {/* Expand/Collapse Button - only for running tasks */}
                      {task.status?.toLowerCase() === 'running' && (
                        <Tooltip
                          title={
                            expandedTasks.has(task.id)
                              ? 'Collapse thread view'
                              : 'Expand thread view'
                          }
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedTasks((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(task.id)) {
                                  newSet.delete(task.id);
                                } else {
                                  newSet.add(task.id);
                                }
                                return newSet;
                              });
                            }}
                            className="p-0.5 rounded hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors group"
                          >
                            <Iconify
                              icon={
                                expandedTasks.has(task.id)
                                  ? 'mdi:unfold-less-horizontal'
                                  : 'mdi:unfold-more-horizontal'
                              }
                              className="w-3 h-3 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                            />
                          </button>
                        </Tooltip>
                      )}

                      {/* Open in New Tab Button - always show if subthread exists */}
                      <Tooltip title={`Open task thread: ${task.task_name}`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSubthread(task);
                          }}
                          className="p-0.5 rounded hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors group"
                        >
                          <Iconify
                            icon="mdi:open-in-new"
                            className="w-3 h-3 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                          />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>

                {/* Thread preview for running tasks - always visible, expandable */}
                {task.status?.toLowerCase() === 'running' && task.subthread_id && (
                  <div className="ml-5 border-l-2 border-blue-500 dark:border-blue-400 pl-3 mt-2">
                    <TaskThreadPreview task={task} isExpanded={expandedTasks.has(task.id)} />
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
