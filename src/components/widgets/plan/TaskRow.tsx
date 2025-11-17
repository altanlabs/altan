import React, { memo } from 'react';
import { ExternalLink } from 'lucide-react';
import { ApiTask } from './types';
import { getTaskIcon, getTaskIconClass, getTaskTextClass } from './taskUtils';
import { AgentOrbAvatar } from '../../agents/AgentOrbAvatar';
import { agentColors } from '../../plan/planUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';

interface TaskRowProps {
  task: ApiTask;
  onOpenThread: (task: ApiTask) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, onOpenThread }) => {
  const Icon = getTaskIcon(task.status);
  const iconClass = getTaskIconClass(task.status);
  const textClass = getTaskTextClass(task.status);
  const isInProgress = task.status === 'in_progress';
  const taskName = task.task_name || task.title || 'Untitled Task';
  const threadId = task.subthread_id || task.thread_id;

  return (
    <div className="px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
      <div className="flex items-center gap-2">
        {/* Status Icon */}
        <div className="flex-shrink-0">
          <Icon 
            className={`h-4 w-4 ${iconClass} ${isInProgress ? 'animate-spin' : ''}`} 
          />
        </div>

        {/* Assigned Agent Avatar */}
        {task.assigned_agent_name && agentColors[task.assigned_agent_name] && (
          <div className="flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <AgentOrbAvatar
                      size={20}
                      agentId={task.assigned_agent_name}
                      colors={agentColors[task.assigned_agent_name]}
                      isStatic={!isInProgress}
                      agentState={isInProgress ? 'thinking' : null}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Assigned to: {task.assigned_agent_name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Task Name */}
        <div className="flex-1 min-w-0">
          <span 
            className={`text-sm truncate block ${textClass}`}
            title={taskName}
          >
            {taskName}
          </span>
        </div>

        {/* Open Thread Button */}
        {threadId && (
          <div className="flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onOpenThread(task)}
                    className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors group"
                    aria-label={`Open task thread: ${taskName}`}
                  >
                    <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Open task thread
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(TaskRow);

