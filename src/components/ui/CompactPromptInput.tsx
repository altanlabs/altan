import { m, AnimatePresence } from 'framer-motion';
import * as React from 'react';

interface CompactPromptInputProps {
  onClick: () => void;
  placeholder?: string;
  isVisible: boolean;
}

/**
 * CompactPromptInput - A minimized version of the prompt input for the sticky header
 * Appears when user scrolls down, disappears when at top
 */
export const CompactPromptInput: React.FC<CompactPromptInputProps> = ({
  onClick,
  placeholder = "What would you like to build today?",
  isVisible,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <m.button
          key="compact-prompt"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClick}
          className="flex-1 max-w-2xl mx-4 h-10 px-4 rounded-full bg-card dark:bg-[#303030] border border-border dark:border-transparent shadow-sm hover:shadow-md transition-all cursor-pointer group"
          type="button"
        >
          <div className="flex items-center justify-between w-full h-full">
            <span className="text-sm text-muted-foreground dark:text-gray-400 group-hover:text-foreground dark:group-hover:text-gray-200 transition-colors truncate">
              {placeholder}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border dark:border-gray-600 bg-muted dark:bg-[#404040] px-1.5 font-mono text-[10px] font-medium text-muted-foreground dark:text-gray-400">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </m.button>
      )}
    </AnimatePresence>
  );
};

