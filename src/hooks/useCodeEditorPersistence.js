import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  setExpandedFolders,
  openFile,
  setActiveFile,
  setDrawerWidth,
  updatePreferences,
  selectExpandedFolders,
  selectOpenFiles,
  selectActiveFile,
  selectDrawerWidth,
  selectPreferences,
} from '../redux/slices/codeEditor';

const STORAGE_KEY = 'codeEditorState';

export const useCodeEditorPersistence = (interfaceId) => {
  const dispatch = useDispatch();

  // Get current state
  const expandedFolders = useSelector(selectExpandedFolders);
  const openFiles = useSelector(selectOpenFiles);
  const activeFile = useSelector(selectActiveFile);
  const drawerWidth = useSelector(selectDrawerWidth);
  const preferences = useSelector(selectPreferences);

  // Save state to localStorage
  useEffect(() => {
    if (!interfaceId) return;

    const state = {
      expandedFolders: Array.from(expandedFolders),
      openFiles,
      activeFile,
      drawerWidth,
      preferences,
      lastUpdated: Date.now(),
    };

    localStorage.setItem(`${STORAGE_KEY}:${interfaceId}`, JSON.stringify(state));
  }, [interfaceId, expandedFolders, openFiles, activeFile, drawerWidth, preferences]);

  // Restore state from localStorage
  useEffect(() => {
    if (!interfaceId) return;

    const savedState = localStorage.getItem(`${STORAGE_KEY}:${interfaceId}`);
    if (!savedState) return;

    try {
      const state = JSON.parse(savedState);

      // Only restore state if it's less than 24 hours old
      if (Date.now() - state.lastUpdated > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(`${STORAGE_KEY}:${interfaceId}`);
        return;
      }

      // Restore expanded folders
      if (state.expandedFolders) {
        dispatch(setExpandedFolders(state.expandedFolders));
      }

      // Restore drawer width
      if (state.drawerWidth) {
        dispatch(setDrawerWidth(state.drawerWidth));
      }

      // Restore preferences
      if (state.preferences) {
        dispatch(updatePreferences(state.preferences));
      }

      // Restore open files and active file
      if (state.openFiles) {
        // First open all files
        state.openFiles.forEach((path) => {
          dispatch(openFile(path));
        });

        // Then set the active file
        if (state.activeFile) {
          dispatch(setActiveFile(state.activeFile));
        }
      }
    } catch (error) {
      console.error('Error restoring code editor state:', error);
      localStorage.removeItem(`${STORAGE_KEY}:${interfaceId}`);
    }
  }, [interfaceId, dispatch]);
};
