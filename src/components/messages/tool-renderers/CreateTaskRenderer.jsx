import React, { memo, useMemo } from 'react';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';
import { cn } from '@lib/utils';

import {
  makeSelectToolPartHeader,
  makeSelectToolPartExecution,
} from '../../../redux/slices/room/selectors/messagePartSelectors';
import { useSelector } from '../../../redux/store.ts';
import IconRenderer from '../../icons/IconRenderer.jsx';
import { getToolIcon } from '../tool-renderers/index.js';

function extractAndCapitalize(str) {
  if (!str) return 'Tool';
  const lastSubstring = str.split('.').pop();
  return lastSubstring
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function sanitizeToolName(name) {
  if (!name || typeof name !== 'string') return 'Tool';
  const lower = name.toLowerCase().trim();

  const INVALID_KEYWORDS = [
    'updated',
    'update',
    'added',
    'add',
    'completed',
    'complete',
    'deleted',
    'delete',
    'created',
    'create',
    'removed',
    'remove',
    'started',
    'start',
    'finished',
    'finish',
    'failed',
    'fail',
  ];

  if (INVALID_KEYWORDS.includes(lower) || lower.length < 3) {
    return 'Tool';
  }

  return name;
}

/**
 * Simplified renderer for create_task tool
 * Shows basic tool execution like any other tool
 */
const CreateTaskRenderer = memo(({ part, isExpanded: toolExpanded, onToggle: toolOnToggle }) => {
  const headerSelector = useMemo(() => makeSelectToolPartHeader(), []);
  const executionSelector = useMemo(() => makeSelectToolPartExecution(), []);

  const header = useSelector((state) => headerSelector(state, part?.id));
  const execution = useSelector((state) => executionSelector(state, part?.id));

  const isCompleted = header?.is_done;
  const isExecuting =
    !isCompleted && (header?.status === 'running' || header?.status === 'preparing');

  // Determine what to display as the main text
  const displayText = useMemo(() => {
    if (!header) return '';
    if (isExecuting && header.act_now) {
      return header.act_now;
    }
    if (!isExecuting && header.act_done) {
      return header.act_done;
    }
    const safeName = sanitizeToolName(header.name);
    return extractAndCapitalize(safeName);
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

  if (!header) {
    return null;
  }

  // Simple tool header like any other tool
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
});

CreateTaskRenderer.displayName = 'CreateTaskRenderer';

export default CreateTaskRenderer;
