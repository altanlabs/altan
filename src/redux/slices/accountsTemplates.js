import { createSlice, createSelector } from '@reduxjs/toolkit';

import { optimai } from '../../utils/axios';

// ----------------------------------------------------------------------

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const ITEMS_PER_PAGE = 100;

const initialState = {
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

// Helper function to get cover URL from template data (same as other slices)
const getCoverUrlFromTemplate = (template) => {
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
const transformTemplateForDisplay = (template) => {
  const coverUrl = getCoverUrlFromTemplate(template);
  return {
    ...template,
    cover_url: coverUrl || '/assets/placeholder.svg',
    has_cover: Boolean(coverUrl),
  };
};

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
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
      state.loadingMore = false;
    },

    clearError(state) {
      state.error = null;
    },

    // Templates data management
    setTemplates(state, action) {
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
    setSearchTerm(state, action) {
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
export const selectAccountsTemplates = (state) => state.accountsTemplates;

export const selectAccountsTemplatesData = createSelector(
  [selectAccountsTemplates],
  (accountsTemplates) => accountsTemplates.templates
);

export const selectAccountsTemplatesLoading = createSelector(
  [selectAccountsTemplates],
  (accountsTemplates) => accountsTemplates.loading
);

export const selectAccountsTemplatesError = createSelector(
  [selectAccountsTemplates],
  (accountsTemplates) => accountsTemplates.error
);

export const selectAccountsTemplatesHasMore = createSelector(
  [selectAccountsTemplates],
  (accountsTemplates) => accountsTemplates.hasMore
);

export const selectAccountsTemplatesLoadingMore = createSelector(
  [selectAccountsTemplates],
  (accountsTemplates) => accountsTemplates.loadingMore
);

export const selectAccountsTemplatesSearchTerm = createSelector(
  [selectAccountsTemplates],
  (accountsTemplates) => accountsTemplates.searchTerm
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
      template.account?.name?.toLowerCase().includes(lowerSearchTerm)
    );
  }
);

// Helper function to check if data is fresh
const isDataFresh = (lastFetch) => {
  if (!lastFetch) return false;
  return (Date.now() - lastFetch) < CACHE_TTL;
};

// Thunk actions
export const fetchAccountsTemplates = (options = {}) => async (dispatch, getState) => {
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
    const currentOffset = loadMore ? accountsTemplates.offset : 0;
    const params = new URLSearchParams({
      limit: ITEMS_PER_PAGE,
      offset: currentOffset.toString(),
      template_type: 'altaner',
    });

    // Add search term if provided
    if (searchTerm) {
      params.append('name', searchTerm);
    }

    const response = await optimai.get(`/templates/list?${params}`);
    const fetchedTemplates = response?.data?.templates || [];

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
export const refreshAccountsTemplates = () => (dispatch) => {
  dispatch(invalidateCache());
  return dispatch(fetchAccountsTemplates({ forceRefresh: true }));
};

// Load more templates
export const loadMoreAccountsTemplates = () => (dispatch, getState) => {
  const state = getState();
  const { hasMore, loadingMore, searchTerm } = state.accountsTemplates;

  if (!hasMore || loadingMore) {
    return Promise.resolve(null);
  }

  return dispatch(fetchAccountsTemplates({ loadMore: true, searchTerm }));
};

// Search templates
export const searchAccountsTemplates = (searchTerm) => (dispatch) => {
  dispatch(setSearchTerm(searchTerm));
  dispatch(invalidateCache());
  return dispatch(fetchAccountsTemplates({ searchTerm, forceRefresh: true }));
};

export default slice.reducer;
