import { Icon } from '@iconify/react';
import React, { memo, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';
import { cn } from '@lib/utils';

import { switchToThread } from '../../../redux/slices/room';
import { makeSelectToolPartHeader, makeSelectToolPartExecution } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';
import IconRenderer from '../../icons/IconRenderer.jsx';
import { getToolIcon } from '../tool-renderers/index.js';

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
  Services:
    'https://api.altan.ai/platform/media/22ed3f84-a15c-4050-88f0-d33cc891dc50?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
};

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
 * Displays the created task with agent avatar in a custom header
 */
const CreateTaskRenderer = memo(({ part, isExpanded, onToggle }) => {
  const dispatch = useDispatch();

  const headerSelector = useMemo(() => makeSelectToolPartHeader(), []);
  const executionSelector = useMemo(() => makeSelectToolPartExecution(), []);

  const header = useSelector((state) => headerSelector(state, part?.id));
  const execution = useSelector((state) => executionSelector(state, part?.id));

  const isCompleted = header?.is_done;
  const isExecuting = !isCompleted && (header?.status === 'running' || header?.status === 'preparing');

  // Parse task data from result
  const taskData = useMemo(() => {
    if (!part?.result) return null;

    try {
      const result = typeof part.result === 'string' ? JSON.parse(part.result) : part.result;

      // Handle both direct data and payload wrapper
      const data = result.payload?.data || result.data || result;

      if (!data) return null;

      return {
        taskName: data.task_name || 'Untitled Task',
        subthreadId: data.subthread_id,
        assignedAgentName: data.assigned_agent_name,
      };
    } catch (err) {
      console.error('Failed to parse create_task result:', err);
      return null;
    }
  }, [part?.result]);

  const handleOpenSubthread = useCallback(
    (e) => {
      e.stopPropagation();
      if (taskData?.subthreadId) {
        dispatch(
          switchToThread({
            threadId: taskData.subthreadId,
            threadName: taskData.taskName || 'Task Thread',
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

  const agentAvatar = taskData?.assignedAgentName ? agentAvatars[taskData.assignedAgentName] : null;

  if (!header) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Custom Header with Agent Avatar */}
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
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

        {!isCompleted && !taskData ? (
          <TextShimmer className="inline-block">{headerText}</TextShimmer>
        ) : (
          <span className="font-medium">{headerText}</span>
        )}

        {/* Agent Avatar - only show when task is created */}
        {agentAvatar && taskData && (
          <img
            src={agentAvatar}
            alt={taskData.assignedAgentName}
            className="w-4 h-4 rounded-full border border-white/30 dark:border-gray-600/50 shadow-sm ml-1"
            title={`Assigned to: ${taskData.assignedAgentName}`}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}

        {/* Task Created Indicator */}
        {taskData?.subthreadId && (
          <>
            <Icon icon="mdi:check-circle" className="text-sm text-green-600 dark:text-green-400 ml-1" />
            <button
              onClick={handleOpenSubthread}
              className="ml-auto flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Icon icon="mdi:open-in-new" className="text-sm" />
              Open task
            </button>
          </>
        )}
      </button>
    </div>
  );
});

CreateTaskRenderer.displayName = 'CreateTaskRenderer';

export default CreateTaskRenderer;

