import { Button } from '@/components/ui/button';

// --- Icons ---
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface Tab {
  id: string;
  threadId: string;
  threadName: string;
  isMainThread: boolean;
}

interface TabBarProps {
  activeThreadId: string;
  mainThreadId: string;
  onSwitchTab: (threadId: string) => void;
  onCloseTab: (threadId: string) => void;
  onCreateTab: () => void;
}

/**
 * Tab Bar Component
 * 
 * Features:
 * - Clean tab design (browser-style)
 * - Active tab indicator
 * - Close buttons (except main thread)
 * - "+ New Tab" button
 * - Uses shadcn Button or custom with Tailwind
 */
export function TabBar({
  activeThreadId,
  mainThreadId,
  onSwitchTab,
  onCloseTab,
  onCreateTab,
}: TabBarProps) {
  // TODO: Get tabs from Redux
  const tabs: Tab[] = [
    {
      id: mainThreadId,
      threadId: mainThreadId,
      threadName: 'Main',
      isMainThread: true,
    },
  ];

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-200 dark:border-gray-700/30 bg-gray-50 dark:bg-gray-900">
      {/* Tabs */}
      {tabs.map((tab) => {
        const isActive = tab.threadId === activeThreadId;
        return (
          <button
            key={tab.id}
            onClick={() => onSwitchTab(tab.threadId)}
            className={`
              group relative flex items-center gap-2 px-3 py-1.5 rounded-t-lg transition-all
              ${
                isActive
                  ? 'bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <span className="text-sm font-medium">{tab.threadName}</span>
            
            {/* Close button (not for main thread) */}
            {!tab.isMainThread && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.threadId);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
              >
                <XIcon />
              </button>
            )}
          </button>
        );
      })}

      {/* New Tab Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onCreateTab}
        className="h-8 px-2"
      >
        <PlusIcon />
      </Button>
    </div>
  );
}

