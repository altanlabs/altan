import { Icon } from '@iconify/react';
import React, { memo, useMemo, useCallback } from 'react';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';
import { cn } from '@lib/utils';

import { useExecutionDialog } from '../../../providers/ExecutionDialogProvider.jsx';
import { makeSelectToolPartHeader, makeSelectToolPartExecution } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';
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

const ToolPartHeader = ({
  partId,
  noClick = false,
  isExpanded,
  onToggle,
  hasDisplayableArguments,
  hasError,
  onErrorClick,
}) => {
  const { setExecutionId } = useExecutionDialog() || {};

  const headerSelector = useMemo(() => makeSelectToolPartHeader(), []);
  const executionSelector = useMemo(() => makeSelectToolPartExecution(), []);

  const header = useSelector((state) => headerSelector(state, partId));
  const execution = useSelector((state) => executionSelector(state, partId));

  const isCompleted = header?.is_done;
  const isExecuting = !isCompleted && (header?.status === 'running' || header?.status === 'preparing');

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
    const fallbackIcon = execution?.task_execution?.tool?.action_type?.connection_type?.icon || 'ri:hammer-fill';
    return getToolIcon(toolName, fallbackIcon);
  }, [header?.name, execution?.task_execution?.tool?.action_type?.connection_type?.icon]);

  // Get execution ID for the dialog
  const executionId = useMemo(() => {
    return execution?.task_execution_id || execution?.task_execution?.id || execution?.execution?.id || null;
  }, [execution?.task_execution_id, execution?.task_execution?.id, execution?.execution?.id]);

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

  // Click handler to open execution dialog (only on icon, not on whole card)
  const handleIconClick = useCallback((e) => {
    e.stopPropagation();
    if (!noClick && executionId && setExecutionId) {
      setExecutionId(executionId);
    }
  }, [noClick, executionId, setExecutionId]);

  if (!header) {
    return null;
  }

  return (
    <button
      onClick={onToggle}
      aria-expanded={isExpanded}
      className="w-full flex items-center gap-1.5 px-1 py-1.5 text-[12px] text-gray-400 dark:text-gray-300 group"
      title={header.intent || undefined}
    >
      <span className="flex items-center gap-1">
        <IconRenderer
          icon={toolIcon}
          className={cn(
            'text-[11px] flex-shrink-0',
            !isCompleted && 'animate-pulse',
          )}
          onClick={handleIconClick}
        />
        {!isCompleted && <span className="inline-block w-1 h-3 rounded-sm bg-gray-400/70 animate-pulse" />}
      </span>

      {!duration ? (
        <TextShimmer className="inline-block">
          {headerText}
        </TextShimmer>
      ) : (
        <span className="font-medium">{headerText}</span>
      )}

      {hasDisplayableArguments && (
        <Icon
          icon="mdi:chevron-down"
          className={cn(
            'w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-all duration-150',
            isExpanded ? 'rotate-180' : 'rotate-0',
          )}
        />
      )}

      {hasError && (
        <Icon
          icon="mdi:alert-circle"
          className="text-red-500 text-sm flex-shrink-0 cursor-pointer hover:text-red-600 ml-auto"
          onClick={onErrorClick}
        />
      )}
    </button>
  );
};

export default memo(ToolPartHeader, (prevProps, nextProps) => {
  // Only re-render if partId or control props change
  return (
    prevProps.partId === nextProps.partId &&
    prevProps.noClick === nextProps.noClick &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.hasDisplayableArguments === nextProps.hasDisplayableArguments &&
    prevProps.hasError === nextProps.hasError
  );
});
