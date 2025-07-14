import { createSlice } from '@reduxjs/toolkit';

import { optimai } from '../../utils/axios';

// Helper function to check if a file is likely binary based on extension
const isBinaryFile = (path) => {
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
  const ext = path.split('.').pop().toLowerCase();
  return binaryExtensions.has(ext);
};

function deletePath(tree, targetPath) {
  const pathSegments = targetPath.split('/');

  // Handle deletion of top-level items
  if (pathSegments.length === 1) {
    const index = tree.children?.findIndex((child) => child.name === targetPath);
    if (index !== -1) {
      tree.children.splice(index, 1);
      return true;
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
  const index = current.children?.findIndex((child) => child.name === targetName);

  if (index !== -1) {
    current.children.splice(index, 1);
    return true;
  }

  console.warn(`Path not found: ${targetPath}`);
  return false;
}

const initialState = {
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
  openFiles: [], // Array of file paths that are currently open
  activeFile: null, // Currently active file in the editor
  fileContents: {}, // Map of file path to its content
  unsavedChanges: {}, // Map of file path to boolean indicating if there are unsaved changes
  fileModels: {}, // Map of file path to Monaco model URI

  // Editor view state
  drawerWidth: 240,
  isLoading: false,
  error: null,

  // File decorations (for future use)
  fileDecorations: {}, // Map of file path to its decorations (errors, git status, etc.)

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

const codeEditorSlice = createSlice({
  name: 'codeEditor',
  initialState,
  reducers: {
    // File tree actions
    setFileTree: (state, action) => {
      state.fileTree = action.payload;
      // Automatically expand root folder when tree is loaded
      if (action.payload?.path && !state.expandedFolders.includes(action.payload.path)) {
        state.expandedFolders.push(action.payload.path);
      }
      state.isLoading = false;
      state.error = null;
    },
    toggleFolder: (state, action) => {
      const folderPath = action.payload;
      const index = state.expandedFolders.indexOf(folderPath);
      if (index !== -1) {
        state.expandedFolders.splice(index, 1);
      } else {
        state.expandedFolders.push(folderPath);
      }
    },
    setExpandedFolders: (state, action) => {
      state.expandedFolders = action.payload;
    },

    // File content actions
    setFileContent: (state, action) => {
      const { path, content } = action.payload;
      state.fileContents[path] = content;

      // If this is a new file, add it to openFiles
      if (!state.openFiles.includes(path)) {
        state.openFiles.push(path);
      }
      state.activeFile = path;
      state.selectedFile = path;
    },
    updateFileContent: (state, action) => {
      const { path, content } = action.payload;
      if (state.fileContents[path] !== content) {
        state.fileContents[path] = content;
        state.unsavedChanges[path] = true;
      }
    },
    markFileSaved: (state, action) => {
      const path = action.payload;
      state.unsavedChanges[path] = false;
    },

    // Editor state actions
    openFile: (state, action) => {
      const path = action.payload;
      if (!state.openFiles.includes(path)) {
        state.openFiles.push(path);
      }
      state.activeFile = path;
      state.selectedFile = path;
    },
    closeFile: (state, action) => {
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
    deleteFile: (state, action) => {
      const path = action.payload;
      if (!path) {
        return;
      }
      deletePath(state.fileTree, path);
    },
    setActiveFile: (state, action) => {
      state.activeFile = action.payload;
      state.selectedFile = action.payload;
    },

    // Editor view state actions
    setDrawerWidth: (state, action) => {
      state.drawerWidth = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Editor preferences
    updatePreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },

    // Git-related actions
    setDiffChanges: (state, action) => {
      state.diff.changes = action.payload;
      state.diff.hasChanges = !!action.payload;
      state.diff.isLoading = false;
      state.diff.error = null;
    },
    setDiffLoading: (state, action) => {
      state.diff.isLoading = action.payload;
    },
    setDiffError: (state, action) => {
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

// Export actions
export const {
  setFileTree,
  deleteFile,
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

// Selectors
// Base selectors
const baseSelect = (state) => state.codeEditor;

// File tree selectors
export const selectFileTree = (state) => baseSelect(state)?.fileTree || null;
export const selectExpandedFolders = (state) => new Set(baseSelect(state)?.expandedFolders || []);

// File management selectors
export const selectOpenFiles = (state) => baseSelect(state)?.openFiles || [];
export const selectActiveFile = (state) => baseSelect(state)?.activeFile || null;
export const selectFileContent = (state, path) => baseSelect(state)?.fileContents?.[path] || '';
export const selectFilesUnsavedChanges = (state) => baseSelect(state)?.unsavedChanges;
export const selectHasUnsavedChanges = (state, path) =>
  Boolean(selectFilesUnsavedChanges(state)?.[path]);

// UI state selectors
export const selectDrawerWidth = (state) => baseSelect(state)?.drawerWidth || 240;
export const selectIsLoading = (state) => baseSelect(state)?.isLoading || false;
export const selectError = (state) => baseSelect(state)?.error || null;
export const selectPreferences = (state) =>
  baseSelect(state)?.preferences || initialState.preferences;

// Diff selectors
const selectDiffState = (state) => baseSelect(state)?.diff || {};
export const selectDiffChanges = selectDiffState;
export const selectHasDiffChanges = (state) => selectDiffState(state).hasChanges || false;
export const selectDiffContent = (state) => selectDiffState(state).changes || null;
export const selectDiffIsLoading = (state) => selectDiffState(state).isLoading || false;
export const selectDiffError = (state) => selectDiffState(state).error || null;

// Thunks
export const fetchFileTree = (interfaceId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const treeResponse = await optimai.post(`/interfaces/dev/${interfaceId}/files/list-tree-json`, {
      include_hidden: false,
    });
    const tree = treeResponse.data.tree;
    dispatch(setFileTree(tree));
  } catch (error) {
    console.error('Error loading file tree:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchFileContent = (interfaceId, path) => async (dispatch) => {
  // Don't fetch if it's a binary file
  if (isBinaryFile(path)) {
    return;
  }

  dispatch(setLoading(true));
  try {
    const response = await optimai.post(`/interfaces/dev/${interfaceId}/files/read`, path);

    if (response.data && typeof response.data === 'object' && response.data.error) {
      console.warn(`Error loading file ${path}:`, response.data.error);
      dispatch(setFileContent({ path, content: `// Error loading file: ${response.data.error}` }));
    } else {
      dispatch(setFileContent({ path, content: response.data.content || '' }));
    }
  } catch (error) {
    console.error('Error loading file:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Combined openFile thunk that handles both state update and content fetching
export const openFile = (path, interfaceId) => async (dispatch, getState) => {
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

export const saveFile = (interfaceId, path, content) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    if (!isBinaryFile(path)) {
      await optimai.post(`/interfaces/dev/${interfaceId}/files/create`, {
        file_name: path,
        content: content,
      });
      await optimai.post(`/interfaces/dev/${interfaceId}/repo/commit`, {
        message: `Edited file ${path}`,
      });
      dispatch(markFileSaved(path));
    } else {
      throw new Error('Cannot save binary files');
    }
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const createFile =
  (interfaceId, path, type = 'file') =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      if (type === 'file') {
        await optimai.post(`/interfaces/dev/${interfaceId}/files/create`, {
          file_name: path,
          content: '',
        });
      } else {
        await optimai.post(`/interfaces/dev/${interfaceId}/files/create-directory`, {
          path: path,
        });
      }
      // Refresh the file tree after creating a new file/folder
      dispatch(fetchFileTree(interfaceId));
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

// Git-related thunks
export const fetchDiffChanges = (interfaceId) => async (dispatch) => {
  dispatch(setDiffLoading(true));
  try {
    const response = await optimai.get(`/interfaces/dev/${interfaceId}/changes`);
    dispatch(setDiffChanges(response.data));
  } catch (error) {
    console.error('Error fetching diff changes:', error);
    dispatch(setDiffError(error.message));
  }
};

export const acceptChanges =
  (interfaceId, message = 'New commit') =>
  async (dispatch) => {
    dispatch(setDiffLoading(true));
    try {
      await optimai.post(`/interfaces/dev/${interfaceId}/accept-changes`, { message });
      dispatch(clearDiffChanges());
      return Promise.resolve('success');
    } catch (e) {
      console.error('Error accepting changes:', e);
      dispatch(setDiffError(e.message));
      return Promise.reject(e);
    }
  };

export const discardChanges = (interfaceId) => async (dispatch) => {
  dispatch(setDiffLoading(true));
  try {
    await optimai.post(`/interfaces/dev/${interfaceId}/discard-changes`);
    dispatch(clearDiffChanges());
    return Promise.resolve('success');
  } catch (e) {
    console.error('Error discarding changes:', e);
    dispatch(setDiffError(e.message));
    return Promise.reject(e);
  }
};
