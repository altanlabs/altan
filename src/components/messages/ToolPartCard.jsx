import React, { useMemo, useCallback, useState } from 'react';

import ToolPartArguments from './tool-parts/ToolPartArguments.jsx';
import ToolPartError from './tool-parts/ToolPartError.jsx';
import ToolPartHeader from './tool-parts/ToolPartHeader.jsx';
import ToolPartResult from './tool-parts/ToolPartResult.jsx';
import { getCustomRenderer } from './tool-renderers/index.js';
import { makeSelectMessagePartById, makeSelectToolPartArguments } from '../../redux/slices/room';
import { useSelector } from '../../redux/store.js';

const ToolPartCard = ({
  partId,
  noClick = false,
  children,
}) => {
  const partSelector = useMemo(() => makeSelectMessagePartById(), []);
  const part = useSelector((state) => partSelector(state, partId));

  const argumentsSelector = useMemo(() => makeSelectToolPartArguments(), []);
  const argsData = useSelector((state) => argumentsSelector(state, partId));

  const [manuallyCollapsed, setManuallyCollapsed] = useState(true);

  // Get custom renderer component if available
  const CustomRenderer = useMemo(() => {
    // Try multiple ways to get the tool name for renderer lookup
    const toolName = part?.name || part?.task_execution?.tool_name || part?.task_execution?.tool?.name;

    // Special case: web search can be identified by metadata
    if (part?.meta_data?.provider_item_type === 'web_search_call') {
      return getCustomRenderer('web_search');
    }

    return getCustomRenderer(toolName);
  }, [part?.name, part?.task_execution?.tool_name, part?.task_execution?.tool?.name, part?.meta_data?.provider_item_type]);

  // Keep collapsed by default for better performance
  const isExpanded = useMemo(() => !manuallyCollapsed, [manuallyCollapsed]);

  const handleToggle = useCallback(() => {
    setManuallyCollapsed((v) => !v);
  }, []);

  // Determine if there are displayable arguments
  const hasDisplayableArguments = useMemo(() => {
    if (!argsData?.arguments) return false;
    try {
      const parsed = JSON.parse(argsData.arguments);
      const { __act_now, __act_done, __intent, __use_intent, ...filtered } = parsed;
      return Object.keys(filtered).length > 0;
    } catch {
      // If parsing fails, assume there are arguments
      return argsData.arguments.length > 0;
    }
  }, [argsData?.arguments]);

  const hasError = !!part?.error;
  const hasResult = !!part?.result;

  // Dummy onScroll handler for custom renderers (not critical for functionality)
  const handleScroll = useCallback(() => {
    // Custom renderers may use this for scroll tracking
  }, []);

  if (!part) {
    return null;
  }

  return (
    <div className="w-full my-0.5">
      {/* Custom Renderer (handles own header) or Default Header + Content */}
      {CustomRenderer ? (
        <CustomRenderer
          part={part}
          isExpanded={isExpanded}
          onToggle={handleToggle}
          onScroll={handleScroll}
        />
      ) : (
        <div className={`group border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-150 ${isExpanded ? 'w-full' : 'inline-flex max-w-full'}`}>
          {/* Default Header */}
          <ToolPartHeader
            partId={partId}
            noClick={noClick}
            isExpanded={isExpanded}
            onToggle={handleToggle}
            hasError={hasError}
          />

          {/* Auto-show Arguments, Result, and Error when expanded */}
          {isExpanded && (
            <>
              {/* Arguments Display */}
              {hasDisplayableArguments && (
                <div className="border-t border-gray-200/60 dark:border-gray-700/60">
                  <ToolPartArguments
                    partId={partId}
                    isExpanded={isExpanded}
                  />
                </div>
              )}

              {/* Result Display */}
              {hasResult && (
                <div className="border-t border-gray-200/60 dark:border-gray-700/60">
                  <ToolPartResult
                    partId={partId}
                    showResult={isExpanded}
                  />
                </div>
              )}

              {/* Error Display */}
              {hasError && (
                <div className="border-t border-gray-200/60 dark:border-gray-700/60">
                  <ToolPartError
                    partId={partId}
                    showError={isExpanded}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default ToolPartCard;
