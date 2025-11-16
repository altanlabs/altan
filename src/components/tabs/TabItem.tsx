import { memo, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';

import { cn } from '@lib/utils';
import { Button } from '@/components/ui/button';

import ThreadInfoPopup from './ThreadInfoPopup.jsx';
import { makeSelectThreadName } from '../../redux/slices/room/selectors/threadSelectors';
import { switchTab, closeTab } from '../../redux/slices/room/slices/tabsSlice';
import { dispatch } from '../../redux/store.ts';

interface TabItemProps {
  tab: {
    id: string;
    threadId: string;
    isMainThread?: boolean;
  };
  isActive: boolean;
  onSwitch?: (tabId: string) => void;
  onClose?: (tabId: string) => void;
  className?: string;
  maxWidth?: number;
  canClose?: boolean;
}

const TabItem = ({
  tab,
  isActive,
  onSwitch,
  onClose,
  className,
  maxWidth = 200,
  canClose = true,
}: TabItemProps) => {
  // Use the thread name selector to get the real-time thread name
  const threadNameSelector = useMemo(makeSelectThreadName, []);
  const actualThreadName = useSelector((state: any) => threadNameSelector(state, tab.threadId));

  // Get room ID from Redux state
  const roomId = useSelector((state: any) => state.room._room.room?.id);

  // Use the actual thread name or fallback to tab name
  const displayName = actualThreadName || 'Thread';

  // State for thread info popup
  const [showThreadInfo, setShowThreadInfo] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onSwitch) {
        onSwitch(tab.id);
      } else {
        dispatch(switchTab({ tabId: tab.id }));
      }
    },
    [tab.id, onSwitch],
  );

  const handleRightClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowThreadInfo(true);
    },
    [],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowThreadInfo(true);
    },
    [],
  );

  const handleCloseThreadInfo = useCallback(() => {
    setShowThreadInfo(false);
  }, []);

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onClose) {
        onClose(tab.id);
      } else {
        dispatch(closeTab({ tabId: tab.id }));
      }
    },
    [tab.id, onClose],
  );

  const handleCloseKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClose(e as any);
      }
    },
    [handleClose],
  );

  return (
    <>
      <div
        className={cn(
          'group relative flex items-center gap-1 px-3 h-9 text-sm cursor-pointer transition-all select-none',
          'hover:bg-accent/50',
          isActive && 'bg-accent',
          className,
        )}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        onDoubleClick={handleDoubleClick}
        role="tab"
        aria-selected={isActive}
        aria-label={`Switch to ${displayName} tab`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
        title={`${displayName} - Right-click or double-click for thread info`}
        style={{
          maxWidth,
        }}
      >
        {/* Tab Name */}
        <span
          className={cn(
            'truncate flex-1 min-w-0',
            isActive ? 'font-medium text-foreground' : 'font-normal text-muted-foreground',
          )}
          title={displayName}
        >
          {displayName}
        </span>

        {/* Close Button */}
        {canClose && !tab.isMainThread && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            onKeyDown={handleCloseKeyDown}
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-accent"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Thread Info Popup */}
      <ThreadInfoPopup
        open={showThreadInfo}
        onClose={handleCloseThreadInfo}
        threadId={tab.threadId}
        threadName={actualThreadName}
        roomId={roomId}
        isMainThread={tab.isMainThread}
      />
    </>
  );
};

export default memo(TabItem);

