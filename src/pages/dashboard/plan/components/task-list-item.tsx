import { CheckCircle2, Circle, Loader2, MessageSquare, XCircle, ChevronRight } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

import { makeSelectToolPartsByTaskId } from '@/redux/slices/room/selectors/messagePartSelectors';
import type { MessagePart } from '@/redux/slices/room/types/state';
import {
  selectTaskDescription,
  selectTaskStatus,
  selectTaskThreadId,
  selectTaskTitle,
} from '@/redux/slices/tasks';
import { useSelector, type RootState } from '@/redux/store';

import { TaskDetailDialog } from './task-detail-dialog';
import { isTaskCompleted } from '../utils/plan-status';

interface TaskListItemProps {
  taskId: string;
  index: number;
  onOpenSubthread?: ((taskId: string, threadId: string) => void) | undefined;
}

export const TaskListItem = memo<TaskListItemProps>(
  ({ taskId, index, onOpenSubthread }: TaskListItemProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    // Use cached selectors directly
    const title = useSelector((state) => selectTaskTitle(state, taskId));
    const description = useSelector((state) => selectTaskDescription(state, taskId));
    const status = useSelector((state) => selectTaskStatus(state, taskId));
    const threadId = useSelector((state) => selectTaskThreadId(state, taskId));

    // Get tool parts for this task directly (more efficient than fetching by threadId)
    const toolPartsSelector = useMemo<(state: RootState, taskId: string) => MessagePart[]>(
      () => makeSelectToolPartsByTaskId(),
      []
    );
    const toolParts = useSelector((state: RootState) => toolPartsSelector(state, taskId));

    // Get the last executed tool part (most recent completed one)
    const lastExecutedTool = useMemo((): MessagePart | null => {
      if (!toolParts || toolParts.length === 0) return null;
      // Find the last tool that is done
      const completedTools = toolParts.filter((part: MessagePart) => part.is_done);
      if (completedTools.length === 0) {
        // If no completed tools, show the last one (could be running)
        return toolParts[toolParts.length - 1] ?? null;
      }
      return completedTools[completedTools.length - 1] ?? null;
    }, [toolParts]);

    const isRunning = status === 'in_progress';
    const isDone = isTaskCompleted(status);
    const isFailed = status === 'failed';
    const isPending = status === 'pending';

    const StatusIcon = isRunning ? Loader2 : isDone ? CheckCircle2 : isFailed ? XCircle : Circle;

    const getStatusColor = (): string => {
      if (isDone) return 'text-neutral-400 dark:text-neutral-500';
      if (isRunning) return 'text-neutral-900 dark:text-neutral-100';
      if (isFailed) return 'text-neutral-900 dark:text-neutral-100';
      return 'text-neutral-400 dark:text-neutral-600';
    };

    const getStatusLabel = (): string => {
      if (isDone) return 'DONE';
      if (isRunning) return 'IN PROGRESS';
      if (isFailed) return 'FAILED';
      if (isPending) return 'PENDING';
      return status ? status.toUpperCase().replace('_', ' ') : 'UNKNOWN';
    };

    return (
      <div
        className={`border-b border-neutral-200 dark:border-neutral-800 last:border-0 ${isRunning ? 'bg-neutral-50 dark:bg-neutral-900/50' : ''}`}
      >
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            {/* Index */}
            <div className="flex-shrink-0 w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <span className="text-[11px] font-mono font-bold text-neutral-700 dark:text-neutral-300">
                {(index + 1).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Status Icon */}
            <StatusIcon
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getStatusColor()} ${isRunning ? 'animate-spin' : ''}`}
            />

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title Row */}
              <div className="flex items-start justify-between gap-3">
                <h4
                  className={`text-sm font-semibold leading-snug ${
                    isDone
                      ? 'text-neutral-400 dark:text-neutral-600 line-through'
                      : 'text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {title}
                </h4>
                <span className="text-[10px] font-mono font-bold text-neutral-600 dark:text-neutral-400 whitespace-nowrap bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                  {getStatusLabel()}
                </span>
              </div>

              {/* Description */}
              {description && (
                <div className="pr-4">
                  <p
                    className={`text-xs leading-relaxed ${
                      isDone
                        ? 'text-neutral-400 dark:text-neutral-600'
                        : 'text-neutral-600 dark:text-neutral-400'
                    } line-clamp-2`}
                  >
                    {description}
                  </p>
                </div>
              )}

              {/* Last Tool Execution Summary */}
              {(isRunning || threadId) && lastExecutedTool && (
                <div className="pr-4">
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px]">
                    <Loader2
                      className={`w-3 h-3 ${lastExecutedTool.is_done ? 'text-emerald-500' : 'text-blue-500 animate-spin'}`}
                    />
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                      {lastExecutedTool.act_done || lastExecutedTool.act_now || lastExecutedTool.name || 'Tool executing...'}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions Row */}
              <div className="flex items-center gap-4 pt-0.5">
                {threadId && onOpenSubthread && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSubthread(taskId, threadId);
                    }}
                    className="h-7 px-2.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Thread</span>
                  </button>
                )}

                {description && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDialogOpen(true);
                    }}
                    className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors inline-flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Task Detail Dialog */}
        <TaskDetailDialog
          taskId={taskId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    );
  },
);

TaskListItem.displayName = 'TaskListItem';

