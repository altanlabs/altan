import { memo, useCallback, useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MoreVertical, Maximize2, PanelRight, X, PenSquare } from 'lucide-react';

import { cn } from '@lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

import HistoryButton from './HistoryButton.jsx';
import MembersButton from './MembersButton';
import NewTabButton from './NewTabButton';
import TabItem from './TabItem';
import { selectDisplayMode, setDisplayModeForProject } from '../../redux/slices/altaners';
import {
  selectTabsArray,
  selectActiveTabId,
  selectTabsCount,
} from '../../redux/slices/room/selectors/tabSelectors';
import { selectMainThread } from '../../redux/slices/room/selectors/threadSelectors';
import { switchTab, closeTab } from '../../redux/slices/room/slices/tabsSlice';
import { setThreadMain } from '../../redux/slices/room/slices/threadsSlice';
import { createNewThread, archiveMainThread } from '../../redux/slices/room/thunks/threadThunks';
import { dispatch } from '../../redux/store';
import SettingsDialog from '../dialogs/SettingsDialog.jsx';

interface TabBarProps {
  className?: string;
  maxTabWidth?: number;
  minTabWidth?: number;
  showTabs?: boolean;
  showNewTabButton?: boolean;
  showHistoryButton?: boolean;
  showMembersButton?: boolean;
  showSettingsButton?: boolean;
  showCloseButton?: boolean;
  showFullscreenButton?: boolean;
  showSidebarButton?: boolean;
  onTabSwitch?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onNewTab?: () => void;
  onClose?: () => void;
  onFullscreen?: () => void;
  onSidebar?: () => void;
}

const TabBar = ({
  className,
  maxTabWidth = 200,
  minTabWidth = 120,
  showTabs = true,
  showNewTabButton = true,
  showHistoryButton = true,
  showMembersButton = true,
  showSettingsButton = true,
  showCloseButton = false,
  showFullscreenButton = false,
  showSidebarButton = false,
  onTabSwitch,
  onTabClose,
  onNewTab,
  onClose,
  onFullscreen,
  onSidebar,
}: TabBarProps) => {
  const { altanerId } = useParams();
  const tabs = useSelector(selectTabsArray);
  const activeTabId = useSelector(selectActiveTabId);
  const tabsCount = useSelector(selectTabsCount);
  const mainThread = useSelector(selectMainThread);
  const displayMode = useSelector(selectDisplayMode);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
    (tabId: string) => {
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
    (tabId: string) => {
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
    if (onNewTab) {
      onNewTab();
    } else {
      await dispatch(createNewThread());
    }
  }, [onNewTab]);

  // Handle settings dialog
  const handleSettingsClick = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const handleNewConversation = useCallback(() => {
    // In ephemeral mode (tabs=false), just update URL to thread_id=new
    if (!showTabs) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('thread_id', 'new');
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}?${searchParams.toString()}`,
      );
      // Also clear Redux thread
      dispatch(setThreadMain({ current: null }));
    } else {
      // In tabs mode, archive the current thread
      if (mainThread) {
        dispatch(archiveMainThread({ threadId: mainThread }));
      }
    }
  }, [mainThread, showTabs]);

  // Handle close button click
  const handleCloseClick = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      // Post message to parent window (for widget mode)
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'widget_close_request',
            source: 'altan-widget',
          },
          '*',
        );
      }
    }
  }, [onClose]);

  // Handle fullscreen button click
  const handleFullscreenClick = useCallback(() => {
    if (onFullscreen) {
      onFullscreen();
    } else {
      // Post message to parent window (for widget mode)
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'widget_fullscreen_request',
            source: 'altan-widget',
          },
          '*',
        );
      }
    }
  }, [onFullscreen]);

  // Handle sidebar button click
  const handleSidebarClick = useCallback(() => {
    if (onSidebar) {
      onSidebar();
    } else {
      // Post message to parent window (for widget mode)
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'widget_sidebar_request',
            source: 'altan-widget',
          },
          '*',
        );
      }
    }
  }, [onSidebar]);

  // Calculate tab width based on available space
  const calculateTabWidth = useCallback(() => {
    if (!tabs.length) return maxTabWidth;

    const container = scrollContainerRef.current;
    if (!container) return maxTabWidth;

    // Account for all buttons in the right area
    const buttonSpace =
      (showHistoryButton ? 40 : 0) +
      (showMembersButton ? 40 : 0) +
      (showSettingsButton ? 40 : 0) +
      (showFullscreenButton ? 40 : 0) +
      (showSidebarButton ? 40 : 0) +
      (showCloseButton ? 40 : 0);
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
    showFullscreenButton,
    showSidebarButton,
    showCloseButton,
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
  if (
    tabs.length === 0 &&
    !showHistoryButton &&
    !showMembersButton &&
    !showSettingsButton &&
    !showFullscreenButton &&
    !showSidebarButton &&
    !showCloseButton
  ) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn('flex items-center h-10 border-b bg-background', className)}>
        {/* Tabs section - only show when showTabs is true */}
        {showTabs ? (
          <>
            {/* Left scroll button */}
            {canScrollLeft && (
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollLeft}
                className="h-8 w-8 flex-shrink-0"
                aria-label="Scroll tabs left"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Tabs container */}
            <div
              ref={scrollContainerRef}
              className="flex-1 flex overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none' }}
            >
              <div className="flex items-center gap-px px-1">
                {tabs.map((tab, index) => (
                  <div key={tab.id} className="flex items-center">
                    <div data-tab-id={tab.id} className="flex-shrink-0">
                      <TabItem
                        tab={tab}
                        isActive={tab.id === activeTabId}
                        onSwitch={handleTabSwitch}
                        onClose={handleTabClose}
                        maxWidth={tabWidth}
                        canClose={tabsCount > 1}
                      />
                    </div>
                    {/* Separator between tabs */}
                    {index < tabs.length - 1 && (
                      <div className="w-px h-4 bg-border opacity-50" />
                    )}
                  </div>
                ))}

                {/* New tab button */}
                {showNewTabButton && (
                  <div className="flex-shrink-0 ml-1">
                    <NewTabButton onNewTab={handleNewTab} />
                  </div>
                )}
              </div>
            </div>

            {/* Right scroll button */}
            {canScrollRight && (
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollRight}
                className="h-8 w-8 flex-shrink-0"
                aria-label="Scroll tabs right"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          /* New conversation button when tabs are hidden */
          <div className="flex-1 flex justify-start pl-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNewConversation}
                  className="h-8 w-8"
                >
                  <PenSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start new conversation</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Action buttons container */}
        <div className="flex items-center gap-0.5 ml-2 mr-1">
          {/* History button */}
          {showHistoryButton && <HistoryButton size="small" />}

          {/* Members button */}
          {showMembersButton && <MembersButton size="small" />}

          {/* Settings button */}
          {showSettingsButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSettingsClick}
                  className="h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Room settings</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Fullscreen button */}
          {showFullscreenButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFullscreenClick}
                  className="h-8 w-8"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fullscreen</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Chat Sidebar Toggle - only show when in project/altaner context */}
          {altanerId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // Toggle between preview and both modes only
                    const nextMode = displayMode === 'preview' ? 'both' : 'preview';
                    dispatch(setDisplayModeForProject({ altanerId, displayMode: nextMode }));
                  }}
                  className="h-8 w-8"
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{displayMode === 'preview' ? 'Show Chat Sidebar' : 'Hide Chat Sidebar'}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Sidebar button */}
          {showSidebarButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSidebarClick}
                  className="h-8 w-8"
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Transform to sidebar</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Close button */}
          {showCloseButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseClick}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onClose={handleSettingsClose} />
    </TooltipProvider>
  );
};

export default memo(TabBar);

