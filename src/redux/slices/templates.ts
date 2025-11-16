import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { getTemplateService } from '../../services/TemplateService';
import type { Template } from '../../services/types';
import type { RootState } from '../store';
import type { AppDispatch } from '../store';

// ----------------------------------------------------------------------

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

interface CategoryData {
  templates: string[]; // Store template IDs
  loading: boolean;
  initialized: boolean;
  error: string | null;
  lastFetch: number | null;
  hasMore: boolean;
  offset: number;
}

interface TemplatesState {
  // Category-based caching
  categories: Record<string, CategoryData>;
  // Global template cache by ID for deduplication
  byId: Record<string, Template>;
  // Loading states
  loading: {
    categories: Record<string, boolean>;
  };
  // Error states
  errors: {
    categories: Record<string, string>;
  };
}

interface StartCategoryLoadingPayload {
  category: string;
}

interface StopCategoryLoadingPayload {
  category: string;
}

interface SetCategoryErrorPayload {
  category: string;
  error: string;
}

interface ClearCategoryErrorPayload {
  category: string;
}

interface SetCategoryTemplatesPayload {
  category: string;
  templates: Template[];
  hasMore: boolean;
  offset: number;
  loadMore?: boolean;
}

interface InvalidateCategoryPayload {
  category: string;
}

interface UpdateTemplatePayload {
  templateId: string;
  changes: Partial<Template>;
}

interface FetchCategoryTemplatesOptions {
  loadMore?: boolean;
  forceRefresh?: boolean;
}

// ----------------------------------------------------------------------
// Initial State
// ----------------------------------------------------------------------

const initialState: TemplatesState = {
  categories: {},
  byId: {},
  loading: {
    categories: {},
  },
  errors: {
    categories: {},
  },
};

// ----------------------------------------------------------------------
// Slice
// ----------------------------------------------------------------------

const slice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    // Category loading states
    startCategoryLoading(state, action: PayloadAction<StartCategoryLoadingPayload>) {
      const { category } = action.payload;
      if (!state.loading.categories) state.loading.categories = {};
      state.loading.categories[category] = true;
    },

    stopCategoryLoading(state, action: PayloadAction<StopCategoryLoadingPayload>) {
      const { category } = action.payload;
      if (!state.loading.categories) state.loading.categories = {};
      state.loading.categories[category] = false;
    },

    setCategoryError(state, action: PayloadAction<SetCategoryErrorPayload>) {
      const { category, error } = action.payload;
      if (!state.errors.categories) state.errors.categories = {};
      state.errors.categories[category] = error;
      if (!state.loading.categories) state.loading.categories = {};
      state.loading.categories[category] = false;
    },

    clearCategoryError(state, action: PayloadAction<ClearCategoryErrorPayload>) {
      const { category } = action.payload;
      if (state.errors.categories) {
        delete state.errors.categories[category];
      }
    },

    // Template data management
    setCategoryTemplates(state, action: PayloadAction<SetCategoryTemplatesPayload>) {
      const { category, templates, hasMore, offset, loadMore = false } = action.payload;
      // Initialize category if it doesn't exist
      if (!state.categories[category]) {
        state.categories[category] = {
          templates: [],
          loading: false,
          initialized: false,
          error: null,
          lastFetch: null,
          hasMore: false,
          offset: 0,
        };
      }

      // Update global template cache
      templates.forEach((template) => {
        state.byId[template.id] = template;
      });

      // Update category data
      if (loadMore) {
        // Append to existing templates, avoiding duplicates
        const existingIds = new Set(state.categories[category].templates);
        const newTemplateIds = templates
          .map((t) => t.id)
          .filter((id) => !existingIds.has(id));
        state.categories[category].templates = [
          ...state.categories[category].templates,
          ...newTemplateIds,
        ];
      } else {
        // Replace templates for fresh load
        state.categories[category].templates = templates.map((t) => t.id);
      }

      state.categories[category].hasMore = hasMore;
      state.categories[category].offset = offset;
      state.categories[category].lastFetch = Date.now();
      state.categories[category].initialized = true;
      // Clear any existing error
      if (state.errors.categories && state.errors.categories[category]) {
        delete state.errors.categories[category];
      }
    },

    // Cache management
    invalidateCategory(state, action: PayloadAction<InvalidateCategoryPayload>) {
      const { category } = action.payload;
      if (state.categories[category]) {
        state.categories[category].initialized = false;
        state.categories[category].lastFetch = null;
        state.categories[category].templates = [];
        state.categories[category].offset = 0;
        state.categories[category].hasMore = false;
      }
    },

    invalidateAllCategories(state) {
      state.categories = {};
      state.byId = {};
    },

    // Template updates
    updateTemplate(state, action: PayloadAction<UpdateTemplatePayload>) {
      const { templateId, changes } = action.payload;
      if (state.byId[templateId]) {
        state.byId[templateId] = {
          ...state.byId[templateId],
          ...changes,
        };
      }
    },

    // Clear state
    clearTemplatesState(state) {
      Object.assign(state, initialState);
    },
  },
});

// ----------------------------------------------------------------------
// Reducer
// ----------------------------------------------------------------------

export default slice.reducer;

// ----------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------

export const {
  startCategoryLoading,
  stopCategoryLoading,
  setCategoryError,
  clearCategoryError,
  setCategoryTemplates,
  invalidateCategory,
  invalidateAllCategories,
  updateTemplate,
  clearTemplatesState,
} = slice.actions;

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

/**
 * Check if category data is fresh
 */
const isCategoryDataFresh = (categoryData?: CategoryData): boolean => {
  if (!categoryData || !categoryData.initialized || !categoryData.lastFetch) {
    return false;
  }
  return Date.now() - categoryData.lastFetch < CACHE_TTL;
};

/**
 * Get cover URL from template data
 */
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

// ----------------------------------------------------------------------
// Thunk Actions
// ----------------------------------------------------------------------

/**
 * Fetch templates for a specific category
 */
export const fetchCategoryTemplates =
  (category: string, options: FetchCategoryTemplatesOptions = {}) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const { loadMore = false, forceRefresh = false } = options;
    const state = getState();
    const categoryData = state.templates.categories[category];

    // Check if we should skip the fetch
    if (!forceRefresh && !loadMore && isCategoryDataFresh(categoryData)) {
      return Promise.resolve(categoryData);
    }

    // Check if already loading
    if (state.templates.loading.categories[category]) {
      return Promise.resolve(null);
    }
    dispatch(startCategoryLoading({ category }));

    try {
      const currentOffset = loadMore && categoryData ? categoryData.offset : 0;
      const templateService = getTemplateService();

      const response = await templateService.fetchCategoryTemplates({
        limit: 50,
        offset: currentOffset,
        template_type: 'altaner',
        category: category !== 'uncategorized' ? category : undefined,
      });

      let fetchedTemplates = response.templates;

      // For uncategorized, filter out templates that have categories
      if (category === 'uncategorized') {
        fetchedTemplates = fetchedTemplates.filter((template) => {
          const templateCategory = template.meta_data?.category as string | undefined;
          return !templateCategory || templateCategory.toLowerCase() === '';
        });
      }

      // Transform templates to include cover URLs
      const transformedTemplates = fetchedTemplates.map((template) => {
        const coverUrl = getCoverUrlFromTemplate(template);
        return {
          ...template,
          cover_url: coverUrl || '/assets/placeholder.svg',
          has_cover: Boolean(coverUrl),
        };
      });

      const hasMore = fetchedTemplates.length === 50;
      const newOffset = currentOffset + 50;

      dispatch(
        setCategoryTemplates({
          category,
          templates: transformedTemplates,
          hasMore,
          offset: newOffset,
          loadMore,
        })
      );

      dispatch(stopCategoryLoading({ category }));

      return Promise.resolve({
        templates: transformedTemplates,
        hasMore,
        offset: newOffset,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch(setCategoryError({ category, error: errorMessage }));
      throw error;
    }
  };

// ----------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------

const selectTemplatesState = (state: RootState) => state.templates;

export const selectCategoryTemplates = (category: string) =>
  createSelector([selectTemplatesState], (templatesState) => {
    const categoryData = templatesState.categories[category];
    if (!categoryData || !categoryData.templates) {
      return [];
    }
    return categoryData.templates
      .map((templateId) => templatesState.byId[templateId])
      .filter(Boolean); // Filter out any undefined templates
  });

export const selectCategoryLoading = (category: string) => (state: RootState) => {
  return state.templates.loading.categories[category] || false;
};

export const selectCategoryError = (category: string) => (state: RootState) => {
  return state.templates.errors.categories[category] || null;
};

export const selectCategoryInitialized = (category: string) => (state: RootState) => {
  return state.templates.categories[category]?.initialized || false;
};

export const selectCategoryHasMore = (category: string) => (state: RootState) => {
  return state.templates.categories[category]?.hasMore || false;
};

export const selectCategoryDataFresh = (category: string) => (state: RootState) => {
  const categoryData = state.templates.categories[category];
  return isCategoryDataFresh(categoryData);
};

export const selectTemplate = (templateId: string) => (state: RootState) => {
  return state.templates.byId[templateId] || null;
};

// Composite selectors for component convenience
export const selectCategoryState = (category: string) =>
  createSelector(
    [
      selectCategoryTemplates(category),
      selectCategoryLoading(category),
      selectCategoryError(category),
      selectCategoryInitialized(category),
      selectCategoryHasMore(category),
      selectCategoryDataFresh(category),
    ],
    (templates, loading, error, initialized, hasMore, isFresh) => ({
      templates,
      loading,
      error,
      initialized,
      hasMore,
      isFresh,
    })
  );

