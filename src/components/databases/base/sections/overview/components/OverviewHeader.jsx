import { CircularProgress } from '@mui/material';
import { m } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import React, { useEffect } from 'react';

export const OverviewHeader = ({
  lastRefresh,
  metricsLoading,
  operating,
  onRefresh,
}) => {
  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!metricsLoading && !operating) {
        onRefresh();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [onRefresh, metricsLoading, operating]);

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8"
    >
      <div className="space-y-2 flex-1 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Overview
          </h1>
          <m.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRefresh}
            disabled={metricsLoading || operating}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {metricsLoading ? (
              <CircularProgress size={20} />
            ) : (
              <RefreshCw size={20} className="text-gray-600 dark:text-gray-400" />
            )}
          </m.button>
          {lastRefresh && (
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Monitor and configure compute resources for your database
        </p>
      </div>
    </m.div>
  );
};
