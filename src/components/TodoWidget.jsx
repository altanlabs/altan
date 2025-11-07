import { Tooltip, Typography } from '@mui/material';
import { memo, useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { TextShimmer } from './aceternity/text/text-shimmer.tsx';
import { AgentOrbAvatar } from './agents/AgentOrbAvatar';
import Iconify from './iconify/Iconify.jsx';
import MessageContent from './messages/MessageContent';
import { agentColors } from './plan/planUtils';
import {
  switchToThread,
  makeSelectSortedThreadMessageIds,
  selectMessagesById,
} from '../redux/slices/room';
import {
  fetchTasks,
  selectTasksByThread,
  selectPlanByThread,
  selectTasksLoading,
  selectTasksError,
  selectTasksExpanded,
  setTasksExpanded,
} from '../redux/slices/tasks';
import { useSelector, useDispatch } from '../redux/store';

// Helper component to render each task with its messages
const TaskItem = memo(({ task, onOpenSubthread }) => {
  const messagesSelector = useMemo(() => makeSelectSortedThreadMessageIds(), []);
  const messagesById = useSelector(selectMessagesById);

  // Get messages from the task's subthread
  const messageIds = useSelector((state) =>
    task.subthread_id ? messagesSelector(state, task.subthread_id) : [],
  );

  // Get the second message (index 1) - this is the agent's response
  const secondMessage = messageIds.length > 1 ? messagesById[messageIds[1]] : null;

  // Determine if message is being generated (exists but not yet replied)
  const isMessageGenerating = secondMessage && !secondMessage.replied;

  // Task is running if status is running
  const isRunning = task.status?.toLowerCase() === 'running';

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

  return (
    <div className="border-b border-gray-200/30 dark:border-gray-700/30 last:border-b-0">
      {/* Task Header Row */}
      <div className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors duration-150">
        <div className="flex items-center gap-2 px-3 py-1.5">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            <Iconify
              icon={getTaskIcon(task.status)}
              className={`w-3 h-3 ${getTaskIconColor(task.status)}`}
            />
          </div>

          {/* Assigned Agent Avatar */}
          {task.assigned_agent_name && agentColors[task.assigned_agent_name] && (
            <div className="flex-shrink-0">
              <Tooltip title={`Assigned to: ${task.assigned_agent_name}`}>
                <AgentOrbAvatar
                  size={18}
                  agentId={task.assigned_agent_name}
                  colors={agentColors[task.assigned_agent_name]}
                  isStatic={!isRunning}
                  agentState={isRunning ? 'thinking' : null}
                />
              </Tooltip>
            </div>
          )}

          {/* Task Content with Status-Based Styling */}
          <div className="flex-1 min-w-0">
            {isRunning ? (
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
            <div className="flex-shrink-0">
              {/* Open in New Tab Button */}
              <Tooltip title={`Open task thread: ${task.task_name}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSubthread(task);
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
      </div>

      {/* Message Content - show when task is running and has messages */}
      {isRunning && secondMessage && isMessageGenerating && (
        <div className="px-3 py-2 bg-gray-50/30 dark:bg-gray-800/20">
          <MessageContent
            message={secondMessage}
            threadId={task.subthread_id}
            mode="mini"
          />
        </div>
      )}
    </div>
  );
});

TaskItem.displayName = 'TaskItem';

const TodoWidget = ({ threadId, mode = 'standard' }) => {
  const dispatch = useDispatch();
  const { altanerId } = useParams();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [statusFilter, setStatusFilter] = useState('running'); // all, running, todo, completed

  const tasks = useSelector(selectTasksByThread(threadId));
  const plan = useSelector(selectPlanByThread(threadId));
  const isLoading = useSelector(selectTasksLoading(threadId));
  const error = useSelector(selectTasksError(threadId));
  const isExpanded = useSelector(selectTasksExpanded(threadId));

  // Get total tasks count (for display)
  const totalTasksCount = useMemo(() => {
    if (!tasks || tasks.length === 0) return 0;
    return tasks.filter((task) => !task.plan_id).length;
  }, [tasks]);

  // Filter tasks without plan_id and sort by status priority: running -> ready -> to-do -> completed
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

    // Filter by status if not 'all'
    let filteredTasks = [...tasks].filter((task) => !task.plan_id);

    if (statusFilter !== 'all') {
      filteredTasks = filteredTasks.filter((task) => {
        const taskStatus = task.status?.toLowerCase();
        if (statusFilter === 'running') {
          return taskStatus === 'running';
        } else if (statusFilter === 'todo') {
          return taskStatus === 'to-do' || taskStatus === 'todo' || taskStatus === 'pending' || taskStatus === 'ready';
        } else if (statusFilter === 'completed') {
          return taskStatus === 'completed' || taskStatus === 'done';
        }
        return true;
      });
    }

    // Sort by priority
    return filteredTasks.sort((a, b) => {
      const priorityA = statusPriority[a.status?.toLowerCase()] || 5;
      const priorityB = statusPriority[b.status?.toLowerCase()] || 5;
      return priorityA - priorityB;
    });
  }, [tasks, statusFilter]);

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

  // Get the first running task to show in collapsed state (from all tasks, not filtered)
  const runningTask = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;
    const allTasksWithoutPlan = tasks.filter((task) => !task.plan_id);
    return allTasksWithoutPlan.find((task) => task.status?.toLowerCase() === 'running');
  }, [tasks]);

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
      <div className="flex items-center justify-between px-3 py-1.5 rounded-t-3xl bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-lg text-gray-900 dark:text-gray-100 transition-colors duration-200 hover:bg-white/95 dark:hover:bg-[#1c1c1c]/95 hover:border-gray-300/40 dark:hover:border-gray-600/40">
        <div
          onClick={() => dispatch(setTasksExpanded({ threadId, expanded: !isExpanded }))}
          className="flex items-center gap-1.5 cursor-pointer flex-1"
        >
          <Iconify
            icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-150"
          />
          <Iconify
            icon="mdi:format-list-checks"
            className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
          />
          <span className="text-xs font-medium">
            {isExpanded && statusFilter !== 'all' && sortedTasks.length !== totalTasksCount
              ? `${sortedTasks.length} of ${totalTasksCount} Task${totalTasksCount !== 1 ? 's' : ''}`
              : `${totalTasksCount} Task${totalTasksCount !== 1 ? 's' : ''}`}
          </span>
          {plan && plan.title && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              · {plan.title}
            </span>
          )}
          {plan && plan.status && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                plan.status === 'draft'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  : plan.status === 'approved'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}
            >
              {plan.status}
            </span>
          )}
          {plan && plan.is_approved && (
            <Tooltip title="Plan Approved">
              <Iconify
                icon="mdi:check-decagram"
                className="w-3 h-3 text-green-600 dark:text-green-400"
              />
            </Tooltip>
          )}
        </div>

        {/* Status Filter Toggle - only show when expanded */}
        {isExpanded && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-0.5 ml-2"
          >
            <Tooltip title="All tasks">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                All
              </button>
            </Tooltip>
            <Tooltip title="Running tasks">
              <button
                onClick={() => setStatusFilter('running')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                  statusFilter === 'running'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Iconify
                  icon="mdi:play-circle"
                  className="w-3 h-3"
                />
              </button>
            </Tooltip>
            <Tooltip title="Todo tasks">
              <button
                onClick={() => setStatusFilter('todo')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                  statusFilter === 'todo'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Iconify
                  icon="mdi:circle-outline"
                  className="w-3 h-3"
                />
              </button>
            </Tooltip>
            <Tooltip title="Completed tasks">
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                  statusFilter === 'completed'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Iconify
                  icon="mdi:check-circle"
                  className="w-3 h-3"
                />
              </button>
            </Tooltip>
          </div>
        )}

        {/* Show running task info when collapsed */}
        {!isExpanded && runningTask && (
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>

            {/* Assigned Agent Avatar in collapsed view */}
            {runningTask.assigned_agent_name && agentColors[runningTask.assigned_agent_name] && (
              <Tooltip title={`Assigned to: ${runningTask.assigned_agent_name}`}>
                <div className="flex-shrink-0">
                  <AgentOrbAvatar
                    size={18}
                    agentId={runningTask.assigned_agent_name}
                    colors={agentColors[runningTask.assigned_agent_name]}
                    isStatic={false}
                    agentState="thinking"
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
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/90 dark:bg-[#1c1c1c]/90 border-x border-b border-gray-200/30 dark:border-gray-700/30 backdrop-blur-lg">
          <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 py-1 max-h-80">
            {sortedTasks.map((task, index) => (
              <TaskItem
                key={task.id || index}
                task={task}
                onOpenSubthread={handleOpenSubthread}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(TodoWidget);
