import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getMarketplaceService, type MarketplaceTemplate, type TemplateEntityType } from '../../services';
import type { AppDispatch, RootState } from '../store';

const TEMPLATE_ELEMENTS: TemplateEntityType[] = ['altaner', 'workflow', 'agent', 'form', 'interface', 'database'];

interface TemplateCollection {
  byId: Record<string, MarketplaceTemplate>;
  allIds: string[];
}

interface EntityState<T> {
  [key: string]: T;
}

interface MarketplaceState {
  isLoading: EntityState<boolean>;
  initialized: EntityState<boolean>;
  error: EntityState<string | null>;
  templates: EntityState<TemplateCollection>;
  current: MarketplaceTemplate | null;
}

const REDUCER_ELEMENTS: Array<{ key: keyof Omit<MarketplaceState, 'current'>; value: boolean | null | TemplateCollection }> = [
  { key: 'isLoading', value: false },
  { key: 'initialized', value: false },
  { key: 'error', value: null },
  {
    key: 'templates',
    value: {
      byId: {},
      allIds: [],
    },
  },
];

const baseInitialState = REDUCER_ELEMENTS.reduce((acc, { key, value }) => {
  acc[key] = TEMPLATE_ELEMENTS.reduce((acc1, entity) => {
    acc1[entity] = value;
    return acc1;
  }, {} as EntityState<typeof value>);
  return acc;
}, {} as Omit<MarketplaceState, 'current'>);

const initialState: MarketplaceState = {
  ...baseInitialState,
  current: null,
};

const slice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    startLoading(state, action: PayloadAction<TemplateEntityType>) {
      state.isLoading[action.payload] = true;
    },
    stopLoading(state, action: PayloadAction<TemplateEntityType>) {
      state.isLoading[action.payload] = false;
    },
    hasError(state, action: PayloadAction<{ mode: TemplateEntityType; error: string }>) {
      const { mode, error } = action.payload;
      state.error[mode] = error;
      state.isLoading[mode] = false;
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
    setTemplates(state, action: PayloadAction<{ mode: TemplateEntityType; templates: MarketplaceTemplate[] }>) {
      const { mode, templates } = action.payload;
      state.templates[mode].allIds = templates.map((t) => t.id);
      state.templates[mode].byId = templates.reduce((acc, t) => {
        acc[t.id] = t;
        return acc;
      }, {} as Record<string, MarketplaceTemplate>);
      state.initialized[mode] = true;
    },
    addTemplate(state, action: PayloadAction<MarketplaceTemplate>) {
      const template = action.payload;
      if (!state.initialized[template.entity_type]) {
        return;
      }
      state.templates[template.entity_type].allIds.push(template.id);
      state.templates[template.entity_type].byId[template.id] = template;
    },
    setCurrentTemplate(state, action: PayloadAction<MarketplaceTemplate>) {
      state.current = action.payload;
    },
    clearCurrentTemplate(state) {
      state.current = null;
    },
    updateTemplate(state, action: PayloadAction<Partial<MarketplaceTemplate> & { id: string }>) {
      const { id, ...changes } = action.payload;
      for (const entity_type of TEMPLATE_ELEMENTS) {
        if (state.templates[entity_type].allIds.includes(id)) {
          state.templates[entity_type].byId[id] = {
            ...(state.templates[entity_type].byId[id] ?? {} as MarketplaceTemplate),
            ...changes,
          };
          break;
        }
      }
    },
    deleteTemplate(state, action: PayloadAction<string>) {
      const templateId = action.payload;
      for (const entity_type of TEMPLATE_ELEMENTS) {
        if (state.templates[entity_type].allIds.includes(templateId)) {
          state.templates[entity_type].allIds = state.templates[entity_type].allIds.filter(
            (id) => id !== templateId,
          );
          delete state.templates[entity_type].byId[templateId];
          break;
        }
      }
    },
  },
});

export default slice.reducer;

export const {
  clearState: clearMarketplaceState,
  // TEMPLATES
  addTemplate: addTemplateMarketplace,
  updateTemplate: updateTemplateMarketplace,
  deleteTemplate: deleteTemplateMarketplace,
  setCurrentTemplate: setCurrentTemplateMarketplace,
  clearCurrentTemplate: clearCurrentTemplateMarketplace,
} = slice.actions;

export const fetchTemplates = (templateType: TemplateEntityType) => async (dispatch: AppDispatch) => {
  dispatch(slice.actions.startLoading(templateType));
  try {
    const marketplaceService = getMarketplaceService();
    const response = await marketplaceService.fetchMarketplaceTemplates(templateType);
    dispatch(
      slice.actions.setTemplates({ mode: templateType, templates: response.templates }),
    );
    return Promise.resolve(true);
  } catch (e) {
    const error = e as Error;
    console.error(`error: could not get marketplace templates: ${error.message}`);
    dispatch(slice.actions.hasError({ mode: templateType, error: error.message }));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading(templateType));
  }
};

// Selectors
const selectMarketplaceState = (state: RootState) => state.marketplace;

export const selectTemplatesIds = (mode: TemplateEntityType) => (state: RootState): string[] =>
  selectMarketplaceState(state).templates[mode]?.allIds || [];

export const selectTemplatesById = (mode: TemplateEntityType) => (state: RootState): Record<string, MarketplaceTemplate> =>
  selectMarketplaceState(state).templates[mode]?.byId || {};

export const selectTemplatesInitialized = (mode: TemplateEntityType) => (state: RootState): boolean =>
  selectMarketplaceState(state).initialized[mode] || false;

export const selectTemplatesLoading = (mode: TemplateEntityType) => (state: RootState): boolean =>
  selectMarketplaceState(state).isLoading[mode] || false;

export const selectTemplatesError = (mode: TemplateEntityType) => (state: RootState): string | null =>
  selectMarketplaceState(state).error[mode] || null;

export const selectTemplate = (mode: TemplateEntityType, templateId: string) => (state: RootState): MarketplaceTemplate | undefined =>
  selectTemplatesById(mode)(state)?.[templateId];

export const selectCurrentTemplateMarketplace = (state: RootState): MarketplaceTemplate | null =>
  selectMarketplaceState(state).current;

