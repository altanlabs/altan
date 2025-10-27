import React, { memo, useMemo } from 'react';

import { makeSelectToolPartError } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';

const ToolPartError = ({ partId, showError }) => {
  const errorSelector = useMemo(() => makeSelectToolPartError(), []);
  const errorData = useSelector((state) => errorSelector(state, partId));

  // Format error for display
  const formattedError = useMemo(() => {
    if (!errorData?.error) return '';

    const error = errorData.error;

    // If error is a string, return it
    if (typeof error === 'string') return error;

    // If error has __stats property
    if (error.__stats) {
      const stats = error.__stats;
      let errorMsg = '';

      // Add the main error message
      if (stats.error) {
        errorMsg += `Error: ${stats.error}\n`;
      }

      // Add status code and URL
      if (stats.status_code) {
        errorMsg += `Status: ${stats.status_code}\n`;
      }
      if (stats.url) {
        errorMsg += `URL: ${stats.url}\n`;
      }

      // Add detailed error data if available
      if (stats.data) {
        errorMsg += `\nDetails:\n${JSON.stringify(stats.data, null, 2)}`;
      }

      return errorMsg || JSON.stringify(error, null, 2);
    }

    // If error has content or message properties
    if (error.content) return error.content;
    if (error.message) return error.message;

    // Fallback to JSON stringify
    return JSON.stringify(error, null, 2);
  }, [errorData?.error]);

  const hasError = !!errorData?.error;

  if (!showError || !hasError) {
    return null;
  }

  return (
    <div
      className="px-3 py-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 dark:scrollbar-thumb-red-600 scrollbar-track-transparent hover:scrollbar-thumb-red-400 dark:hover:scrollbar-thumb-red-500 scrollbar-thumb-rounded-full bg-red-50/30 dark:bg-red-950/20"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgb(252 165 165) transparent',
      }}
    >
      <pre className="text-[10px] text-red-700 dark:text-red-400 whitespace-pre-wrap break-words font-mono">
        {formattedError}
      </pre>
    </div>
  );
};

export default memo(ToolPartError, (prevProps, nextProps) => {
  // Only re-render if partId or showError changes
  return (
    prevProps.partId === nextProps.partId &&
    prevProps.showError === nextProps.showError
  );
});
