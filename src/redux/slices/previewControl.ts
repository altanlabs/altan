import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Load preview mode from localStorage or default to production (live)
const getInitialPreviewMode = (): 'production' | 'development' => {
  try {
    const saved = localStorage.getItem('previewMode');
    // Explicitly check for null/undefined/empty and default to production
    if (!saved || saved === 'null' || saved === 'undefined' || saved === '') {
      return 'production';
    }
    // Only return development if explicitly set to 'development'
    return saved === 'development' ? 'development' : 'production';
  } catch {
    // Always default to production (live) on any error
    return 'production';
  }
};

type IframeViewMode = 'desktop' | 'tablet' | 'mobile';
type PreviewMode = 'production' | 'development';

interface PreviewControlState {
  navigationPath: string | null;
  shouldRefresh: boolean;
  shouldOpenInNewTab: boolean;
  iframeViewMode: IframeViewMode;
  previewMode: PreviewMode;
  editMode: boolean;
  actionId: number | null;
}

// Initial state
const initialState: PreviewControlState = {
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
    navigateToPath: (state, action: PayloadAction<string>) => {
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
      const modes: IframeViewMode[] = ['desktop', 'tablet', 'mobile'];
      const currentIndex = modes.indexOf(state.iframeViewMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      state.iframeViewMode = modes[nextIndex];
      state.actionId = Date.now(); // Trigger action
    },

    // Action to set iframe view mode
    setIframeViewMode: (state, action: PayloadAction<IframeViewMode>) => {
      state.iframeViewMode = action.payload;
      state.actionId = Date.now(); // Trigger action
    },

    // Action to toggle preview mode between production and development
    togglePreviewMode: (state) => {
      state.previewMode = state.previewMode === 'production' ? 'development' : 'production';
      state.actionId = Date.now(); // Trigger action
    },

    // Action to set preview mode
    setPreviewMode: (state, action: PayloadAction<PreviewMode>) => {
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
export const selectNavigationPath = (state: RootState): string | null =>
  state.previewControl.navigationPath;
export const selectShouldRefresh = (state: RootState): boolean => state.previewControl.shouldRefresh;
export const selectShouldOpenInNewTab = (state: RootState): boolean =>
  state.previewControl.shouldOpenInNewTab;
export const selectIframeViewMode = (state: RootState): IframeViewMode =>
  state.previewControl.iframeViewMode;
export const selectPreviewMode = (state: RootState): PreviewMode => state.previewControl.previewMode;
export const selectEditMode = (state: RootState): boolean => state.previewControl.editMode;
export const selectActionId = (state: RootState): number | null => state.previewControl.actionId;

export default previewControlSlice.reducer;

