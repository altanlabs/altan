import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';

import { getTemplateService } from '../../services';
import type { Template } from '../../services';
import type { AppThunk, RootState } from '../store';

// ----------------------------------------------------------------------

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const ITEMS_PER_PAGE = 100;

interface AccountsTemplatesState {
  // Templates data
  templates: Template[];
  // Loading states
  loading: boolean;
  loadingMore: boolean;
  // Error state
  error: string | null;
  // Pagination
  offset: number;
  hasMore: boolean;
  // Cache management
  lastFetch: number | null;
  initialized: boolean;
  // Search
  searchTerm: string;
}

const initialState: AccountsTemplatesState = {
  // Templates data
  templates: [],
  // Loading states
  loading: false,
  loadingMore: false,
  // Error state
  error: null,
  // Pagination
  offset: 0,
  hasMore: true,
  // Cache management
  lastFetch: null,
  initialized: false,
  // Search
  searchTerm: '',
};

// Helper function to get cover URL from template data
const getCoverUrlFromTemplate = (template: Template): string | null => {
  // Use the cover_url directly from selected_version if available
  if (template.selected_version?.cover_url) {
    return template.selected_version.cover_url;
  }
  // Fallback to build_metadata if still needed for compatibility
  if (template.selected_version?.build_metadata?.meta_data?.cover_url) {
    return template.selected_version.build_metadata.meta_data.cover_url;
  }
  // Fallback to template meta_data
  if (template.meta_data?.cover_url) {
    return template.meta_data.cover_url;
  }
  return null;
};

// Transform template for display
const transformTemplateForDisplay = (template: Template): Template => {
  const coverUrl = getCoverUrlFromTemplate(template);
  return {
    ...template,
    cover_url: coverUrl || '/assets/placeholder.svg',
    has_cover: Boolean(coverUrl),
  };
};

interface SetTemplatesPayload {
  templates: Template[];
  hasMore: boolean;
  offset: number;
  loadMore?: boolean;
}

const slice = createSlice({
  name: 'accountsTemplates',
  initialState,
  reducers: {
    // Loading states
    startLoading(state) {
      state.loading = true;
      state.error = null;
    },

    stopLoading(state) {
      state.loading = false;
    },

    startLoadingMore(state) {
      state.loadingMore = true;
      state.error = null;
    },

    stopLoadingMore(state) {
      state.loadingMore = false;
    },

    // Error handling
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
      state.loadingMore = false;
    },

    clearError(state) {
      state.error = null;
    },

    // Templates data management
    setTemplates(state, action: PayloadAction<SetTemplatesPayload>) {
      const { templates, hasMore, offset, loadMore = false } = action.payload;

      // Transform templates to include cover URLs and filter out ones without covers
      const transformedTemplates = templates
        .map(transformTemplateForDisplay)
        .filter(template => template.has_cover);

      if (loadMore) {
        // Append to existing templates, avoiding duplicates
        const existingIds = new Set(state.templates.map(t => t.id));
        const newTemplates = transformedTemplates.filter(t => !existingIds.has(t.id));
        state.templates = [...state.templates, ...newTemplates];
      } else {
        // Replace templates for fresh load
        state.templates = transformedTemplates;
      }

      state.hasMore = hasMore;
      state.offset = offset;
      state.lastFetch = Date.now();
      state.initialized = true;
      state.error = null;
    },

    // Search management
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },

    // Cache management
    invalidateCache(state) {
      state.lastFetch = null;
      state.initialized = false;
      state.templates = [];
      state.offset = 0;
      state.hasMore = true;
    },

    // Reset state
    resetState(state) {
      Object.assign(state, initialState);
    },
  },
});

// Export actions
export const {
  startLoading,
  stopLoading,
  startLoadingMore,
  stopLoadingMore,
  setError,
  clearError,
  setTemplates,
  setSearchTerm,
  invalidateCache,
  resetState,
} = slice.actions;

// Selectors
export const selectAccountsTemplates = (state: RootState) => state.accountsTemplates;

export const selectAccountsTemplatesData = createSelector(
  [selectAccountsTemplates],
  (accountsTemplates) => accountsTemplates.templates,
);

export const selectAccountsTemplatesLoading = createSelector(
  [selectAccountsTemplates],
  (accountsTemplates) => accountsTemplates.loading,
);

export const selectAccountsTemplatesError = createSelector(
  [selectAccountsTemplates],
  (accountsTemplates) => accountsTemplates.error,
);

export const selectAccountsTemplatesHasMore = createSelector(
  [selectAccountsTemplates],
  (accountsTemplates) => accountsTemplates.hasMore,
);

export const selectAccountsTemplatesLoadingMore = createSelector(
  [selectAccountsTemplates],
  (accountsTemplates) => accountsTemplates.loadingMore,
);

export const selectAccountsTemplatesSearchTerm = createSelector(
  [selectAccountsTemplates],
  (accountsTemplates) => accountsTemplates.searchTerm,
);

// Selector for filtered templates based on search term
export const selectFilteredAccountsTemplates = createSelector(
  [selectAccountsTemplatesData, selectAccountsTemplatesSearchTerm],
  (templates, searchTerm) => {
    if (!searchTerm.trim()) {
      return templates;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return templates.filter(template =>
      template.name?.toLowerCase().includes(lowerSearchTerm) ||
      template.description?.toLowerCase().includes(lowerSearchTerm) ||
      template.account?.name?.toLowerCase().includes(lowerSearchTerm),
    );
  },
);

// Helper function to check if data is fresh
const isDataFresh = (lastFetch: number | null): boolean => {
  if (!lastFetch) return false;
  return (Date.now() - lastFetch) < CACHE_TTL;
};

// Thunk action options
interface FetchAccountsTemplatesOptions {
  loadMore?: boolean;
  forceRefresh?: boolean;
  searchTerm?: string;
}

// Thunk actions
export const fetchAccountsTemplates = (
  options: FetchAccountsTemplatesOptions = {}
): AppThunk<Promise<AccountsTemplatesState | null>> => 
  async (dispatch, getState) => {
    const { loadMore = false, forceRefresh = false, searchTerm = '' } = options;
    const state = getState();
    const accountsTemplates = state.accountsTemplates;

    // Check if we should skip the fetch
    if (!forceRefresh && !loadMore && isDataFresh(accountsTemplates.lastFetch) && !searchTerm) {
      return Promise.resolve(accountsTemplates);
    }

    // Check if already loading
    if (accountsTemplates.loading || (loadMore && accountsTemplates.loadingMore)) {
      return Promise.resolve(null);
    }

    // Start loading
    if (loadMore) {
      dispatch(startLoadingMore());
    } else {
      dispatch(startLoading());
    }

    try {
      const templateService = getTemplateService();
      const currentOffset = loadMore ? accountsTemplates.offset : 0;

      const response = await templateService.fetchTemplates({
        limit: ITEMS_PER_PAGE,
        offset: currentOffset,
        template_type: 'altaner',
        name: searchTerm || undefined,
      });

      const fetchedTemplates = response.templates;
      const hasMore = fetchedTemplates.length === ITEMS_PER_PAGE;
      const newOffset = currentOffset + ITEMS_PER_PAGE;

      dispatch(setTemplates({
        templates: fetchedTemplates,
        hasMore,
        offset: newOffset,
        loadMore,
      }));

      // Update search term in state if provided
      if (searchTerm !== accountsTemplates.searchTerm) {
        dispatch(setSearchTerm(searchTerm));
      }

      return Promise.resolve(accountsTemplates);
    } catch (error) {
      console.error('Failed to fetch accounts templates:', error);
      dispatch(setError('Failed to load templates. Please try again later.'));
      return Promise.reject(error);
    } finally {
      if (loadMore) {
        dispatch(stopLoadingMore());
      } else {
        dispatch(stopLoading());
      }
    }
  };

// Refresh templates
export const refreshAccountsTemplates = (): AppThunk => (dispatch) => {
  dispatch(invalidateCache());
  return dispatch(fetchAccountsTemplates({ forceRefresh: true }));
};

// Load more templates
export const loadMoreAccountsTemplates = (): AppThunk<Promise<AccountsTemplatesState | null>> => 
  (dispatch, getState) => {
    const state = getState();
    const { hasMore, loadingMore, searchTerm } = state.accountsTemplates;

    if (!hasMore || loadingMore) {
      return Promise.resolve(null);
    }

    return dispatch(fetchAccountsTemplates({ loadMore: true, searchTerm }));
  };

// Search templates
export const searchAccountsTemplates = (searchTerm: string): AppThunk => (dispatch) => {
  dispatch(setSearchTerm(searchTerm));
  dispatch(invalidateCache());
  return dispatch(fetchAccountsTemplates({ searchTerm, forceRefresh: true }));
};

export default slice.reducer;

