import { Tooltip } from '@mui/material';
import React, { memo, useMemo, useState, useCallback } from 'react';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';
import { cn } from '@lib/utils';

import {
  makeSelectToolPartHeader,
  makeSelectToolPartExecution,
  switchToThread,
  makeSelectToolPartsByThreadId,
  selectActiveActivationsByThread,
} from '../../../redux/slices/room';
import { selectTasksByThread } from '../../../redux/slices/tasks';
import { useSelector, useDispatch } from '../../../redux/store.js';
import { AgentOrbAvatar } from '../../agents/AgentOrbAvatar.jsx';
import Iconify from '../../iconify/Iconify.jsx';
import IconRenderer from '../../icons/IconRenderer.jsx';
import { agentColors } from '../../plan/planUtils.js';
import { getToolIcon } from '../tool-renderers/index.js';
import ToolPartCard from '../ToolPartCard.jsx';

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
  const [taskExpanded, setTaskExpanded] = useState(true); // Auto-expand by default

  const headerSelector = useMemo(() => makeSelectToolPartHeader(), []);
  const executionSelector = useMemo(() => makeSelectToolPartExecution(), []);
  const toolPartsSelector = useMemo(() => makeSelectToolPartsByThreadId(), []);

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

  // Get tool parts from the task's subthread (where the actual work happens)
  const toolParts = useSelector((state) =>
    taskData?.subthread_id ? toolPartsSelector(state, taskData.subthread_id) : [],
  );

  // Check if the subthread has active activations (real-time indicator)
  const activeActivations = useSelector((state) =>
    taskData?.subthread_id ? selectActiveActivationsByThread(taskData.subthread_id)(state) : [],
  );
  const hasActiveActivation = activeActivations && activeActivations.length > 0;

  // Handlers
  const handleToggleTask = useCallback((e) => {
    e?.stopPropagation();
    setTaskExpanded((prev) => !prev);
  }, []);

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

  // Check Redux for latest task status (for real-time updates)
  const reduxTask = useMemo(() => {
    if (!taskData?.task_name) return null;
    return tasks?.find((t) => t.task_name === taskData.task_name && !t.plan_id);
  }, [tasks, taskData?.task_name]);

  const agentColor = taskData?.assigned_agent_name
    ? agentColors[taskData.assigned_agent_name]
    : null;
  // Use Redux status if available (for real-time updates), otherwise use taskData status
  const currentStatus = reduxTask?.status || taskData?.status;
  const isTaskRunning = hasActiveActivation || currentStatus?.toLowerCase() === 'running';

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
        {/* Task Header - Clickable to expand/collapse */}
        <div
          className="px-3 py-2.5 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 cursor-pointer transition-colors"
          onClick={handleToggleTask}
        >
          <div className="flex items-center gap-2.5">
            {/* Expand/Collapse Icon */}
            <Iconify
              icon={taskExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
              className={cn(
                'w-4 h-4 transition-transform duration-200 flex-shrink-0',
                isTaskRunning ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400',
              )}
            />

            {/* Agent Avatar */}
            {agentColor && (
              <Tooltip title={`Assigned to: ${taskData.assigned_agent_name}`}>
                <div className="flex-shrink-0">
                  <AgentOrbAvatar
                    size={20}
                    agentId={taskData.assigned_agent_name}
                    colors={agentColor}
                    isStatic={!isTaskRunning}
                    agentState={isTaskRunning ? 'thinking' : null}
                  />
                </div>
              </Tooltip>
            )}

            {/* Task Name */}
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {taskData.task_name || 'Untitled Task'}
              </span>
              {isTaskRunning && (
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
              )}
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

        {/* Expanded Content - Subtasks */}
        {taskExpanded && toolParts.length > 0 && (
          <div className="px-3 pb-3 bg-gray-50/30 dark:bg-gray-800/20 border-t border-gray-200 dark:border-gray-700">
            <div className="ml-6.5 mt-3 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Iconify
                  icon="mdi:wrench-outline"
                  className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                />
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Subtasks ({toolParts.length})
                </span>
              </div>
              {toolParts.map((toolPart) => (
                <ToolPartCard key={toolPart.id} partId={toolPart.id} noClick={false} />
              ))}
            </div>
          </div>
        )}

        {/* Loading state when task is running but no subtasks yet */}
        {taskExpanded && toolParts.length === 0 && isTaskRunning && (
          <div className="px-3 pb-3 bg-gray-50/30 dark:bg-gray-800/20 border-t border-gray-200 dark:border-gray-700">
            <div className="ml-6.5 mt-3 text-xs text-gray-500 dark:text-gray-400 italic flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
              Waiting for subtasks...
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CreateTaskRenderer.displayName = 'CreateTaskRenderer';

export default CreateTaskRenderer;
