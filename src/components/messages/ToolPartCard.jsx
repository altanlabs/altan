import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';

import { makeSelectMessagePartById, makeSelectToolPartArguments } from '../../redux/slices/room';
import { useSelector } from '../../redux/store.js';
import { getCustomRenderer } from './tool-renderers/index.js';
import ToolPartArguments from './tool-parts/ToolPartArguments.jsx';
import ToolPartError from './tool-parts/ToolPartError.jsx';
import ToolPartResult from './tool-parts/ToolPartResult.jsx';
import ToolPartHeader from './tool-parts/ToolPartHeader.jsx';

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

  const isCompleted = part?.is_done;

  // Get custom renderer component if available (must be defined before useEffect)
  const CustomRenderer = useMemo(() => {
    return getCustomRenderer(part?.name);
  }, [part?.name]);

  // Auto-expand when executing, auto-collapse when completed
  useEffect(() => {
    if (!isCompleted) {
      setManuallyCollapsed(false); // Expand when executing
    } else {
      setManuallyCollapsed(true); // Collapse when completed
    }
  }, [isCompleted]);

  const isExpanded = useMemo(() => !isCompleted || !manuallyCollapsed, [isCompleted, manuallyCollapsed]);

  const handleToggle = useCallback(() => {
    if (isCompleted) setManuallyCollapsed((v) => !v);
  }, [isCompleted]);

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

  if (!part) {
    return null;
  }

  // Dummy onScroll handler for custom renderers (not critical for functionality)
  const handleScroll = useCallback(() => {
    // Custom renderers may use this for scroll tracking
  }, []);

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
