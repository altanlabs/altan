import { m } from 'framer-motion';
import { RefreshCw, Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { Button } from '../../../../ui/button.tsx';

export const OverviewHeader = ({ lastRefresh, metricsLoading, operating, onRefresh }) => {
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
          <h1 className="text-2xl sm:text-3xl font-bold">
            AI Cloud
          </h1>
          <Button
            size="icon"
            variant="outline"
            onClick={onRefresh}
            disabled={metricsLoading || operating}
            className="h-8 w-8 rounded-md border-border/60 bg-background/50 hover:bg-accent/40 shadow-sm"
            aria-label="Refresh"
          >
            {metricsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          {lastRefresh && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </m.div>
  );
};