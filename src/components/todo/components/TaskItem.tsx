/**
 * Task Item Component
 * Individual task row with status, agent, and actions
 */

import { useState, useMemo } from 'react';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import { TaskItemProps } from '../types';
import { getTaskStatusConfig, isTaskRunning } from '../utils/taskStatusUtils';
import { EMPTY_ARRAY } from '../constants';
import { AgentOrbAvatar } from '../../agents/AgentOrbAvatar';
import { agentColors } from '../../plan/planUtils';
import Iconify from '../../iconify/Iconify';
import { TaskDetailsDialog } from './TaskDetailsDialog';
import { SafeTextShimmer } from './SafeTextShimmer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

/**
 * Task Item Component
 * Follows Single Responsibility Principle - only renders a single task
 */
export const TaskItem = ({
  task,
  onOpenSubthread,
  onUpdateTask,
  onDeleteTask,
}: TaskItemProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Task status configuration
  const statusConfig = getTaskStatusConfig(task.status);
  const taskIsRunning = isTaskRunning(task);

  return (
    <TooltipProvider>
      <div className="border-b border-neutral-200/30 dark:border-neutral-800/30 last:border-b-0">
        {/* Task Header Row */}
        <div className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20 transition-colors duration-150">
          <div className="flex items-center gap-2 px-2 py-1">
            {/* Status Icon */}
            <div className="flex-shrink-0">
              <Iconify
                icon={statusConfig.icon}
                className={`w-3 h-3 ${statusConfig.iconColor}`}
              />
            </div>

            {/* Assigned Agent Avatar */}
            {task.assigned_agent_name && agentColors[task.assigned_agent_name] && (
              <div className="flex-shrink-0">
                <AgentOrbAvatar
                  size={20}
                  agentId={task.assigned_agent_name}
                  colors={agentColors[task.assigned_agent_name]}
                  isStatic={false}
                  agentState={taskIsRunning ? 'thinking' : null}
                />
              </div>
            )}

            {/* Task Content with Status-Based Styling */}
            <div className="flex-1 min-w-0">
              {taskIsRunning ? (
                <SafeTextShimmer text={task.title} />
              ) : (
                <>
                  <p
                    className={`font-medium truncate text-xs leading-none ${statusConfig.textStyle}`}
                    title={task.title}
                  >
                    {task.title || 'Untitled Task'}
                  </p>
                  {task.description && (
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-500 truncate mt-0.5">
                      {task.description.length > 50 
                        ? task.description.slice(0, 50) + '...' 
                        : task.description}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Task Actions */}
            <div className="flex-shrink-0 flex items-center gap-0.5">
              {/* Three-dot menu button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDialogOpen(true);
                    }}
                    className="p-0.5 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-600/50 transition-colors group"
                  >
                    <MoreHorizontal className="w-3 h-3 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Task options</p>
                </TooltipContent>
              </Tooltip>

              {/* Open in New Tab Button - show if task has subthread_id */}
              {task.subthread_id && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSubthread(task);
                      }}
                      className="p-0.5 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-600/50 transition-colors group"
                    >
                      <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </button>
                  </TooltipTrigger>
                <TooltipContent>
                  <p>Open task thread: {task.title}</p>
                </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* Task Details Dialog */}
        <TaskDetailsDialog
          task={task}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      </div>
    </TooltipProvider>
  );
};

