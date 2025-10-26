/**
 * Tool Renderers Index
 * 
 * Exports all custom tool renderers and provides utilities for retrieving them.
 */

import CommitRenderer from './CommitRenderer.jsx';
import CreateTaskRenderer from './CreateTaskRenderer.jsx';
import FileEditorRenderer from './FileEditorRenderer.jsx';
import ReadFileRenderer from './ReadFileRenderer.jsx';
import TerminalCommandRenderer from './TerminalCommandRenderer.jsx';
import WebSearchRenderer from './WebSearchRenderer.jsx';
import { TOOL_REGISTRY, getToolIcon, getToolRendererName } from './toolRendererConfig.js';

// Map of renderer names to actual components
const RENDERERS = {
  CommitRenderer,
  CreateTaskRenderer,
  FileEditorRenderer,
  ReadFileRenderer,
  TerminalCommandRenderer,
  WebSearchRenderer,
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
  CreateTaskRenderer,
  FileEditorRenderer,
  ReadFileRenderer,
  TerminalCommandRenderer,
  WebSearchRenderer,
};

