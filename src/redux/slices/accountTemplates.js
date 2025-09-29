import { createSlice, createSelector } from '@reduxjs/toolkit';

import { optimai } from '../../utils/axios';

// ----------------------------------------------------------------------

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const ITEMS_PER_PAGE = 25;

const initialState = {
  // Account-specific template caches - keyed by accountId
  accounts: {
    // Each account will have: { templates: [], loading: false, initialized: false, error: null, lastFetch: timestamp, hasMore: false, offset: 0, account: null }
  },
  // Global template cache by ID for deduplication
  byId: {},
  // Loading states
  loading: {},
  // Error states
  errors: {},
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
  name: 'accountTemplates',
  initialState,
  reducers: {
    // Loading states
    startLoading(state, action) {
      const { accountId } = action.payload;
      state.loading[accountId] = true;
      if (state.errors[accountId]) {
        delete state.errors[accountId];
      }
    },

    stopLoading(state, action) {
      const { accountId } = action.payload;
      state.loading[accountId] = false;
    },

    // Error handling
    setError(state, action) {
      const { accountId, error } = action.payload;
      state.errors[accountId] = error;
      state.loading[accountId] = false;
    },

    clearError(state, action) {
      const { accountId } = action.payload;
      if (state.errors[accountId]) {
        delete state.errors[accountId];
      }
    },

    // Account and templates data management
    setAccountData(state, action) {
      const { accountId, account, templates, hasMore, offset, loadMore = false } = action.payload;
      
      // Initialize account if it doesn't exist
      if (!state.accounts[accountId]) {
        state.accounts[accountId] = {
          templates: [],
          loading: false,
          initialized: false,
          error: null,
          lastFetch: null,
          hasMore: false,
          offset: 0,
          account: null,
        };
      }

      // Set account info
      if (account) {
        state.accounts[accountId].account = account;
      }

      // Transform templates to include cover URLs
      const transformedTemplates = templates.map(transformTemplateForDisplay);

      // Update global template cache
      transformedTemplates.forEach(template => {
        state.byId[template.id] = template;
      });

      // Update account templates
      if (loadMore) {
        // Append to existing templates, avoiding duplicates
        const existingIds = new Set(state.accounts[accountId].templates.map(t => t.id));
        const newTemplates = transformedTemplates.filter(t => !existingIds.has(t.id));
        state.accounts[accountId].templates = [
          ...state.accounts[accountId].templates,
          ...newTemplates,
        ];
      } else {
        // Replace templates for fresh load
        state.accounts[accountId].templates = transformedTemplates;
      }

      state.accounts[accountId].hasMore = hasMore;
      state.accounts[accountId].offset = offset;
      state.accounts[accountId].lastFetch = Date.now();
      state.accounts[accountId].initialized = true;
      
      // Clear any existing error
      if (state.errors[accountId]) {
        delete state.errors[accountId];
      }
    },

    // Cache management
    invalidateAccount(state, action) {
      const { accountId } = action.payload;
      if (state.accounts[accountId]) {
        state.accounts[accountId].lastFetch = null;
        state.accounts[accountId].initialized = false;
        state.accounts[accountId].templates = [];
        state.accounts[accountId].offset = 0;
        state.accounts[accountId].hasMore = true;
      }
    },

    // Reset account state
    resetAccount(state, action) {
      const { accountId } = action.payload;
      if (state.accounts[accountId]) {
        delete state.accounts[accountId];
      }
      if (state.loading[accountId]) {
        delete state.loading[accountId];
      }
      if (state.errors[accountId]) {
        delete state.errors[accountId];
      }
    },
  },
});

// Export actions
export const {
  startLoading,
  stopLoading,
  setError,
  clearError,
  setAccountData,
  invalidateAccount,
  resetAccount,
} = slice.actions;

// Selectors
export const selectAccountTemplates = (state) => state.accountTemplates;

// Selector for specific account state
export const selectAccountState = (accountId) => createSelector(
  [selectAccountTemplates],
  (accountTemplates) => accountTemplates.accounts[accountId] || {
    templates: [],
    loading: false,
    initialized: false,
    error: null,
    lastFetch: null,
    hasMore: true,
    offset: 0,
    account: null,
  }
);

// Selector for account loading state
export const selectAccountLoading = (accountId) => createSelector(
  [selectAccountTemplates],
  (accountTemplates) => accountTemplates.loading[accountId] || false
);

// Selector for account error
export const selectAccountError = (accountId) => createSelector(
  [selectAccountTemplates],
  (accountTemplates) => accountTemplates.errors[accountId] || null
);

// Helper function to check if data is fresh
const isDataFresh = (lastFetch) => {
  if (!lastFetch) return false;
  return (Date.now() - lastFetch) < CACHE_TTL;
};

// Thunk actions
export const fetchAccountData = (accountId, options = {}) => async (dispatch, getState) => {
  const { loadMore = false, forceRefresh = false } = options;
  const state = getState();
  const accountState = state.accountTemplates.accounts[accountId];
  const isLoading = state.accountTemplates.loading[accountId];

  // Check if we should skip the fetch
  if (!forceRefresh && !loadMore && isDataFresh(accountState?.lastFetch)) {
    return Promise.resolve(accountState);
  }

  // Check if already loading
  if (isLoading) {
    return Promise.resolve(null);
  }

  dispatch(startLoading({ accountId }));

  try {
    const currentOffset = loadMore && accountState ? accountState.offset : 0;
    
    // Fetch account details and templates in parallel
    const [accountResponse, templatesResponse] = await Promise.all([
      // Only fetch account details if we don't have them yet
      (!accountState?.account || forceRefresh) 
        ? optimai.get(`/account/${accountId}/public`)
        : Promise.resolve({ data: { account: accountState.account } }),
      optimai.get(`/templates/list?limit=${ITEMS_PER_PAGE}&offset=${currentOffset}&template_type=altaner&account_id=${accountId}`)
    ]);

    const account = accountResponse?.data?.account;
    const fetchedTemplates = templatesResponse?.data?.templates || [];
    const totalCount = templatesResponse?.data?.total_count || 0;

    const hasMore = currentOffset + ITEMS_PER_PAGE < totalCount;
    const newOffset = currentOffset + ITEMS_PER_PAGE;

    dispatch(setAccountData({
      accountId,
      account,
      templates: fetchedTemplates,
      hasMore,
      offset: newOffset,
      loadMore,
    }));

    return Promise.resolve(accountState);
  } catch (error) {
    console.error('Failed to fetch account data:', error);
    dispatch(setError({ 
      accountId, 
      error: 'Failed to load account data. Please try again later.' 
    }));
    return Promise.reject(error);
  } finally {
    dispatch(stopLoading({ accountId }));
  }
};

// Load more templates for account
export const loadMoreAccountTemplates = (accountId) => (dispatch, getState) => {
  const state = getState();
  const accountState = state.accountTemplates.accounts[accountId];
  const isLoading = state.accountTemplates.loading[accountId];

  if (!accountState?.hasMore || isLoading) {
    return Promise.resolve(null);
  }

  return dispatch(fetchAccountData(accountId, { loadMore: true }));
};

// Refresh account data
export const refreshAccountData = (accountId) => (dispatch) => {
  dispatch(invalidateAccount({ accountId }));
  return dispatch(fetchAccountData(accountId, { forceRefresh: true }));
};

export default slice.reducer;
