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
  read_files: {
    icon: 'mdi:eye',
    renderer: null,
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

  // Cloud tools
  activate_cloud: {
    icon: 'material-symbols:cloud',
    renderer: null,
  },

  // SQL tools - use Monaco editor renderer
  execute_sql: {
    icon: 'mdi:database',
    renderer: 'FileEditorRenderer',
  },

  // Git/Commit tools
  commit: {
    icon: 'mdi:source-commit',
    renderer: 'CommitRenderer',
  },
  commit_changes: {
    icon: 'mdi:source-commit',
    renderer: 'CommitRenderer',
  },
  git_commit: {
    icon: 'mdi:source-commit',
    renderer: 'CommitRenderer',
  },

  // Terminal/Command execution tools
  execute_terminal_command: {
    icon: 'mdi:console',
    renderer: 'TerminalCommandRenderer',
  },
  run_command: {
    icon: 'mdi:console',
    renderer: 'TerminalCommandRenderer',
  },
  terminal: {
    icon: 'mdi:console',
    renderer: 'TerminalCommandRenderer',
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
