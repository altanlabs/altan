import React from 'react';
import { Database } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

export const AlertBanners = ({ base, isPaused }) => {
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
                <Database size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  No Database Yet
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200/80">
                  Ask the AI in the chat to create and activate a database for you. This is a preview of what
                  your database interface will look like.
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
                  Database Instance is Paused
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-200/80">
                  This database instance is currently stopped. Click the "Resume" button to start it.
                </p>
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

