/**
 * Collapsed Running Task Component
 * Shows a running task in the collapsed widget header
 */

import { ExternalLink } from 'lucide-react';
import { Task } from '../types';
import { AgentOrbAvatar } from '../../agents/AgentOrbAvatar';
import { agentColors } from '../../plan/planUtils';
import { SafeTextShimmer } from './SafeTextShimmer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

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
}: CollapsedRunningTaskProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5 ml-2">
        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />

        {/* Assigned Agent Avatar */}
        {task.assigned_agent_name && agentColors[task.assigned_agent_name] && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-shrink-0">
                <AgentOrbAvatar
                  size={18}
                  agentId={task.assigned_agent_name}
                  colors={agentColors[task.assigned_agent_name]}
                  isStatic={false}
                  agentState="thinking"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Assigned to: {task.assigned_agent_name}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Task Name with Shimmer */}
        <div className="flex-1 min-w-0">
          <SafeTextShimmer
            text={task.title}
            fallbackText="Running task..."
            className="text-xs font-medium truncate leading-none text-gray-600 dark:text-gray-300"
          />
        </div>

        {/* Open Subthread Button */}
        {task.subthread_id && (
          <div className="flex items-center gap-0.5 ml-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSubthread(task);
                  }}
                  className="p-0.5 rounded transition-colors group hover:bg-gray-200/50 dark:hover:bg-gray-600/50"
                >
                  <ExternalLink className="w-2.5 h-2.5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open task thread: {task.title}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

