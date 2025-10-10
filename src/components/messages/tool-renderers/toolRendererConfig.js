/**
 * Tool Renderer Registry
 *
 * Maps tool names to their custom configurations including icons and renderers.
 * This is a central registry that makes it easy to add new custom renderers.
 */

export const TOOL_REGISTRY = {
  // File reading tools - use eye icon
  read_file: {
    icon: 'mdi:eye',
    renderer: 'ReadFileRenderer',
  },
  list_dir: {
    icon: 'mdi:eye',
    renderer: null,
  },

  // File editing tools - use Monaco editor renderer
  edit_file: {
    icon: 'lineicons:code-1',
    renderer: 'FileEditorRenderer',
  },
  create_file: {
    icon: 'hugeicons:ai-file',
    renderer: 'FileEditorRenderer',
  },
  write_file: {
    icon: 'hugeicons:ai-file',
    renderer: 'FileEditorRenderer',
  },

  // Add more tools here as needed
  // Example:
  // 'search': { icon: 'mdi:magnify', renderer: 'SearchRenderer' },
};

/**
 * Get the icon for a specific tool
 * Falls back to the default icon from task_execution or a generic hammer icon
 */
export function getToolIcon(toolName, fallbackIcon = 'ri:hammer-fill') {
  const config = TOOL_REGISTRY[toolName];
  return config?.icon || fallbackIcon;
}

/**
 * Get the custom renderer name for a specific tool
 * Returns null if no custom renderer is configured
 */
export function getToolRendererName(toolName) {
  const config = TOOL_REGISTRY[toolName];
  return config?.renderer || null;
}
