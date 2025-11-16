/**
 * Panel configuration utilities
 * Following DRY principle - centralize repeated logic
 */

import type { Altaner } from '../types';

export interface PanelSizeConfig {
  defaultSize: number;
  minSize: number;
  maxSize?: number;
}

/**
 * Extract room ID from altaner object
 * Centralizes type casting and property access
 */
export function getRoomId(altaner: Altaner): string {
  return (altaner as { room_id?: string }).room_id as string;
}

/**
 * Calculate chat panel size configuration
 * Single source of truth for panel sizing
 */
export function getChatPanelConfig(shouldCollapsePreview: boolean): PanelSizeConfig {
  return {
    defaultSize: shouldCollapsePreview ? 100 : 30,
    minSize: shouldCollapsePreview ? 100 : 20,
    maxSize: shouldCollapsePreview ? 100 : 65,
  };
}

/**
 * Calculate preview panel size configuration
 * Single source of truth for panel sizing
 */
export function getPreviewPanelConfig(shouldCollapsePreview: boolean): PanelSizeConfig {
  return {
    defaultSize: shouldCollapsePreview ? 0 : 70,
    minSize: shouldCollapsePreview ? 0 : 35,
  };
}

/**
 * Determine if resize handle should be active
 * Centralizes conditional logic
 */
export function isResizeHandleActive(
  displayMode: string,
  shouldCollapsePreview: boolean,
  operateMode: boolean
): boolean {
  return displayMode === 'both' && !shouldCollapsePreview && !operateMode;
}

