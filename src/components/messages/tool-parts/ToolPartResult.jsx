import React, { memo, useMemo } from 'react';

import { makeSelectToolPartResult } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';

const ToolPartResult = ({ partId, showResult }) => {
  const resultSelector = useMemo(() => makeSelectToolPartResult(), []);
  const resultData = useSelector((state) => resultSelector(state, partId));

  // Format result for display
  const formattedResult = useMemo(() => {
    if (!resultData?.result) return '';

    const result = resultData.result;

    // If result is a string, return it
    if (typeof result === 'string') return result;

    // Fallback to JSON stringify
    return JSON.stringify(result, null, 2);
  }, [resultData?.result]);

  const hasResult = !!resultData?.result;

  if (!showResult || !hasResult) {
    return null;
  }

  return (
    <div
      className="px-3 pb-3 pt-0.5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-600 scrollbar-track-transparent hover:scrollbar-thumb-blue-400 dark:hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgb(147 197 253) transparent',
      }}
    >
      <pre className="text-[11px] text-blue-600 dark:text-blue-400 opacity-80 whitespace-pre-wrap break-words font-mono">
        {formattedResult}
      </pre>
    </div>
  );
};

export default memo(ToolPartResult, (prevProps, nextProps) => {
  // Only re-render if partId or showResult changes
  return (
    prevProps.partId === nextProps.partId &&
    prevProps.showResult === nextProps.showResult
  );
});

