import React, { memo, useMemo, useCallback } from 'react';
import { useHistory } from 'react-router';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';
import { cn } from '@lib/utils';

import {
  makeSelectToolPartHeader,
  makeSelectToolPartExecution,
} from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';
import { CustomAvatar } from '../../custom-avatar';
import StaticGradientAvatar from '../../agents/StaticGradientAvatar.jsx';
import Iconify from '../../iconify/Iconify.jsx';
import IconRenderer from '../../icons/IconRenderer.jsx';
import { getToolIcon } from './index.js';

function extractAndCapitalize(str) {
  if (!str) return 'Tool';
  const lastSubstring = str.split('.').pop();
  return lastSubstring
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Custom renderer for create_agent tool
 * Displays a beautiful agent card with avatar, name, description
 */
const CreateAgentRenderer = memo(({ part, isExpanded: toolExpanded, onToggle: toolOnToggle }) => {
  const history = useHistory();

  const headerSelector = useMemo(() => makeSelectToolPartHeader(), []);
  const executionSelector = useMemo(() => makeSelectToolPartExecution(), []);

  const header = useSelector((state) => headerSelector(state, part?.id));
  const execution = useSelector((state) => executionSelector(state, part?.id));

  const isCompleted = header?.is_done;
  const isExecuting =
    !isCompleted && (header?.status === 'running' || header?.status === 'preparing');

  // Extract agent data from tool result
  const agentData = useMemo(() => {
    if (!part?.result) return null;

    try {
      const result = typeof part.result === 'string' ? JSON.parse(part.result) : part.result;
      const agent = result.payload?.agent || result.agent || result;

      if (agent && agent.id && agent.name) {
        return {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          avatar_url: agent.avatar_url,
          meta_data: agent.meta_data,
          voice: agent.voice,
          llm_config: agent.llm_config,
          is_public: agent.is_public,
          elevenlabs_id: agent.elevenlabs_id,
        };
      }
    } catch (error) {
      console.error('Failed to parse agent data:', error);
    }

    return null;
  }, [part?.result]);

  // Navigate to agent page in new tab
  const handleOpenAgent = useCallback(
    (e) => {
      e?.stopPropagation();
      if (agentData?.id) {
        window.open(`/agent/${agentData.id}`, '_blank');
      }
    },
    [agentData],
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
      execution?.task_execution?.tool?.action_type?.connection_type?.icon || 'mdi:robot-happy';
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

  // If we don't have the agent data yet (still executing), show simple header
  if (!agentData) {
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

  // Render agent card
  return (
    <div className="w-full my-2">
      {/* Agent Card */}
      <div 
        className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50 overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group"
        onClick={handleOpenAgent}
      >
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Agent Avatar */}
            <div className="flex-shrink-0">
              {agentData.avatar_url && agentData.avatar_url.trim() !== '' ? (
                <CustomAvatar
                  src={agentData.avatar_url}
                  alt={agentData.name}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                  }}
                  name={agentData.name}
                />
              ) : (
                <StaticGradientAvatar
                  colors={agentData?.meta_data?.avatar_orb?.colors || ['#CADCFC', '#A0B9D1']}
                  size={48}
                />
              )}
            </div>

            {/* Agent Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {agentData.name}
                </h4>
                {agentData.is_public && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                    Public
                  </span>
                )}
              </div>
              {agentData.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {agentData.description}
                </p>
              )}
              {/* Voice & LLM info */}
              <div className="flex items-center gap-2 mt-1">
                {agentData.voice?.name && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-500">
                    <Iconify icon="mdi:microphone" className="w-3 h-3" />
                    {agentData.voice.name}
                  </span>
                )}
                {agentData.llm_config && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-500">
                    <Iconify icon="mdi:brain" className="w-3 h-3" />
                    {agentData.llm_config.model_id}
                  </span>
                )}
              </div>
            </div>

            {/* Open Icon */}
            <div className="flex-shrink-0">
              <Iconify
                icon="mdi:open-in-new"
                className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Success indicator stripe */}
        {isCompleted && (
          <div className="h-1 bg-gradient-to-r from-green-400 to-blue-500" />
        )}
      </div>
    </div>
  );
});

CreateAgentRenderer.displayName = 'CreateAgentRenderer';

export default CreateAgentRenderer;

