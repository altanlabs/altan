import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  navigationPath: null,
  shouldRefresh: false,
  shouldOpenInNewTab: false,
  iframeViewMode: 'desktop', // 'mobile' or 'desktop'
  previewMode: 'production', // 'production' or 'development'
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

    // Action to toggle iframe view mode
    toggleIframeViewMode: (state) => {
      state.iframeViewMode = state.iframeViewMode === 'mobile' ? 'desktop' : 'mobile';
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
  clearActions,
} = previewControlSlice.actions;

// Selectors
export const selectNavigationPath = (state) => state.previewControl.navigationPath;
export const selectShouldRefresh = (state) => state.previewControl.shouldRefresh;
export const selectShouldOpenInNewTab = (state) => state.previewControl.shouldOpenInNewTab;
export const selectIframeViewMode = (state) => state.previewControl.iframeViewMode;
export const selectPreviewMode = (state) => state.previewControl.previewMode;
export const selectActionId = (state) => state.previewControl.actionId;

export default previewControlSlice.reducer; 