/* eslint-disable no-console, no-undef */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getInterfaceService } from '../../services';
import type { FileTreeNode, FileContentResponse } from '../../services';
import type { AppThunk } from '../store';

// ==================== Types ====================

/**
 * Diff state
 */
interface DiffState {
  hasChanges: boolean;
  changes: unknown;
  isLoading: boolean;
  error: string | null;
}

/**
 * Editor preferences
 */
interface EditorPreferences {
  fontSize: number;
  tabSize: number;
  theme: string;
  minimap: boolean;
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  lineNumbers: boolean;
  formatOnPaste: boolean;
  formatOnType: boolean;
  automaticLayout: boolean;
}

/**
 * Code editor state
 */
interface CodeEditorState {
  // File tree state
  fileTree: FileTreeNode | null;
  expandedFolders: string[];
  selectedFile: string | null;
  diff: DiffState;

  // Editor state
  openFiles: string[];
  activeFile: string | null;
  fileContents: Record<string, string>;
  unsavedChanges: Record<string, boolean>;
  fileModels: Record<string, string>;

  // Editor view state
  drawerWidth: number;
  isLoading: boolean;
  error: string | null;

  // File decorations (for future use)
  fileDecorations: Record<string, unknown>;

  // Editor preferences
  preferences: EditorPreferences;
}


// ==================== Helper Functions ====================

/**
 * Check if a file is likely binary based on extension
 */
const isBinaryFile = (path: string): boolean => {
  const binaryExtensions = new Set([
    'png',
    'jpg',
    'jpeg',
    'gif',
    'ico',
    'svg',
    'webp',
    'mp3',
    'mp4',
    'wav',
    'ogg',
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'zip',
    'tar',
    'gz',
    'rar',
    '7z',
    'ttf',
    'woff',
    'woff2',
    'eot',
    'exe',
    'dll',
    'so',
    'dylib',
  ]);
  const ext = path.split('.').pop()?.toLowerCase();
  return ext ? binaryExtensions.has(ext) : false;
};

/**
 * Delete a path from the file tree
 */
function deletePath(tree: FileTreeNode | null, targetPath: string): boolean {
  if (!tree) return false;

  const pathSegments = targetPath.split('/');

  // Handle deletion of top-level items
  if (pathSegments.length === 1) {
    if (tree.children) {
      const index = tree.children.findIndex((child) => child.name === targetPath);
      if (index !== -1) {
        tree.children.splice(index, 1);
        return true;
      }
    }
    console.warn(`Path not found: ${targetPath}`);
    return false;
  }

  let current = tree;

  // Traverse down to the parent of the target node
  for (let i = 0; i < pathSegments.length - 1; i++) {
    const segment = pathSegments[i];
    const nextNode = current.children?.find(
      (child) => child.name === segment && child.type === 'directory',
    );

    if (!nextNode) {
      console.warn(`Path not found: ${targetPath}`);
      return false;
    }

    current = nextNode;
  }

  // Remove the target node from its parent's children array
  const targetName = pathSegments[pathSegments.length - 1];
  if (current.children) {
    const index = current.children.findIndex((child) => child.name === targetName);

    if (index !== -1) {
      current.children.splice(index, 1);
      return true;
    }
  }

  console.warn(`Path not found: ${targetPath}`);
  return false;
}

/**
 * Add path property to tree nodes
 */
const addPathsToTree = (
  node: FileTreeNode,
  parentPath: string = '',
  isRoot: boolean = false
): FileTreeNode => {
  // For root node, use empty path to prevent repo_name from being included
  // This ensures all descendant paths are relative (e.g., 'src/file.js' instead of 'repo-name/src/file.js')
  const path = isRoot ? '' : (parentPath ? `${parentPath}/${node.name}` : node.name);

  const nodeWithPath: FileTreeNode = {
    ...node,
    path,
  };

  if (node.type === 'directory' && node.children) {
    nodeWithPath.children = node.children.map((child) => addPathsToTree(child, path, false));
  }

  return nodeWithPath;
};

// ==================== Initial State ====================

const initialState: CodeEditorState = {
  // File tree state
  fileTree: null,
  expandedFolders: [],
  selectedFile: null,
  diff: {
    hasChanges: true,
    changes: null,
    isLoading: false,
    error: null,
  },
  // Editor state
  openFiles: [],
  activeFile: null,
  fileContents: {},
  unsavedChanges: {},
  fileModels: {},

  // Editor view state
  drawerWidth: 240,
  isLoading: false,
  error: null,

  // File decorations (for future use)
  fileDecorations: {},

  // Editor preferences
  preferences: {
    fontSize: 14,
    tabSize: 2,
    theme: 'vs-dark',
    minimap: true,
    wordWrap: 'off',
    lineNumbers: true,
    formatOnPaste: true,
    formatOnType: true,
    automaticLayout: true,
  },
};

// ==================== Slice ====================

const codeEditorSlice = createSlice({
  name: 'codeEditor',
  initialState,
  reducers: {
    // File tree actions
    setFileTree: (state, action: PayloadAction<FileTreeNode | null>) => {
      state.fileTree = action.payload;
      // Automatically expand root folder when tree is loaded
      if (action.payload?.path && !state.expandedFolders.includes(action.payload.path)) {
        state.expandedFolders.push(action.payload.path);
      }
      state.isLoading = false;
      state.error = null;
    },
    toggleFolder: (state, action: PayloadAction<string>) => {
      const folderPath = action.payload;
      const index = state.expandedFolders.indexOf(folderPath);
      if (index !== -1) {
        state.expandedFolders.splice(index, 1);
      } else {
        state.expandedFolders.push(folderPath);
      }
    },
    setExpandedFolders: (state, action: PayloadAction<string[]>) => {
      state.expandedFolders = action.payload;
    },

    // File content actions
    setFileContent: (state, action: PayloadAction<{ path: string; content: string }>) => {
      const { path, content } = action.payload;
      state.fileContents[path] = content;

      // If this is a new file, add it to openFiles
      if (!state.openFiles.includes(path)) {
        state.openFiles.push(path);
      }
      state.activeFile = path;
      state.selectedFile = path;
    },
    updateFileContent: (state, action: PayloadAction<{ path: string; content: string }>) => {
      const { path, content } = action.payload;
      if (state.fileContents[path] !== content) {
        state.fileContents[path] = content;
        state.unsavedChanges[path] = true;
      }
    },
    markFileSaved: (state, action: PayloadAction<string>) => {
      const path = action.payload;
      state.unsavedChanges[path] = false;
    },

    // Editor state actions
    openFile: (state, action: PayloadAction<string>) => {
      const path = action.payload;
      if (!state.openFiles.includes(path)) {
        state.openFiles.push(path);
      }
      state.activeFile = path;
      state.selectedFile = path;
    },
    closeFile: (state, action: PayloadAction<string>) => {
      const path = action.payload;
      state.openFiles = state.openFiles.filter((f) => f !== path);
      delete state.fileContents[path];
      delete state.unsavedChanges[path];
      delete state.fileModels[path];

      if (state.activeFile === path) {
        state.activeFile = state.openFiles[state.openFiles.length - 1] || null;
        state.selectedFile = state.activeFile;
      }
    },
    deleteFile: (state, action: PayloadAction<string>) => {
      const path = action.payload;
      if (!path) {
        return;
      }
      deletePath(state.fileTree, path);
    },
    handleFileUpdate: (
      state,
      action: PayloadAction<{ path: string; content?: string; operation: 'update' | 'delete' | 'create' }>
    ) => {
      const { path, content, operation } = action.payload;

      switch (operation) {
        case 'update':
        case 'create':
          if (content !== undefined) {
            state.fileContents[path] = content;
            // Mark as having unsaved changes if the file is open
            if (state.openFiles.includes(path)) {
              state.unsavedChanges[path] = false; // Server update, so it's saved
            }
          }
          break;
        case 'delete':
          // Remove from open files if it was open
          state.openFiles = state.openFiles.filter((f) => f !== path);
          delete state.fileContents[path];
          delete state.unsavedChanges[path];
          delete state.fileModels[path];

          if (state.activeFile === path) {
            state.activeFile = state.openFiles[state.openFiles.length - 1] || null;
            state.selectedFile = state.activeFile;
          }

          // Remove from file tree
          deletePath(state.fileTree, path);
          break;
      }
    },
    setActiveFile: (state, action: PayloadAction<string>) => {
      state.activeFile = action.payload;
      state.selectedFile = action.payload;
    },

    // Editor view state actions
    setDrawerWidth: (state, action: PayloadAction<number>) => {
      state.drawerWidth = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Editor preferences
    updatePreferences: (state, action: PayloadAction<Partial<EditorPreferences>>) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },

    // Git-related actions
    setDiffChanges: (state, action: PayloadAction<unknown>) => {
      state.diff.changes = action.payload;
      state.diff.hasChanges = !!action.payload;
      state.diff.isLoading = false;
      state.diff.error = null;
    },
    setDiffLoading: (state, action: PayloadAction<boolean>) => {
      state.diff.isLoading = action.payload;
    },
    setDiffError: (state, action: PayloadAction<string>) => {
      state.diff.error = action.payload;
      state.diff.isLoading = false;
    },
    clearDiffChanges: (state) => {
      state.diff.changes = null;
      state.diff.hasChanges = false;
      state.diff.isLoading = false;
      state.diff.error = null;
    },
    clearCodeBaseState: (state) => {
      Object.assign(state, initialState);
    },
  },
});

// ==================== Actions ====================

export const {
  setFileTree,
  deleteFile,
  handleFileUpdate,
  toggleFolder,
  setExpandedFolders,
  setFileContent,
  updateFileContent,
  markFileSaved,
  closeFile,
  setActiveFile,
  setDrawerWidth,
  setLoading,
  setError,
  updatePreferences,
  setDiffChanges,
  setDiffLoading,
  setDiffError,
  clearDiffChanges,
  clearCodeBaseState,
} = codeEditorSlice.actions;

// Export the base openFile action separately for internal use
const openFileAction = codeEditorSlice.actions.openFile;

export default codeEditorSlice.reducer;

// ==================== Selectors ====================

// Base selectors
const baseSelect = (state: any): CodeEditorState => state.codeEditor;

// File tree selectors
export const selectFileTree = (state: any): FileTreeNode | null =>
  baseSelect(state)?.fileTree || null;
export const selectExpandedFolders = (state: any): Set<string> =>
  new Set(baseSelect(state)?.expandedFolders || []);

// File management selectors
export const selectOpenFiles = (state: any): string[] => baseSelect(state)?.openFiles || [];
export const selectActiveFile = (state: any): string | null =>
  baseSelect(state)?.activeFile || null;
export const selectFileContent = (state: any, path: string): string =>
  baseSelect(state)?.fileContents?.[path] || '';
export const selectFilesUnsavedChanges = (state: any): Record<string, boolean> =>
  baseSelect(state)?.unsavedChanges || {};
export const selectHasUnsavedChanges = (state: any, path: string): boolean =>
  Boolean(selectFilesUnsavedChanges(state)?.[path]);

// UI state selectors
export const selectDrawerWidth = (state: any): number =>
  baseSelect(state)?.drawerWidth || 240;
export const selectIsLoading = (state: any): boolean =>
  baseSelect(state)?.isLoading || false;
export const selectError = (state: any): string | null => baseSelect(state)?.error || null;
export const selectPreferences = (state: any): EditorPreferences =>
  baseSelect(state)?.preferences || initialState.preferences;

// Diff selectors
const selectDiffState = (state: any): DiffState =>
  baseSelect(state)?.diff || {
    hasChanges: false,
    changes: null,
    isLoading: false,
    error: null,
  };
export const selectDiffChanges = selectDiffState;
export const selectHasDiffChanges = (state: any): boolean =>
  selectDiffState(state).hasChanges || false;
export const selectDiffContent = (state: unknown): unknown =>
  selectDiffState(state).changes || null;
export const selectDiffIsLoading = (state: any): boolean =>
  selectDiffState(state).isLoading || false;
export const selectDiffError = (state: any): string | null =>
  selectDiffState(state).error || null;

// ==================== Thunks ====================

/**
 * Fetch file tree for an interface
 */
export const fetchFileTree =
  (interfaceId: string): AppThunk =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const interfaceService = getInterfaceService();
      let tree = await interfaceService.fetchFileTree(interfaceId, false);

      // If the tree doesn't have path properties, add them
      if (tree && !tree.path) {
        tree = addPathsToTree(tree, '', true); // Pass true for isRoot to strip repo_name
      }

      dispatch(setFileTree(tree));
    } catch (error) {
      console.error('Error loading file tree:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

/**
 * Fetch file content
 */
export const fetchFileContent =
  (interfaceId: string, path: string): AppThunk =>
  async (dispatch) => {
    // Don't fetch if it's a binary file
    if (isBinaryFile(path)) {
      return;
    }

    dispatch(setLoading(true));
    try {
      const interfaceService = getInterfaceService();
      const response: FileContentResponse = await interfaceService.readFile(interfaceId, path);

      if (response && typeof response === 'object' && response.error) {
        console.warn(`Error loading file ${path}:`, response.error);
        dispatch(setFileContent({ path, content: `// Error loading file: ${response.error}` }));
      } else {
        dispatch(setFileContent({ path, content: response.content || '' }));
      }
    } catch (error) {
      console.error('Error loading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

/**
 * Open a file (combined thunk that handles both state update and content fetching)
 */
export const openFile =
  (path: string, interfaceId?: string): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();

    // Dispatch the base openFile action first
    dispatch(openFileAction(path));

    // Always fetch the content to ensure we have the latest version
    if (!interfaceId) {
      const currentInterface = state.interfaces?.current?.id;
      if (!currentInterface) {
        console.error('No interfaceId available to fetch file content');
        return;
      }
      await dispatch(fetchFileContent(currentInterface, path));
    } else {
      await dispatch(fetchFileContent(interfaceId, path));
    }
  };

/**
 * Save a file
 */
export const saveFile =
  (interfaceId: string, path: string, content: string): AppThunk =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      if (!isBinaryFile(path)) {
        const interfaceService = getInterfaceService();
        await interfaceService.createFile(interfaceId, {
          file_name: path,
          content: content,
        });
        await interfaceService.commitChanges(interfaceId, {
          message: `Edited file ${path}`,
        });
        dispatch(markFileSaved(path));
      } else {
        throw new Error('Cannot save binary files');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

/**
 * Create a file or directory
 */
export const createFile =
  (interfaceId: string, path: string, type: 'file' | 'directory' = 'file'): AppThunk =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const interfaceService = getInterfaceService();
      if (type === 'file') {
        await interfaceService.createFile(interfaceId, {
          file_name: path,
          content: '',
        });
      } else {
        await interfaceService.createDirectory(interfaceId, {
          path: path,
        });
      }
      // Refresh the file tree after creating a new file/folder
      dispatch(fetchFileTree(interfaceId));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

/**
 * Fetch diff changes
 */
export const fetchDiffChanges =
  (interfaceId: string): AppThunk =>
  async (dispatch) => {
    dispatch(setDiffLoading(true));
    try {
      const interfaceService = getInterfaceService();
      const changes = await interfaceService.fetchDiffChanges(interfaceId);
      dispatch(setDiffChanges(changes));
    } catch (error) {
      console.error('Error fetching diff changes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch(setDiffError(errorMessage));
    }
  };

/**
 * Accept changes
 */
export const acceptChanges =
  (interfaceId: string, message: string = 'New commit'): AppThunk =>
  async (dispatch) => {
    dispatch(setDiffLoading(true));
    try {
      const interfaceService = getInterfaceService();
      await interfaceService.acceptChanges(interfaceId, { message });
      dispatch(clearDiffChanges());
      return Promise.resolve('success');
    } catch (e) {
      console.error('Error accepting changes:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      dispatch(setDiffError(errorMessage));
      return Promise.reject(e);
    }
  };

/**
 * Discard changes
 */
export const discardChanges =
  (interfaceId: string): AppThunk =>
  async (dispatch) => {
    dispatch(setDiffLoading(true));
    try {
      const interfaceService = getInterfaceService();
      await interfaceService.discardChanges(interfaceId);
      dispatch(clearDiffChanges());
      return Promise.resolve('success');
    } catch (e) {
      console.error('Error discarding changes:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      dispatch(setDiffError(errorMessage));
      return Promise.reject(e);
    }
  };

