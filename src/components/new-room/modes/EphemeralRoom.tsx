import { useEffect, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import { selectMainThread, selectRoomThreadMain } from '../../../redux/slices/room/selectors/threadSelectors';
import { setThreadMain } from '../../../redux/slices/room/slices/threadsSlice';
import { useSelector, dispatch } from '../../../redux/store';
import GeneralToolbar from '../components/GeneralToolbar.jsx';
import { useRoomConfig } from '../contexts/RoomConfigContext';
import ThreadView from '../thread/ThreadView';


export function EphemeralRoom() {
  const config = useRoomConfig();
  const location = useLocation();
  const history = useHistory();
  const threadMain = useSelector(selectRoomThreadMain);
  const mainThread = useSelector(selectMainThread);
  const hasInitialized = useRef(false);

  console.log('🎬 EphemeralRoom render', { 
    threadMainCurrent: threadMain.current,
    mainThread,
    urlThreadId: new URLSearchParams(location.search).get('thread_id')
  });

  // Get thread_id from URL
  const searchParams = new URLSearchParams(location.search);
  const urlThreadId = searchParams.get('thread_id');

  // Determine active thread ID:
  // 1. If Redux has a thread (from fetchRoom), use it
  // 2. Otherwise, use URL thread_id
  // 3. Fall back to 'new' if nothing is set
  const activeThreadId = threadMain.current || mainThread || urlThreadId || 'new';
  
  console.log('✅ Active thread ID determined:', { 
    activeThreadId,
    source: threadMain.current ? 'Redux threadMain' : mainThread ? 'Redux mainThread' : urlThreadId ? 'URL' : 'default new'
  });

  // On mount: Handle initial state
  useEffect(() => {
    console.log('🔄 EphemeralRoom mount effect', { urlThreadId, mainThread });
    
    if (urlThreadId && urlThreadId !== 'new') {
      // URL has a specific thread, set it in Redux
      console.log('📡 Setting Redux threadMain from URL:', urlThreadId);
      dispatch(setThreadMain({ current: urlThreadId }));
    } else if (mainThread && !urlThreadId) {
      // Redux has mainThread (from fetchRoom), but URL doesn't - update URL
      console.log('🔄 Updating URL to match Redux mainThread:', mainThread);
      const params = new URLSearchParams(location.search);
      params.set('thread_id', mainThread);
      history.replace({
        pathname: location.pathname,
        search: params.toString(),
      });
    } else if (!urlThreadId || urlThreadId === 'new') {
      // No thread in URL, set to 'new' if we don't have a mainThread
      if (!mainThread) {
        console.log('⚪ No thread available, keeping URL as "new"');
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
    if (!hasInitialized.current) {
      console.log('⏸️ Not initialized yet, skipping Redux→URL sync');
      return;
    }

    console.log('🔄 Redux→URL sync check', { 
      threadMainCurrent: threadMain.current, 
      urlThreadId,
      mainThread 
    });

    // Priority: threadMain.current > mainThread > keep URL as is
    const targetThreadId = threadMain.current || mainThread;

    if (targetThreadId && targetThreadId !== urlThreadId) {
      console.log('🔄 Syncing URL to match Redux:', targetThreadId);
      const params = new URLSearchParams(location.search);
      params.set('thread_id', targetThreadId);
      history.replace({
        pathname: location.pathname,
        search: params.toString(),
      });
    } else if (!targetThreadId && urlThreadId && urlThreadId !== 'new') {
      console.log('🔄 Redux cleared, updating URL to: new');
      const params = new URLSearchParams(location.search);
      params.set('thread_id', 'new');
      history.replace({
        pathname: location.pathname,
        search: params.toString(),
      });
    }
  }, [threadMain.current, mainThread, urlThreadId, location.pathname, history]);

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
