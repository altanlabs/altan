import React from 'react';
import { Button } from '@/components/ui/button';
import { useRoomConfig } from '../contexts/RoomConfigContext';
import { setDrawerOpen } from '../../../redux/slices/room';
import { dispatch } from '../../../redux/store';

// --- Icons ---
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m8.66-11.66l-5.66 5.66M9.34 14.34l-5.66 5.66M23 12h-6m-6 0H1m19.66 8.66l-5.66-5.66M9.34 9.66L3.68 3.68" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

interface RoomToolbarProps {
  minimal?: boolean;
}

/**
 * Room Toolbar Component
 * 
 * Replaces: GeneralToolbar.jsx (72 lines)
 * 
 * Features:
 * - Clean layout with shadcn components
 * - Minimal mode for ephemeral
 * - Full mode for tabs
 */
export function RoomToolbar({ minimal = false }: RoomToolbarProps) {
  const config = useRoomConfig();

  const handleHistoryClick = () => {
    dispatch(setDrawerOpen(true));
  };

  if (minimal) {
    // Minimal toolbar for ephemeral mode - still show all buttons
    return (
      <div className="flex items-center justify-end px-4 py-2 border-b border-gray-200 dark:border-gray-700/30 bg-white dark:bg-[#121212]">
        <div className="flex items-center gap-1">
          {config.showConversationHistory && (
            <Button variant="ghost" size="icon" onClick={handleHistoryClick} title="History">
              <HistoryIcon />
            </Button>
          )}
          {config.showMembers && (
            <Button variant="ghost" size="icon" onClick={handleHistoryClick} title="Members">
              <UsersIcon />
            </Button>
          )}
          {config.showSettings && (
            <Button variant="ghost" size="icon" title="Settings">
              <SettingsIcon />
            </Button>
          )}
          {config.showFullscreenButton && config.onFullscreen && (
            <Button variant="ghost" size="icon" onClick={config.onFullscreen} title="Fullscreen">
              <FullscreenIcon />
            </Button>
          )}
          {config.showCloseButton && config.onClose && (
            <Button variant="ghost" size="icon" onClick={config.onClose} title="Close">
              <CloseIcon />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Full toolbar for tabs mode
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700/30">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {config.title || 'Room'}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {config.showConversationHistory && (
          <Button variant="ghost" size="sm">
            History
          </Button>
        )}
        {config.showMembers && (
          <Button variant="ghost" size="sm">
            Members
          </Button>
        )}
        {config.showSettings && (
          <Button variant="ghost" size="icon">
            <SettingsIcon />
          </Button>
        )}
        {config.showFullscreenButton && config.onFullscreen && (
          <Button variant="ghost" size="icon" onClick={config.onFullscreen}>
            <FullscreenIcon />
          </Button>
        )}
        {config.showCloseButton && config.onClose && (
          <Button variant="ghost" size="icon" onClick={config.onClose}>
            <CloseIcon />
          </Button>
        )}
      </div>
    </div>
  );
}

