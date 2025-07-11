import { memo, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { cn } from '@lib/utils';

import { TabBar } from '../../components/tabs';
import { useTabPersistence } from '../../hooks/useTabPersistence';
import {
  selectTabsCount,
  selectMainThread,
  createTab,
} from '../../redux/slices/room';
import { dispatch } from '../../redux/store.js';

const GeneralToolbar = ({ className }) => {
  const mainThread = useSelector(selectMainThread);
  const tabsCount = useSelector(selectTabsCount);

  // Initialize tab persistence
  useTabPersistence();

  // Initialize tabs when room loads
  useEffect(() => {
    if (mainThread && tabsCount === 0) {
      // Create initial tab for main thread
      dispatch(createTab({
        threadId: mainThread,
        threadName: 'Main',
        isMainThread: true,
      }));
    }
  }, [mainThread, tabsCount]);

  return (
    <div
      className={cn(
        'relative left-0 right-0 z-10 top-0 flex flex-col transition-all duration-500 backdrop-blur-md bg-[#FFFFFF]/95 dark:bg-[#121212]/95',
        className,
      )}
    >
      {/* Tab Bar */}
      <TabBar />

      {/* Additional toolbar content can be added here if needed */}
      <div style={{ flexGrow: 1 }} />
    </div>
  );
};

export default memo(GeneralToolbar);
