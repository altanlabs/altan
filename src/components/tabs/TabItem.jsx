import { IconButton, Tooltip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { memo, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { cn } from '@lib/utils';

import ThreadInfoPopup from './ThreadInfoPopup.jsx';
import { switchTab, closeTab, makeSelectThreadName } from '../../redux/slices/room';
import { dispatch } from '../../redux/store.js';
import Iconify from '../iconify/Iconify.jsx';

const TabItem = ({
  tab,
  isActive,
  onSwitch,
  onClose,
  className,
  maxWidth = 200,
  canClose = true,
}) => {
  const theme = useTheme();
  // Use the thread name selector to get the real-time thread name
  const threadNameSelector = useMemo(makeSelectThreadName, []);
  const actualThreadName = useSelector((state) => threadNameSelector(state, tab.threadId));
  
  // Get room ID from Redux state
  const roomId = useSelector((state) => state.room.room?.id);

  // Use the actual thread name or fallback to tab name
  const displayName = actualThreadName || 'Thread';

  // State for thread info popup
  const [showThreadInfo, setShowThreadInfo] = useState(false);

  const handleClick = useCallback(
    (e) => {
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
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowThreadInfo(true);
    },
    [],
  );

  const handleDoubleClick = useCallback(
    (e) => {
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
    (e) => {
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
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClose(e);
      }
    },
    [handleClose],
  );

  return (
    <>
      <div
        className={cn(
          'relative flex items-center gap-1 px-3 py-1.5 text-sm cursor-pointer transition-all duration-200 select-none rounded-md',
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
            handleClick(e);
          }
        }}
        title={`${displayName} - Right-click or double-click for thread info`}
        style={{
          maxWidth,
          backgroundColor: isActive
            ? alpha(theme.palette.grey[500], 0.08)
            : 'transparent',
          color: isActive
            ? theme.palette.text.primary
            : theme.palette.text.secondary,
          '&:hover': {
            backgroundColor: alpha(theme.palette.grey[500], 0.08),
          },
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.target.style.backgroundColor = alpha(theme.palette.grey[500], 0.08);
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.target.style.backgroundColor = 'transparent';
          }
        }}
      >
        {/* Tab Name */}
        <span
          className={cn(
            'truncate flex-1 min-w-0',
            isActive ? 'font-semibold' : 'font-normal',
          )}
          title={displayName}
          style={{
            color: isActive
              ? theme.palette.text.primary
              : theme.palette.text.secondary,
          }}
        >
          {displayName}
        </span>

        {/* Close Button */}
        {canClose && !tab.isMainThread && (
          <div
            className="flex-shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip
              title="Close tab"
              placement="top"
            >
              <IconButton
                size="small"
                onClick={handleClose}
                onKeyDown={handleCloseKeyDown}
                className="!p-0.5 !min-w-0"
                sx={{
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.grey[500], 0.24),
                  },
                }}
              >
                <Iconify
                  icon="solar:close-circle-linear"
                  width={14}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.text.primary,
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          </div>
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
