import { Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import { TextShimmer } from '../aceternity/text/text-shimmer.tsx';
import Iconify from '../iconify/Iconify';
import CustomMarkdown from '../messages/CustomMarkdown';
import ToolPartCard from '../messages/ToolPartCard';
import { makeSelectToolPartsByThreadId } from '../../redux/slices/room';
import { useSelector } from '../../redux/store';
import { agentAvatars, getTaskIcon, getTaskIconColor, getTaskTextStyle } from './planUtils';
import RunningTimer from './RunningTimer';

const TaskItem = ({ task, isExpanded, onToggleExpansion, onOpenSubthread }) => {
  const isRunning = task.status?.toLowerCase() === 'running';
  
  // Get tool parts for this task's subthread
  const toolPartsSelector = useMemo(() => makeSelectToolPartsByThreadId(), []);
  const toolParts = useSelector((state) => 
    task.subthread_id ? toolPartsSelector(state, task.subthread_id) : []
  );

  return (
    <div className="transition-colors duration-150">
      <div
        className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 cursor-pointer"
        onClick={() => onToggleExpansion(task.id)}
      >
        <div className="flex items-start gap-3">
          {/* Expand/Collapse Icon */}
          <div className="flex-shrink-0 mt-1">
            <Iconify
              icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
              className="w-5 h-5 text-gray-400 transition-transform duration-200"
            />
          </div>

          {/* Status Icon */}
          <div className="flex-shrink-0 mt-1">
            <Iconify
              icon={getTaskIcon(task.status)}
              className={`w-5 h-5 ${getTaskIconColor(task.status)} ${
                task.status?.toLowerCase() === 'running' ? 'animate-spin' : ''
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Task Name and Agent */}
            <div className="flex items-center gap-2">
              {task.assigned_agent_name && agentAvatars[task.assigned_agent_name] && (
                <Tooltip title={`Assigned to: ${task.assigned_agent_name}`}>
                  <img
                    src={agentAvatars[task.assigned_agent_name]}
                    alt={task.assigned_agent_name}
                    className="w-6 h-6 rounded-full border border-white/30 dark:border-gray-600/50 shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </Tooltip>
              )}
              {task.status?.toLowerCase() === 'running' ? (
                (() => {
                  try {
                    const taskName = task?.task_name;
                    const safeTaskName =
                      taskName !== null && taskName !== undefined && taskName !== ''
                        ? String(taskName).trim()
                        : 'Running task...';

                    if (!safeTaskName || safeTaskName.length === 0) {
                      return <span className="text-base font-medium">Running task...</span>;
                    }

                    return (
                      <TextShimmer
                        className="text-base font-medium"
                        duration={2}
                      >
                        {safeTaskName}
                      </TextShimmer>
                    );
                  } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('TextShimmer error in Plan:', error, task);
                    return <span className="text-base font-medium">Task Error</span>;
                  }
                })()
              ) : (
                <Typography
                  variant="body1"
                  className={`font-medium text-base ${getTaskTextStyle(task.status)}`}
                >
                  {task.task_name || 'Untitled Task'}
                </Typography>
              )}
            </div>

            {/* Task Metadata - Always Visible */}
            {!isExpanded && task.summary && (
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span className="truncate max-w-md">{task.summary}</span>
              </div>
            )}
          </div>

          {/* View Thread Button - Shows timer when running or completed */}
          {task.subthread_id && (
            <div className="flex-shrink-0">
              {isRunning ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSubthread(task);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group shadow-sm cursor-pointer"
                >
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
                  <RunningTimer
                    startTime={task.updated_at || task.started_at}
                    isRunning={true}
                  />
                  <Iconify
                    icon="mdi:chat-processing-outline"
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110 animate-pulse"
                  />
                </button>
              ) : (
                <Tooltip title="View task execution details">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSubthread(task);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200/50 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group"
                  >
                    {task.created_at && task.finished_at && (
                      <>
                        <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full" />
                        <RunningTimer
                          startTime={task.created_at}
                          endTime={task.finished_at}
                          isRunning={false}
                        />
                      </>
                    )}
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">
                      View Work Done
                    </span>
                    <Iconify
                      icon="mdi:check-circle-outline"
                      className="w-4 h-4 text-green-600 dark:text-green-400 transition-transform group-hover:scale-110"
                    />
                  </button>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-4 pl-20 bg-gray-50/30 dark:bg-gray-800/20">
          {/* Task Description */}
          {task.task_description && (
            <div className="mb-3 text-sm">
              <CustomMarkdown text={task.task_description} />
            </div>
          )}

          {/* Task Metadata */}
          {task.summary && (
            <div className="mb-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="truncate max-w-md">{task.summary}</span>
            </div>
          )}

          {/* Tool Executions (Subtasks) */}
          {toolParts.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Iconify
                  icon="mdi:wrench-outline"
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Task Actions ({toolParts.length})
                </span>
              </div>
              {toolParts.map((part) => (
                <ToolPartCard
                  key={part.id}
                  partId={part.id}
                  noClick={false}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
