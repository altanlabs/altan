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
import MessageContent from '../../messages/MessageContent';
import { TaskDetailsDialog } from './TaskDetailsDialog';
import { SafeTextShimmer } from './SafeTextShimmer';
import {
  selectMessagesById,
} from '../../../redux/slices/room/selectors/messageSelectors';
import {
  makeSelectSortedThreadMessageIds,
} from '../../../redux/slices/room/selectors/threadSelectors';
import { useSelector } from '../../../redux/store';
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
  const messagesSelector = useMemo(() => makeSelectSortedThreadMessageIds(), []);
  const messagesById = useSelector(selectMessagesById);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get messages from the task's subthread
  const messageIds = useSelector((state) =>
    task.subthread_id ? messagesSelector(state, task.subthread_id) : EMPTY_ARRAY
  );

  // Get the second message (index 1) - this is the agent's response
  const secondMessage = messageIds.length > 1 ? messagesById[messageIds[1]] : null;

  // Determine if message is being generated (exists but not yet replied)
  const isMessageGenerating = secondMessage && !secondMessage.replied;

  // Task status configuration
  const statusConfig = getTaskStatusConfig(task.status);
  const taskIsRunning = isTaskRunning(task);

  return (
    <TooltipProvider>
      <div className="border-b border-gray-200/30 dark:border-gray-700/30 last:border-b-0">
        {/* Task Header Row */}
        <div className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors duration-150">
          <div className="flex items-center gap-2 px-3 py-1.5">
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <AgentOrbAvatar
                        size={24}
                        agentId={task.assigned_agent_name}
                        colors={agentColors[task.assigned_agent_name]}
                        isStatic={false}
                        agentState={taskIsRunning ? 'thinking' : null}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Assigned to: {task.assigned_agent_name}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Task Content with Status-Based Styling */}
            <div className="flex-1 min-w-0">
              {taskIsRunning ? (
                <SafeTextShimmer text={task.title} />
              ) : (
                <p
                  className={`font-medium truncate text-xs leading-none ${statusConfig.textStyle}`}
                  title={task.title}
                >
                  {task.title || 'Untitled Task'}
                </p>
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
                    className="p-0.5 rounded hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors group"
                  >
                    <MoreHorizontal className="w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
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
                      className="p-0.5 rounded hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors group"
                    >
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
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

        {/* Message Content - show when task is running and has messages */}
        {taskIsRunning && secondMessage && isMessageGenerating && (
          <div className="px-3 py-2 bg-gray-50/30 dark:bg-gray-800/20">
            <MessageContent
              message={secondMessage}
              threadId={task.subthread_id}
              mode="mini"
            />
          </div>
        )}

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

