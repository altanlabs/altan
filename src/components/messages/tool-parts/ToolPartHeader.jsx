import { Icon } from '@iconify/react';
import React, { memo, useMemo, useCallback } from 'react';

import { useExecutionDialog } from '../../../providers/ExecutionDialogProvider.jsx';
import { makeSelectToolPartHeader, makeSelectToolPartExecution } from '../../../redux/slices/room/selectors/messagePartSelectors';
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

const ToolPartHeader = ({
  partId,
  noClick = false,
  isExpanded,
  onToggle,
  hasError,
}) => {
  const { setExecutionId } = useExecutionDialog() || {};

  const headerSelector = useMemo(() => makeSelectToolPartHeader(), []);
  const executionSelector = useMemo(() => makeSelectToolPartExecution(), []);

  const header = useSelector((state) => headerSelector(state, partId));
  const execution = useSelector((state) => executionSelector(state, partId));

  const isCompleted = header?.is_done;
  const isExecuting = !isCompleted && (header?.status === 'running' || header?.status === 'preparing');

  // Get the tool name, checking for server_tool_use, mcp_call, and mcp_list_tools
  const rawToolName = useMemo(() => {
    const providerType = header?.meta_data?.provider_item_type;
    if (['server_tool_use', 'mcp_call', 'mcp_list_tools'].includes(providerType) && header?.meta_data?.name) {
      return header.meta_data.name;
    }
    return header?.name;
  }, [header?.name, header?.meta_data?.provider_item_type, header?.meta_data?.name]);

  const toolName = useMemo(() => sanitizeToolName(rawToolName), [rawToolName]);

  // Determine what to display as the main text
  const displayText = useMemo(() => {
    if (!header) return '';
    if (isExecuting && header.act_now) {
      return header.act_now;
    }
    if (!isExecuting && header.act_done) {
      return header.act_done;
    }
    return extractAndCapitalize(toolName);
  }, [header, isExecuting, toolName]);

  // Get tool icon from registry
  const toolIcon = useMemo(() => {
    const fallbackIcon = execution?.task_execution?.tool?.action_type?.connection_type?.icon || 'ri:hammer-fill';
    return getToolIcon(toolName, fallbackIcon);
  }, [toolName, execution?.task_execution?.tool?.action_type?.connection_type?.icon]);

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

  // Get status info
  const getStatusInfo = () => {
    if (isExecuting) {
      return {
        icon: 'svg-spinners:ring-resize',
        text: 'Running',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
      };
    }
    if (hasError) {
      return {
        icon: 'mdi:close-circle',
        text: 'Failed',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
      };
    }
    return {
      icon: 'mdi:check-circle',
      text: 'Done',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
    };
  };

  const statusInfo = getStatusInfo();

  // Text display
  const textDisplay = useMemo(() => {
    let text = displayText;
    if (isExpanded && duration && parseFloat(duration) > 0) {
      text += ` (${duration}s)`;
    }
    return text;
  }, [displayText, duration, isExpanded]);

  // Check if text is long enough to need fade
  const needsFade = textDisplay.length > 40;

  // Click handler to open execution dialog
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
      className={`inline-flex items-center gap-1.5 px-2 py-1 select-none relative min-w-0 group ${isExpanded ? 'w-full' : ''}`}
      title={header.intent || undefined}
    >
      {/* Expand Icon */}
      <Icon
        icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
        className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 text-[11px] flex-shrink-0 transition-all"
      />

      {/* Connection Type Icon - Always visible */}
      <IconRenderer
        icon={toolIcon}
        size={10}
        onClick={handleIconClick}
        className="text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 text-[10px] flex-shrink-0 transition-colors"
      />

      {/* Status Icon - just icon when collapsed */}
      {statusInfo && !isExpanded && (
        <Icon
          icon={statusInfo.icon}
          className={`text-[11px] flex-shrink-0 ${statusInfo.color.replace('text-', 'text-').replace('-600', '-500').replace('-400', '-500')}`}
        />
      )}

      {/* Status Badge with text - only when expanded */}
      {statusInfo && isExpanded && (
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
          <Icon icon={statusInfo.icon} className="text-[10px]" />
          <span>{statusInfo.text}</span>
        </div>
      )}

      {/* Text Display - with optional fade when collapsed and long */}
      {!isExpanded && (
        <div className="min-w-0 max-w-md overflow-hidden">
          <span
            className="text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 text-[10px] transition-colors block whitespace-nowrap"
            style={needsFade ? {
              maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
            } : {}}
          >
            {textDisplay}
          </span>
        </div>
      )}

      {/* Text Display - full when expanded */}
      {isExpanded && (
        <span className="text-gray-700 dark:text-gray-300 text-[10px]">
          {textDisplay}
        </span>
      )}

      {/* Spacer when expanded */}
      {isExpanded && <div className="flex-1" />}
    </button>
  );
};

export default memo(ToolPartHeader, (prevProps, nextProps) => {
  // Only re-render if partId or control props change
  return (
    prevProps.partId === nextProps.partId &&
    prevProps.noClick === nextProps.noClick &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.hasError === nextProps.hasError
  );
});
