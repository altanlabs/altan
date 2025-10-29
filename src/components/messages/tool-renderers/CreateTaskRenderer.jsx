import { Tooltip } from '@mui/material';
import React, { memo, useMemo, useCallback } from 'react';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';
import { cn } from '@lib/utils';

import {
  makeSelectToolPartHeader,
  makeSelectToolPartExecution,
  switchToThread,
  makeSelectSortedThreadMessageIds,
  selectMessagesById,
} from '../../../redux/slices/room';
import { selectTasksByThread } from '../../../redux/slices/tasks';
import { useSelector, useDispatch } from '../../../redux/store.js';
import { AgentOrbAvatar } from '../../agents/AgentOrbAvatar.jsx';
import Iconify from '../../iconify/Iconify.jsx';
import IconRenderer from '../../icons/IconRenderer.jsx';
import { agentColors } from '../../plan/planUtils.js';
import MessageContent from '../MessageContent.jsx';
import { getToolIcon } from '../tool-renderers/index.js';

function extractAndCapitalize(str) {
  if (!str) return 'Tool';
  const lastSubstring = str.split('.').pop();
  return lastSubstring
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Custom renderer for create_task tool
 * Fetches and displays the actual task from Redux with expand/collapse
 */
const CreateTaskRenderer = memo(({ part, isExpanded: toolExpanded, onToggle: toolOnToggle }) => {
  const dispatch = useDispatch();

  const headerSelector = useMemo(() => makeSelectToolPartHeader(), []);
  const executionSelector = useMemo(() => makeSelectToolPartExecution(), []);
  const messagesSelector = useMemo(() => makeSelectSortedThreadMessageIds(), []);

  const header = useSelector((state) => headerSelector(state, part?.id));
  const execution = useSelector((state) => executionSelector(state, part?.id));

  // Get all tasks from the current thread
  const tasks = useSelector((state) => selectTasksByThread(part?.thread_id)(state));

  const isCompleted = header?.is_done;
  const isExecuting =
    !isCompleted && (header?.status === 'running' || header?.status === 'preparing');

  // Get task data from tool result (preferred) or from Redux (fallback)
  const taskData = useMemo(() => {
    // First, try to get task from the tool result (this is the source of truth)
    if (part?.result) {
      try {
        const result = typeof part.result === 'string' ? JSON.parse(part.result) : part.result;
        const data = result.payload?.data || result.data || result;

        if (data && data.task_name) {
          return {
            id: data.id,
            task_name: data.task_name,
            task_description: data.task_description,
            status: data.status,
            assigned_agent_name: data.assigned_agent_name,
            subthread_id: data.subthread_id,
            priority: data.priority,
          };
        }
      } catch {
        // Silently ignore parse errors
      }
    }

    // Fallback: find task in Redux by name (for backward compatibility)
    let taskNameFromArgs = null;
    try {
      if (part?.arguments) {
        const args =
          typeof part.arguments === 'string' ? JSON.parse(part.arguments) : part.arguments;
        taskNameFromArgs = args.task_name;
      }
    } catch {
      // Silently ignore parse errors
    }

    if (taskNameFromArgs) {
      const matchingTask = tasks?.find((t) => t.task_name === taskNameFromArgs && !t.plan_id);
      if (matchingTask) {
        // eslint-disable-next-line no-console
        console.log('CreateTaskRenderer - Got task from Redux fallback:', matchingTask);
      } else {
        // eslint-disable-next-line no-console
        console.log('CreateTaskRenderer - Task not found. Searched for:', taskNameFromArgs);
      }
      return matchingTask || null;
    }

    // eslint-disable-next-line no-console
    console.log('CreateTaskRenderer - No task data available');
    return null;
  }, [part?.result, part?.arguments, tasks]);

  // Get messages from the task's subthread (where the actual work happens)
  const messageIds = useSelector((state) =>
    taskData?.subthread_id ? messagesSelector(state, taskData.subthread_id) : [],
  );
  const messagesById = useSelector(selectMessagesById);

  // Get the second message (index 1) - this is the agent's response
  const secondMessage = messageIds.length > 1 ? messagesById[messageIds[1]] : null;

  // Determine if message is being generated (exists but not yet replied)
  const isMessageGenerating = secondMessage && !secondMessage.replied;

  // Auto-expand when message is generating, auto-collapse when complete
  const taskExpanded = isMessageGenerating;

  // Handlers
  const handleOpenSubthread = useCallback(
    (e) => {
      e?.stopPropagation();
      if (taskData?.subthread_id) {
        dispatch(
          switchToThread({
            threadId: taskData.subthread_id,
            threadName: taskData.task_name || 'Task Thread',
          }),
        );
      }
    },
    [dispatch, taskData],
  );

  // Determine what to display as the main text
  const displayText = useMemo(() => {
    if (!header) return '';
    if (isExecuting && header.act_now) {
      return header.act_now;
    }
    if (!isExecuting && header.act_done) {
      return header.act_done;
    }
    return extractAndCapitalize(header.name);
  }, [header, isExecuting]);

  // Get tool icon from registry
  const toolIcon = useMemo(() => {
    const toolName = header?.name;
    const fallbackIcon =
      execution?.task_execution?.tool?.action_type?.connection_type?.icon || 'ri:hammer-fill';
    return getToolIcon(toolName, fallbackIcon);
  }, [header?.name, execution?.task_execution?.tool?.action_type?.connection_type?.icon]);

  // Calculate duration
  const duration = useMemo(() => {
    if (!isCompleted || !header?.created_at || !header?.finished_at) return null;
    const start = new Date(header.created_at).getTime();
    const end = new Date(header.finished_at).getTime();
    const s = (end - start) / 1000;
    return s < 10 ? s.toFixed(1) : Math.round(s);
  }, [isCompleted, header?.created_at, header?.finished_at]);

  const headerText = useMemo(() => {
    if (duration && parseFloat(duration) > 0) return `${displayText} (${duration}s)`;
    return displayText;
  }, [duration, displayText]);

  const agentColor = taskData?.assigned_agent_name
    ? agentColors[taskData.assigned_agent_name]
    : null;

  // Task is running if the second message exists and is still streaming
  const isTaskRunning = isMessageGenerating;

  if (!header) {
    return null;
  }

  // If we don't have the task yet, show simple header
  if (!taskData) {
    return (
      <div className="w-full">
        <button
          onClick={toolOnToggle}
          aria-expanded={toolExpanded}
          className="w-full flex items-center gap-1.5 px-1 py-1.5 text-[12px] text-gray-400 dark:text-gray-300 group"
          title={header.intent || undefined}
        >
          <span className="flex items-center gap-1">
            <IconRenderer
              icon={toolIcon}
              className={cn('text-[11px] flex-shrink-0', !isCompleted && 'animate-pulse')}
            />
            {!isCompleted && (
              <span className="inline-block w-1 h-3 rounded-sm bg-gray-400/70 animate-pulse" />
            )}
          </span>

          {!isCompleted ? (
            <TextShimmer className="inline-block">{headerText}</TextShimmer>
          ) : (
            <span className="font-medium">{headerText}</span>
          )}
        </button>
      </div>
    );
  }

  // Render full task card with expand/collapse
  return (
    <div className="w-full my-2">
      {/* Task Card */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50 overflow-hidden">
        {/* Task Header */}
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            {/* Expand/Collapse Icon - only show when second message exists */}
            {secondMessage && (
              <Iconify
                icon={taskExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                className={cn(
                  'w-4 h-4 transition-transform duration-200 flex-shrink-0',
                  isTaskRunning ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400',
                )}
              />
            )}

            {/* Agent Avatar */}
            {agentColor && (
              <Tooltip title={`Assigned to: ${taskData.assigned_agent_name}`}>
                <div className="flex-shrink-0 transition-all duration-300">
                  <AgentOrbAvatar
                    size={isTaskRunning ? 30 : 20}
                    agentId={taskData.assigned_agent_name}
                    colors={agentColor}
                    agentState={isTaskRunning ? 'thinking' : null}
                    isStatic={false}
                  />
                </div>
              </Tooltip>
            )}

            {/* Task Name */}
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {taskData.task_name || 'Untitled Task'}
              </span>
            </div>

            {/* Open Thread Button */}
            {taskData.subthread_id && (
              <Tooltip title="View task execution details">
                <button
                  onClick={handleOpenSubthread}
                  className="p-1.5 rounded hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors group flex-shrink-0"
                >
                  <Iconify
                    icon="mdi:open-in-new"
                    className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                  />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Expanded Content - Second Message */}
        {taskExpanded && secondMessage && (
          <div className="px-3 py-3 bg-gray-50/30 dark:bg-gray-800/20 border-t border-gray-200 dark:border-gray-700">
            <MessageContent
              message={secondMessage}
              threadId={taskData.subthread_id}
              mode="mini"
            />
          </div>
        )}
      </div>
    </div>
  );
});

CreateTaskRenderer.displayName = 'CreateTaskRenderer';

export default CreateTaskRenderer;
