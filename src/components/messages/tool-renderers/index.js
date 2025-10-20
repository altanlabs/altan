/**
 * Tool Renderers Index
 * 
 * Exports all custom tool renderers and provides utilities for retrieving them.
 */

import CommitRenderer from './CommitRenderer.jsx';
import FileEditorRenderer from './FileEditorRenderer.jsx';
import ReadFileRenderer from './ReadFileRenderer.jsx';
import { TOOL_REGISTRY, getToolIcon, getToolRendererName } from './toolRendererConfig.js';

// Map of renderer names to actual components
const RENDERERS = {
  CommitRenderer,
  FileEditorRenderer,
  ReadFileRenderer,
};

/**
 * Get the custom renderer component for a specific tool
 * Returns null if no custom renderer is configured
 */
export function getCustomRenderer(toolName) {
  const rendererName = getToolRendererName(toolName);
  return rendererName ? RENDERERS[rendererName] : null;
}

// Export everything for convenience
export {
  TOOL_REGISTRY,
  getToolIcon,
  getToolRendererName,
  CommitRenderer,
  FileEditorRenderer,
  ReadFileRenderer,
};

