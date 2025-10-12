import React from 'react';
import { Play } from 'lucide-react';
import { m } from 'framer-motion';

export const StatusBadge = ({ base, isPaused, metrics, onClick }) => {
  return (
    <m.div
      whileHover={base ? { scale: 1.05 } : {}}
      whileTap={base ? { scale: 0.98 } : {}}
      onClick={base ? onClick : undefined}
      className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 backdrop-blur-sm self-start ${
        base ? 'cursor-pointer hover:shadow-lg transition-all' : 'opacity-50 cursor-not-allowed'
      }`}
    >
      {isPaused ? (
        <Play size={16} className="text-red-500 flex-shrink-0" />
      ) : (
        <div className="relative w-2.5 h-2.5 flex-shrink-0">
          <div className={`absolute inset-0 rounded-full bg-emerald-500 ${base ? 'animate-pulse' : ''}`} />
          {base && (
            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping" />
          )}
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <span className={`text-sm font-semibold ${isPaused ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {isPaused ? 'Paused' : 'Active'}
        </span>
        {metrics?.pods?.[0]?.status && (
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            Pod: {metrics.pods[0].status}
          </span>
        )}
      </div>
    </m.div>
  );
};

