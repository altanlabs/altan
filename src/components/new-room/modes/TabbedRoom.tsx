import type { Location, History } from 'history';
import React, { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import GeneralToolbar from '../components/GeneralToolbar.jsx';
import { useRoomConfig } from '../contexts/RoomConfigContext';
import { useThreadManagement } from '../hooks/useThreadManagement';
import ThreadView from '../thread/ThreadView';

/**
 * Tabbed Room Mode
 * 
 * Features:
 * - Always land in main thread
 * - TabBar at top
 * - Can create new tabs (new threads)
 * - Tab switching with URL sync
 * - Main thread tab cannot be closed
 */
function TabbedRoom(): React.JSX.Element {
  const config = useRoomConfig();
  const location = useLocation<unknown>() as Location;
  const history = useHistory<unknown>() as History;
  const { activeThreadId } = useThreadManagement('tabs');

  // Sync active thread ID to URL for easy sharing
  useEffect(() => {
    if (!activeThreadId) {
      // eslint-disable-next-line no-console
      console.log('⚠️ No activeThreadId, skipping URL sync');
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const urlThreadId = searchParams.get('thread_id');

    if (urlThreadId !== activeThreadId) {
      searchParams.set('thread_id', activeThreadId);
      history.replace({
        pathname: location.pathname,
        search: searchParams.toString(),
      });
    }
  }, [activeThreadId, location.pathname, location.search, history]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121212]">
      {/* Toolbar - ALWAYS show in tabs mode (that's the whole point!) */}
      <GeneralToolbar
        tabs={true} // Always show tabs in tabs mode
        conversation_history={config.showConversationHistory}
        members={config.showMembers}
        settings={config.showSettings}
        show_close_button={config.showCloseButton}
        show_fullscreen_button={config.showFullscreenButton}
        show_sidebar_button={config.showSidebarButton}
        onFullscreen={config.onFullscreen}
        onSidebar={config.onSidebar}
        onClose={config.onClose}
      />

      {/* Thread View - takes full remaining space */}
      {activeThreadId && (
        <div className="flex-1 overflow-hidden">
          <ThreadView threadId={activeThreadId} />
        </div>
      )}
    </div>
  );
}


export default TabbedRoom;