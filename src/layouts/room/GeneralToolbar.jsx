import { memo, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { cn } from '@lib/utils';

import { TabBar } from '../../components/tabs';
import { useTabPersistence } from '../../hooks/useTabPersistence';
import { selectTabsCount, selectMainThread, createTab } from '../../redux/slices/room';
import { dispatch } from '../../redux/store.js';

const GeneralToolbar = ({
  className,
  tabs = true,
  conversation_history = true,
  members = true,
  settings = true,
  show_close_button = false,
  show_fullscreen_button = false,
  show_sidebar_button = false,
  onFullscreen,
  onSidebar,
  onClose,
}) => {
  const mainThread = useSelector(selectMainThread);
  const tabsCount = useSelector(selectTabsCount);

  // Initialize tab persistence
  useTabPersistence();

  // Initialize tabs when room loads
  useEffect(() => {
    if (mainThread && tabsCount === 0) {
      // Create initial tab for main thread
      dispatch(
        createTab({
          threadId: mainThread,
          threadName: 'Main',
          isMainThread: true,
        }),
      );
    }
  }, [mainThread, tabsCount]);

  return (
    <div
      className={cn(
        'relative left-0 right-0 z-10 top-0 flex flex-col transition-all duration-500 px-1',
        className,
      )}
    >
      {/* Tab Bar */}
      <TabBar
        showTabs={tabs}
        showHistoryButton={conversation_history}
        showMembersButton={members}
        showSettingsButton={settings}
        showCloseButton={show_close_button}
        showFullscreenButton={show_fullscreen_button}
        showSidebarButton={show_sidebar_button}
        onFullscreen={onFullscreen}
        onSidebar={onSidebar}
        onClose={onClose}
      />

      {/* Additional toolbar content can be added here if needed */}
      <div style={{ flexGrow: 1 }} />
    </div>
  );
};

export default memo(GeneralToolbar);
