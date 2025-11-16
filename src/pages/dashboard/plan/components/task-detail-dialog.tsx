import { Loader2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - ToolPartCard is a .jsx file without types
import ToolPartCard from '@/components/messages/ToolPartCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { makeSelectToolPartsByTaskId } from '@/redux/slices/room/selectors/messagePartSelectors';
import { fetchThread } from '@/redux/slices/room/thunks/threadThunks';
import type { MessagePart } from '@/redux/slices/room/types/state';
import {
  selectTaskDescription,
  selectTaskStatus,
  selectTaskThreadId,
  selectTaskTitle,
} from '@/redux/slices/tasks';
import { useDispatch, useSelector, type RootState } from '@/redux/store';

import { isTaskCompleted } from '../utils/plan-status';

interface TaskDetailDialogProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskDetailDialog = ({
  taskId,
  open,
  onOpenChange,
}: TaskDetailDialogProps): React.JSX.Element => {
  const dispatch = useDispatch();
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const title = useSelector((state) => selectTaskTitle(state, taskId));
  const description = useSelector((state) => selectTaskDescription(state, taskId));
  const status = useSelector((state) => selectTaskStatus(state, taskId));
  const threadId = useSelector((state) => selectTaskThreadId(state, taskId));

  // Create selector for tool parts - cached per taskId
  const toolPartsSelector = useMemo<(state: RootState, taskId: string) => MessagePart[]>(
    () => makeSelectToolPartsByTaskId(),
    []
  );
  const toolParts = useSelector((state: RootState) => toolPartsSelector(state, taskId));

  const isDone = isTaskCompleted(status);
  const isRunning = status === 'in_progress';
  const isFailed = status === 'failed';

  // Load thread when dialog opens - fixed to prevent infinite loop
  useEffect(() => {
    if (!open || !threadId || isLoadingThread || hasLoadedOnce) {
      return;
    }

    // Only load if we don't have tool parts yet
    if (toolParts.length === 0) {
      setIsLoadingThread(true);
      setHasLoadedOnce(true);
      
      void dispatch(fetchThread({ threadId }))
        .finally(() => {
          setIsLoadingThread(false);
        });
    }
  }, [open, threadId, toolParts.length, isLoadingThread, hasLoadedOnce, dispatch]);

  // Reset hasLoadedOnce when dialog closes or threadId changes
  useEffect(() => {
    if (!open) {
      setHasLoadedOnce(false);
    }
  }, [open]);

  useEffect(() => {
    setHasLoadedOnce(false);
  }, [threadId]);

  const getStatusColor = (): string => {
    if (isDone) return 'text-emerald-600 dark:text-emerald-400';
    if (isRunning) return 'text-blue-600 dark:text-blue-400';
    if (isFailed) return 'text-red-600 dark:text-red-400';
    return 'text-neutral-600 dark:text-neutral-400';
  };

  const getStatusLabel = (): string => {
    if (isDone) return 'DONE';
    if (isRunning) return 'IN PROGRESS';
    if (isFailed) return 'FAILED';
    return status ? status.toUpperCase().replace('_', ' ') : 'PENDING';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-full h-[85vh] max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                View task details including description and tool executions
              </DialogDescription>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold uppercase px-2 py-1 rounded ${getStatusColor()} bg-neutral-100 dark:bg-neutral-800`}
                >
                  {getStatusLabel()}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 gap-0 h-full">
            {/* Left Panel - Description */}
            <div className="border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
              <div className="p-6">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3 uppercase tracking-wide">
                  Description
                </h3>
                {description ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                      {description}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400 dark:text-neutral-600 italic">
                    No description available
                  </p>
                )}
              </div>
            </div>

            {/* Right Panel - Tool Executions */}
            <div className="overflow-y-auto bg-neutral-50 dark:bg-neutral-900/30">
              <div className="p-6">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3 uppercase tracking-wide">
                  Tool Executions
                  {toolParts.length > 0 && (
                    <span className="ml-2 text-xs font-mono font-normal text-neutral-600 dark:text-neutral-400">
                      ({toolParts.length})
                    </span>
                  )}
                </h3>

                {isLoadingThread ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-400 dark:text-neutral-600" />
                  </div>
                ) : threadId && toolParts.length > 0 ? (
                  <div className="space-y-2">
                    {toolParts.map((part: MessagePart) => (
                      <ToolPartCard
                        key={part.id}
                        partId={part.id}
                        noClick={false}
                      />
                    ))}
                  </div>
                ) : threadId ? (
                  <div className="text-sm text-neutral-400 dark:text-neutral-600 italic text-center py-12">
                    No tool executions yet
                  </div>
                ) : (
                  <div className="text-sm text-neutral-400 dark:text-neutral-600 italic text-center py-12">
                    No thread available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

