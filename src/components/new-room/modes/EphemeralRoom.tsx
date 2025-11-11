import { useEffect, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import GeneralToolbar from '../../../layouts/room/GeneralToolbar.jsx';
import { selectRoomThreadMain, setThreadMain } from '../../../redux/slices/room';
import { useSelector, dispatch } from '../../../redux/store';
import { useRoomConfig } from '../contexts/RoomConfigContext';
import { ThreadView } from '../thread/ThreadView';


export function EphemeralRoom() {
  const config = useRoomConfig();
  const location = useLocation();
  const history = useHistory();
  const threadMain = useSelector(selectRoomThreadMain);
  const hasInitialized = useRef(false);

  // Get thread_id from URL
  const searchParams = new URLSearchParams(location.search);
  const urlThreadId = searchParams.get('thread_id');

  // ALWAYS use the URL as the source of truth
  // If URL says 'new' → show empty state
  // If URL has UUID → show that thread
  const activeThreadId = urlThreadId || 'new';
  // On mount: Handle initial state
  useEffect(() => {
    if (urlThreadId && urlThreadId !== 'new') {
      dispatch(setThreadMain({ current: urlThreadId }));
    } else {
      dispatch(setThreadMain({ current: null }));
      if (!urlThreadId || urlThreadId !== 'new') {
        const params = new URLSearchParams(location.search);
        params.set('thread_id', 'new');
        history.replace({
          pathname: location.pathname,
          search: params.toString(),
        });
      }
    }

    // Mark as initialized after a tick to let Redux update
    setTimeout(() => {
      hasInitialized.current = true;
    }, 0);
  }, []); // Only on mount

  // After mount: Sync Redux → URL when threadMain changes (but NOT during initialization)
  useEffect(() => {
    if (!hasInitialized.current) return;

    if (threadMain.current && threadMain.current !== urlThreadId) {
      const params = new URLSearchParams(location.search);
      params.set('thread_id', threadMain.current);
      history.replace({
        pathname: location.pathname,
        search: params.toString(),
      });
    } else if (threadMain.current === null && urlThreadId && urlThreadId !== 'new') {
      console.log('🔄 Redux cleared, updating URL to: new');
      const params = new URLSearchParams(location.search);
      params.set('thread_id', 'new');
      history.replace({
        pathname: location.pathname,
        search: params.toString(),
      });
    }
  }, [threadMain.current, urlThreadId, location.pathname, history]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121212]">
      {/* Toolbar WITHOUT tabs (ephemeral = single thread only) */}
      <GeneralToolbar
        tabs={false} // NO tabs in ephemeral mode
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

      {/* Thread View - takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <ThreadView key={activeThreadId} threadId={activeThreadId} />
      </div>
    </div>
  );
}
