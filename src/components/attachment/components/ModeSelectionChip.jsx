import { useState, useEffect } from 'react';

import { cn } from '../../../lib/utils';
import Iconify from '../../iconify/Iconify.jsx';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';

const MODE_OPTIONS = [
  {
    id: 'auto',
    label: 'Auto',
    icon: 'mdi:infinity',
    description: 'Automatically choose best mode',
  },
  {
    id: 'instant',
    label: 'Instant',
    icon: 'mdi:lightning-bolt',
    description: 'Direct agent delegation',
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: 'mdi:file-tree',
    description: 'Multi-step execution',
  },
  {
    id: 'chat',
    label: 'Ask',
    icon: 'mingcute:chat-3-line',
    description: 'Simple conversation mode',
  },
];

// Global localStorage key - persists across all rooms
const STORAGE_KEY = 'selectedMode';

const ModeSelectionChip = ({
  selectedMode = 'auto',
  onModeSelect,
  isVoiceActive = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Handle mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load persisted mode selection globally (across all rooms)
  useEffect(() => {
    if (!selectedMode || selectedMode === 'auto') {
      try {
        const savedMode = localStorage.getItem(STORAGE_KEY);
        if (savedMode && MODE_OPTIONS.find(m => m.id === savedMode)) {
          onModeSelect(savedMode);
        }
      } catch {
        // Error loading saved mode selection
      }
    }
  }, [selectedMode, onModeSelect]);

  const handleModeSelect = (mode) => {
    // Save selection to localStorage globally
    try {
      localStorage.setItem(STORAGE_KEY, mode.id);
    } catch {
      // Error saving mode selection
    }
    onModeSelect(mode.id);
    setIsOpen(false);
  };

  // Don't show if voice is active
  if (isVoiceActive) {
    return null;
  }

  // Get current mode object
  const currentMode = MODE_OPTIONS.find(m => m.id === selectedMode) || MODE_OPTIONS[0];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center justify-center gap-1 rounded-full h-[26px] transition-all',
            'text-[11px] font-medium',
            'bg-white/40 hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10',
            'backdrop-blur-sm',
            'text-gray-700 dark:text-gray-300',
            'border border-white/20 dark:border-white/10',
            'shadow-sm hover:shadow',
            'focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600',
            isMobile ? 'min-w-[24px] px-1' : 'px-2',
          )}
        >
          <Iconify icon={currentMode.icon} className="w-3 h-3" />
          {!isMobile && <span className="opacity-90">{currentMode.label}</span>}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-64 p-1.5 backdrop-blur-xl bg-white/50 dark:bg-white/10 border-white/20 dark:border-white/10 shadow-lg"
        align="start"
        side="top"
        sideOffset={8}
      >
        <div className="text-[10px] text-gray-600 dark:text-gray-400 px-2 py-1 mb-0.5 uppercase tracking-wide font-medium opacity-70">
          Execution mode
        </div>
        <div className="space-y-0.5">
          {MODE_OPTIONS.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode)}
              className={cn(
                'w-full rounded-md px-2 py-1.5 text-left transition-all',
                'hover:bg-white/50 dark:hover:bg-white/10',
                mode.id === selectedMode && 'bg-white/60 dark:bg-white/15',
              )}
            >
              <div className="flex items-center gap-1.5">
                <Iconify icon={mode.icon} className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                <span className="text-xs font-medium flex-1 text-gray-700 dark:text-gray-300">{mode.label}</span>
                {mode.id === selectedMode && (
                  <Iconify icon="mdi:check" className="w-3 h-3 text-primary opacity-70" />
                )}
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-500 ml-5 mt-0.5 opacity-70">
                {mode.description}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ModeSelectionChip;
