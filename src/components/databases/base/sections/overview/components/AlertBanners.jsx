import { m, AnimatePresence } from 'framer-motion';
import { Database, Cloud, Loader2 } from 'lucide-react';
import React from 'react';

export const AlertBanners = ({ base, isPaused, onActivate, activating }) => {
  return (
    <AnimatePresence>
      {!base && (
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-blue-600 dark:text-blue-400">
                <Cloud size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    No Cloud yet
                  </h4>
                  {onActivate && (
                    <button
                      onClick={onActivate}
                      disabled={activating}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {activating && <Loader2 size={16} className="animate-spin" />}
                      {activating ? 'Activating...' : 'Activate Cloud'}
                    </button>
                  )}
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200/80">
                  Ask the AI in the chat to create and activate a cloud database for you.
                </p>
              </div>
            </div>
          </div>
        </m.div>
      )}

      {base && isPaused && (
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-amber-600 dark:text-amber-400">
                <Database size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  AI Cloud is Paused
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-200/80">
                  Click the &quot;Resume&quot; button to start it.
                </p>
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};
