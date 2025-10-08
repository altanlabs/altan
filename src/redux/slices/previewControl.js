import { createSlice } from '@reduxjs/toolkit';

// Load preview mode from localStorage or default to production
const getInitialPreviewMode = () => {
  try {
    const saved = localStorage.getItem('previewMode');
    return saved === 'development' ? 'development' : 'production';
  } catch {
    return 'production';
  }
};

// Initial state
const initialState = {
  navigationPath: null,
  shouldRefresh: false,
  shouldOpenInNewTab: false,
  iframeViewMode: 'desktop', // 'mobile' or 'desktop'
  previewMode: getInitialPreviewMode(), // Load from localStorage
  editMode: false, // Edit mode for component editing
  actionId: null, // Used to trigger actions
};

const previewControlSlice = createSlice({
  name: 'previewControl',
  initialState,
  reducers: {
    // Action to navigate to a specific path
    navigateToPath: (state, action) => {
      state.navigationPath = action.payload;
      state.actionId = Date.now(); // Trigger action
    },

    // Action to refresh the iframe
    refreshIframe: (state) => {
      state.shouldRefresh = true;
      state.actionId = Date.now(); // Trigger action
    },

    // Action to open iframe in new tab
    openInNewTab: (state) => {
      state.shouldOpenInNewTab = true;
      state.actionId = Date.now(); // Trigger action
    },

    // Action to toggle iframe view mode (cycles through desktop -> tablet -> mobile -> desktop)
    toggleIframeViewMode: (state) => {
      const modes = ['desktop', 'tablet', 'mobile'];
      const currentIndex = modes.indexOf(state.iframeViewMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      state.iframeViewMode = modes[nextIndex];
      state.actionId = Date.now(); // Trigger action
    },

    // Action to set iframe view mode
    setIframeViewMode: (state, action) => {
      state.iframeViewMode = action.payload;
      state.actionId = Date.now(); // Trigger action
    },

    // Action to toggle preview mode between production and development
    togglePreviewMode: (state) => {
      state.previewMode = state.previewMode === 'production' ? 'development' : 'production';
      state.actionId = Date.now(); // Trigger action
    },

    // Action to set preview mode
    setPreviewMode: (state, action) => {
      state.previewMode = action.payload;
      state.actionId = Date.now(); // Trigger action
    },

    // Action to toggle edit mode
    toggleEditMode: (state) => {
      state.editMode = !state.editMode;
      // If enabling edit mode, switch to development mode
      if (state.editMode && state.previewMode === 'production') {
        state.previewMode = 'development';
      }
      state.actionId = Date.now(); // Trigger action
    },

    // Clear actions after they've been processed
    clearActions: (state) => {
      state.navigationPath = null;
      state.shouldRefresh = false;
      state.shouldOpenInNewTab = false;
      state.actionId = null;
    },
  },
});

// Export actions
export const {
  navigateToPath,
  refreshIframe,
  openInNewTab,
  toggleIframeViewMode,
  setIframeViewMode,
  togglePreviewMode,
  setPreviewMode,
  toggleEditMode,
  clearActions,
} = previewControlSlice.actions;

// Selectors
export const selectNavigationPath = (state) => state.previewControl.navigationPath;
export const selectShouldRefresh = (state) => state.previewControl.shouldRefresh;
export const selectShouldOpenInNewTab = (state) => state.previewControl.shouldOpenInNewTab;
export const selectIframeViewMode = (state) => state.previewControl.iframeViewMode;
export const selectPreviewMode = (state) => state.previewControl.previewMode;
export const selectEditMode = (state) => state.previewControl.editMode;
export const selectActionId = (state) => state.previewControl.actionId;

export default previewControlSlice.reducer;