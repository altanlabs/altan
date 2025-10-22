import { m } from 'framer-motion';
import React, { memo } from 'react';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';
import { cn } from '@lib/utils';

import Iconify from '../../../../components/iconify/Iconify';
import IconRenderer from '../../../../components/icons/IconRenderer';
import { getToolIcon } from '../../../../components/messages/tool-renderers/index.js';

const DemoPlanExecutionTask = ({ task, subtasks, isExpanded, agentAvatars }) => {
  const getTaskIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'mdi:check-circle';
      case 'running':
        return 'mdi:loading';
      default:
        return 'mdi:circle-outline';
    }
  };

  const getTaskIconColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-400';
      case 'running':
        return 'text-blue-400';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div>
      {/* Task Row */}
      <div className="px-6 py-4 hover:bg-gray-800/30 transition-colors">
        <div className="flex items-center gap-3">
          <Iconify
            icon={getTaskIcon(task.status)}
            className={`w-5 h-5 ${getTaskIconColor(task.status)} ${
              task.status === 'running' ? 'animate-spin' : ''
            }`}
          />

          {task.assigned_agent_name && agentAvatars[task.assigned_agent_name] && (
            <img
              src={agentAvatars[task.assigned_agent_name]}
              alt={task.assigned_agent_name}
              className="w-6 h-6 rounded-full border border-gray-600"
            />
          )}

          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                task.status === 'completed'
                  ? 'text-gray-500 line-through'
                  : 'text-white'
              }`}
            >
              {task.task_name}
            </p>
          </div>

          {isExpanded && (
            <Iconify
              icon="mdi:chevron-down"
              className="w-5 h-5 text-gray-400"
            />
          )}
        </div>
      </div>

      {/* Subtasks - Rendered exactly like ToolPartHeader */}
      {isExpanded && subtasks.length > 0 && (
        <m.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-6 pb-4 pl-20"
        >
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Iconify
                icon="mdi:wrench-outline"
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
              />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                Subtasks ({subtasks.length})
              </span>
            </div>
            {subtasks.map((subtask) => {
              const isSubtaskRunning = subtask.status === 'running';
              const isSubtaskCompleted = subtask.status === 'completed';
              const toolIcon = getToolIcon(subtask.name, 'ri:hammer-fill');

              return (
                <div
                  key={subtask.id}
                  className="w-full"
                >
                  {/* Tool Header - EXACT copy from ToolPartHeader */}
                  <button
                    className="w-full flex items-center gap-1.5 px-1 py-1.5 text-[12px] text-gray-400 dark:text-gray-300 group"
                    disabled
                  >
                    <span className="flex items-center gap-1">
                      <IconRenderer
                        icon={toolIcon}
                        className={cn(
                          'text-[11px] flex-shrink-0',
                          !isSubtaskCompleted && 'animate-pulse',
                        )}
                      />
                      {!isSubtaskCompleted && (
                        <span className="inline-block w-1 h-3 rounded-sm bg-gray-400/70 animate-pulse" />
                      )}
                    </span>

                    {!isSubtaskCompleted ? (
                      <TextShimmer className="inline-block font-medium">
                        {subtask.name.toUpperCase()}
                      </TextShimmer>
                    ) : (
                      <span className="font-medium">{subtask.name.toUpperCase()}</span>
                    )}
                  </button>

                  {/* Args - shown when running (italic) */}
                  {subtask.args && isSubtaskRunning && (
                    <div className="px-3 pb-2 pt-0.5">
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                        {subtask.args}
                      </p>
                    </div>
                  )}

                  {/* Result - shown when completed */}
                  {subtask.result && isSubtaskCompleted && (
                    <div className="px-3 pb-2 pt-0.5">
                      <p className="text-sm text-green-400">{subtask.result}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </m.div>
      )}
    </div>
  );
};

export default memo(DemoPlanExecutionTask);
