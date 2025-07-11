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
  switchTab,
  closeTab,
  createNewThread,
} from '../../redux/slices/room';
import { dispatch } from '../../redux/store.js';

const TabBar = ({
  className,
  maxTabWidth = 200,
  minTabWidth = 120,
  showNewTabButton = true,
  showHistoryButton = true,
  showMembersButton = true,
  onTabSwitch,
  onTabClose,
  onNewTab,
}) => {
  const tabs = useSelector(selectTabsArray);
  const activeTabId = useSelector(selectActiveTabId);
  const tabsCount = useSelector(selectTabsCount);

  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  const handleTabSwitch = useCallback((tabId) => {
    if (onTabSwitch) {
      onTabSwitch(tabId);
    } else {
      dispatch(switchTab({ tabId }));
    }
  }, [onTabSwitch]);

  // Handle tab closing
  const handleTabClose = useCallback((tabId) => {
    if (onTabClose) {
      onTabClose(tabId);
    } else {
      dispatch(closeTab({ tabId }));
    }
  }, [onTabClose]);

  // Handle new tab creation
  const handleNewTab = useCallback(async () => {
    if (onNewTab) {
      await onNewTab();
    } else {
      // Create a new thread without affecting existing ones
      await dispatch(createNewThread());
    }
  }, [onNewTab]);

  // Calculate tab width based on available space
  const calculateTabWidth = useCallback(() => {
    if (!tabs.length) return maxTabWidth;

    const container = scrollContainerRef.current;
    if (!container) return maxTabWidth;

    const buttonSpace = (showHistoryButton ? 40 : 0) + (showMembersButton ? 40 : 0) + (showNewTabButton ? 40 : 0);
    const availableWidth = container.clientWidth - buttonSpace;
    const idealWidth = Math.max(minTabWidth, Math.min(maxTabWidth, availableWidth / tabs.length));

    return Math.floor(idealWidth);
  }, [tabs.length, maxTabWidth, minTabWidth, showNewTabButton, showHistoryButton, showMembersButton]);

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

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center', className)}>
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          aria-label="Scroll tabs left"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
          {tabs.map((tab) => (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              className="flex-shrink-0 group"
            >
              <TabItem
                tab={tab}
                isActive={tab.id === activeTabId}
                onSwitch={handleTabSwitch}
                onClose={handleTabClose}
                maxWidth={tabWidth}
                canClose={tabsCount > 1}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          aria-label="Scroll tabs right"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
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

        {/* New tab button */}
        {showNewTabButton && (
          <NewTabButton
            onNewTab={handleNewTab}
            size="small"
            variant="outlined"
          />
        )}
      </div>
    </div>
  );
};

export default memo(TabBar);
