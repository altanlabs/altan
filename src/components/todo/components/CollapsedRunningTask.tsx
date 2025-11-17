/**
 * Collapsed Running Task Component
 * Shows a running task in the collapsed widget header
 */

import { ExternalLink } from 'lucide-react';
import type React from 'react';

import { AgentOrbAvatar } from '../../agents/AgentOrbAvatar';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { agentColors } from '../../plan/planUtils';
import { Task } from '../types';
import { SafeTextShimmer } from './SafeTextShimmer';

interface CollapsedRunningTaskProps {
  task: Task;
  onOpenSubthread: (task: Task) => void;
}

/**
 * Displays a running task in collapsed state
 * Follows Single Responsibility Principle - only renders collapsed task display
 */
export const CollapsedRunningTask = ({
  task,
  onOpenSubthread,
}: CollapsedRunningTaskProps): React.JSX.Element => {
  return (
    <div className="flex items-center gap-2 px-2 py-1 border-x border-b border-neutral-200 dark:border-neutral-800 rounded-b">
      {/* Running Indicator Dot */}
      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" />

      {/* Assigned Agent Avatar */}
      {task.assigned_agent_name && agentColors[task.assigned_agent_name] && (
        <div className="flex-shrink-0">
          <AgentOrbAvatar
            size={16}
            agentId={task.assigned_agent_name}
            colors={agentColors[task.assigned_agent_name]}
            isStatic={false}
            agentState="thinking"
          />
        </div>
      )}

      {/* Task Name with Shimmer */}
      <div className="flex-1 min-w-0">
        <SafeTextShimmer
          text={task.title}
          fallbackText="Running task..."
          className="text-xs font-medium truncate leading-none text-neutral-600 dark:text-neutral-300"
        />
      </div>

      {/* Open Subthread Button */}
      {task.subthread_id && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenSubthread(task);
          }}
          className="p-0.5 rounded transition-colors hover:bg-neutral-200/50 dark:hover:bg-neutral-600/50 flex-shrink-0"
        >
          <ExternalLink className="w-3 h-3 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
        </button>
      )}
    </div>
  );
};

