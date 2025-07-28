import { IconButton, Tooltip } from '@mui/material';
import { memo, useCallback, useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { cn } from '@lib/utils';

import HistoryButton from './HistoryButton.jsx';
import MembersButton from './MembersButton.jsx';
import NewTabButton from './NewTabButton.jsx';
import TabItem from './TabItem.jsx';
import {
  selectTabsArray,
  selectActiveTabId,
  selectTabsCount,
  selectMainThread,
  switchTab,
  closeTab,
  createNewThread,
  archiveMainThread,
} from '../../redux/slices/room';
import { dispatch } from '../../redux/store.js';
import SettingsDialog from '../dialogs/SettingsDialog.jsx';
import Iconify from '../iconify/Iconify.jsx';

const TabBar = ({
  className,
  maxTabWidth = 200,
  minTabWidth = 120,
  showTabs = true,
  showNewTabButton = true,
  showHistoryButton = true,
  showMembersButton = true,
  showSettingsButton = true,
  onTabSwitch,
  onTabClose,
  onNewTab,
}) => {
  const tabs = useSelector(selectTabsArray);
  const activeTabId = useSelector(selectActiveTabId);
  const tabsCount = useSelector(selectTabsCount);
  const mainThread = useSelector(selectMainThread);

  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Check scroll state
  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollState);
      return () => container.removeEventListener('scroll', updateScrollState);
    }
  }, [updateScrollState, tabs.length]);

  // Scroll to active tab
  const scrollToActiveTab = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !activeTabId) return;

    const activeTab = container.querySelector(`[data-tab-id="${activeTabId}"]`);
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTabId]);

  useEffect(() => {
    scrollToActiveTab();
  }, [activeTabId, scrollToActiveTab]);

  // Handle tab switching
  const handleTabSwitch = useCallback(
    (tabId) => {
      if (onTabSwitch) {
        onTabSwitch(tabId);
      } else {
        dispatch(switchTab({ tabId }));
      }
    },
    [onTabSwitch],
  );

  // Handle tab closing
  const handleTabClose = useCallback(
    (tabId) => {
      if (onTabClose) {
        onTabClose(tabId);
      } else {
        dispatch(closeTab({ tabId }));
      }
    },
    [onTabClose],
  );

  // Handle new tab creation
  const handleNewTab = useCallback(async () => {
    await dispatch(createNewThread());
  }, [onNewTab]);

  // Handle settings dialog
  const handleSettingsClick = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const handleNewConversation = useCallback(() => {
    if (mainThread) {
      dispatch(archiveMainThread({ threadId: mainThread }));
    }
  }, [mainThread]);

  // Calculate tab width based on available space
  const calculateTabWidth = useCallback(() => {
    if (!tabs.length) return maxTabWidth;

    const container = scrollContainerRef.current;
    if (!container) return maxTabWidth;

    // Account for all buttons in the right area
    const buttonSpace =
      (showHistoryButton ? 40 : 0) + (showMembersButton ? 40 : 0) + (showSettingsButton ? 40 : 0);
    // Reserve space for the new tab button in the scrollable area
    const newTabButtonSpace = showNewTabButton ? 40 : 0;
    const availableWidth = container.clientWidth - buttonSpace - newTabButtonSpace;
    const idealWidth = Math.max(minTabWidth, Math.min(maxTabWidth, availableWidth / tabs.length));

    return Math.floor(idealWidth);
  }, [
    tabs.length,
    maxTabWidth,
    minTabWidth,
    showNewTabButton,
    showHistoryButton,
    showMembersButton,
    showSettingsButton,
  ]);

  // Scroll functions
  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  const tabWidth = calculateTabWidth();

  // If no tabs and no action buttons are enabled, don't render anything
  if (tabs.length === 0 && !showHistoryButton && !showMembersButton && !showSettingsButton) {
    return null;
  }

  return (
    <>
      <div className={cn('flex items-center', className)}>
        {/* Tabs section - only show when showTabs is true */}
        {showTabs ? (
          <>
            {/* Left scroll button */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                aria-label="Scroll tabs left"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path
                    d="M10 12L6 8L10 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* Tabs container */}
            <div
              ref={scrollContainerRef}
              className="flex-1 flex overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none' }}
            >
              <div className="flex items-end gap-0.5 px-1">
                {tabs.map((tab, index) => (
                  <div
                    key={tab.id}
                    className="flex items-center"
                  >
                    <div
                      data-tab-id={tab.id}
                      className="flex-shrink-0 group"
                    >
                      <TabItem
                        tab={tab}
                        isActive={tab.id === activeTabId}
                        onSwitch={handleTabSwitch}
                        onClose={handleTabClose}
                        maxWidth={tabWidth}
                        canClose={tabsCount > 1 && !tab.isMainThread}
                      />
                    </div>
                    {/* Chrome-style divider between tabs */}
                    {index < tabs.length - 1 && (
                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1 opacity-50" />
                    )}
                  </div>
                ))}

                {/* New tab button - positioned next to the last tab, Chrome style */}
                {showNewTabButton && (
                  <div className="flex-shrink-0 ml-1">
                    <NewTabButton onNewTab={handleNewTab} />
                  </div>
                )}
              </div>
            </div>

            {/* Right scroll button */}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                aria-label="Scroll tabs right"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </>
        ) : (
          /* New conversation button when tabs are hidden */
          <div className="flex-1 flex justify-start pl-1">
            <Tooltip
              title="Start new conversation"
              placement="top"
            >
              <IconButton
                size="small"
                onClick={handleNewConversation}
                sx={{
                  width: 32,
                  height: 32,
                }}
              >
                <Iconify
                  icon="streamline-flex:pencil-square"
                  width={18}
                />
              </IconButton>
            </Tooltip>
          </div>
        )}

        {/* Action buttons container */}
        <div className="flex items-center gap-1 ml-2 mr-1">
          {/* History button */}
          {showHistoryButton && (
            <HistoryButton
              size="small"
              variant="outlined"
            />
          )}

          {/* Members button */}
          {showMembersButton && (
            <MembersButton
              size="small"
              variant="outlined"
            />
          )}

          {/* Settings button */}
          {showSettingsButton && (
            <Tooltip
              title="Room settings"
              placement="top"
            >
              <IconButton
                size="small"
                onClick={handleSettingsClick}
                sx={{
                  width: 32,
                  height: 32,
                }}
              >
                <Iconify
                  icon="mdi:dots-vertical"
                  width={16}
                />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onClose={handleSettingsClose}
      />
    </>
  );
};

export default memo(TabBar);
