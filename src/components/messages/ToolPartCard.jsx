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
  const [showError, setShowError] = useState(false);
  const [showResult, setShowResult] = useState(false);

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

  const handleErrorClick = useCallback((e) => {
    e.stopPropagation();
    setShowError((v) => !v);
  }, []);

  const handleResultClick = useCallback((e) => {
    e.stopPropagation();
    setShowResult((v) => !v);
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
    <div className="w-full">
      {/* Custom Renderer (handles own header) or Default Header + Content */}
      {CustomRenderer ? (
        <CustomRenderer
          part={part}
          isExpanded={isExpanded}
          onToggle={handleToggle}
          onScroll={handleScroll}
        />
      ) : (
        <>
          {/* Default Header */}
          <ToolPartHeader
            partId={partId}
            noClick={noClick}
            isExpanded={isExpanded}
            onToggle={handleToggle}
            hasDisplayableArguments={hasDisplayableArguments}
            hasError={hasError}
            onErrorClick={handleErrorClick}
            hasResult={hasResult}
            onResultClick={handleResultClick}
          />

          {/* Default Arguments Display */}
          <ToolPartArguments
            partId={partId}
            isExpanded={isExpanded}
          />
        </>
      )}

      {/* Error Display - Only show when clicked */}
      <ToolPartError
        partId={partId}
        showError={showError}
      />

      {/* Result Display - Only show when clicked */}
      <ToolPartResult
        partId={partId}
        showResult={showResult}
      />

      {children}
    </div>
  );
};

export default ToolPartCard;
