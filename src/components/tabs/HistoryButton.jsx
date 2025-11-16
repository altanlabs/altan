import { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import ThreadMinified from './ThreadMinified.jsx';
import { cn } from '../../lib/utils.ts';
import {
  selectThreadsById,
  selectRoomThreadsIds,
} from '../../redux/slices/room/selectors/threadSelectors';
import { selectUIInitialized, selectUILoading } from '../../redux/slices/room/selectors/uiSelectors';
import { fetchRoomAllThreads, switchToThreadInTab } from '../../redux/slices/room/thunks/threadThunks';
import { dispatch } from '../../redux/store.ts';
import Iconify from '../iconify/Iconify.jsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';

const HistoryButton = ({ disabled = false, size = 'small' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allThreadsInitialized = useSelector(selectUIInitialized('allThreads'));
  const allThreadsLoading = useSelector(selectUILoading('allThreads'));
  const threadsById = useSelector(selectThreadsById);
  const threadIds = useSelector(selectRoomThreadsIds);

  useEffect(() => {
    if (!allThreadsInitialized && !allThreadsLoading && isOpen) {
      dispatch(fetchRoomAllThreads());
    }
  }, [allThreadsInitialized, allThreadsLoading, isOpen]);

  // Filter threads based on search query
  const filteredThreads = useMemo(() => {
    const conversationThreads = threadIds.filter((threadId) => {
      const thread = threadsById[threadId];
      return thread && !thread.is_main && thread.status !== 'dead';
    });

    if (!searchQuery.trim()) {
      return conversationThreads.slice(0, 15);
    }

    const query = searchQuery.toLowerCase();
    return conversationThreads
      .filter((threadId) => {
        const thread = threadsById[threadId];
        const threadName = thread?.name || '';
        return threadName.toLowerCase().includes(query);
      })
      .slice(0, 15);
  }, [threadIds, threadsById, searchQuery]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
  }, [disabled]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  const handleThreadSelect = useCallback(
    (threadId) => {
      const thread = threadsById[threadId];
      dispatch(switchToThreadInTab(threadId, thread?.name));
      handleClose();
    },
    [handleClose, threadsById],
  );

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size={size === 'small' ? 'icon' : 'default'}
                onClick={handleClick}
                disabled={disabled}
                className={cn(
                  'transition-colors',
                  size === 'small' && 'h-8 w-8',
                )}
              >
                <Iconify icon="fluent:chat-history-24-regular" width={20} />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Recent conversations</p>
          </TooltipContent>
        </Tooltip>

        <PopoverContent
          side="bottom"
          align="start"
          className="w-[400px] p-0 shadow-lg border"
        >
          {/* Header with search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Iconify
                icon="solar:magnifer-linear"
                width={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Conversations list */}
          <div className="max-h-[400px] overflow-y-auto">
            {!allThreadsInitialized && allThreadsLoading ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : filteredThreads.length > 0 ? (
              <div className="py-1">
                {filteredThreads.map((threadId) => (
                  <ThreadMinified
                    key={threadId}
                    threadId={threadId}
                    disableConnector
                    onSelect={handleThreadSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? 'No conversations match your search.'
                    : 'No recent conversations yet.'}
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};

export default memo(HistoryButton);
