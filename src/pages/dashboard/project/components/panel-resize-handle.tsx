/**
 * Resize Handle Component
 * Single Responsibility: Renders panel resize handle with visual feedback
 */

import React from 'react';
import { PanelResizeHandle as ResizableHandle } from 'react-resizable-panels';

import type { ResizeHandleProps } from '../types';
import { isResizeHandleActive } from '../utils/panel-config';

export function ResizeHandle({
  displayMode,
  shouldCollapsePreview,
  operateMode,
}: ResizeHandleProps): React.ReactElement {
  const isActive = isResizeHandleActive(displayMode, shouldCollapsePreview, operateMode);

  return (
    <ResizableHandle
      className={`relative w-px group ${
        isActive ? 'cursor-ew-resize' : 'pointer-events-none opacity-0'
      }`}
    >
      {isActive && <ResizeHandleVisual />}
    </ResizableHandle>
  );
}

/**
 * Resize Handle Visual
 * Single Responsibility: Visual styling for resize handle
 */
function ResizeHandleVisual(): React.ReactElement {
  return (
    <>
      {/* Base handle bar */}
      <div className="absolute inset-y-0 left-0 right-0 bg-neutral-200 dark:bg-neutral-800 group-hover:bg-neutral-900 dark:group-hover:bg-neutral-100 transition-colors duration-150" />
      {/* Hover shadow effect */}
      <div className="absolute inset-y-[20%] left-0 right-0 bg-transparent group-hover:shadow-[0_0_4px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_0_4px_rgba(255,255,255,0.1)] transition-shadow duration-150" />
    </>
  );
}

