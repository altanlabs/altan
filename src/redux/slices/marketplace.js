import { createSlice } from '@reduxjs/toolkit';

import { optimai } from '../../utils/axios';

const TEMPLATE_ELEMENTS = ['altaner', 'workflow', 'agent', 'form', 'interface', 'database'];

const REDUCER_ELEMENTS = [
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
  }, {});
  return acc;
}, {});

const initialState = {
  ...baseInitialState,
  current: null,
};

const slice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    startLoading(state, action) {
      state.isLoading[action.payload] = true;
    },
    stopLoading(state, action) {
      state.isLoading[action.payload] = false;
    },
    hasError(state, action) {
      const { mode, error } = action.payload;
      state.error[mode] = error;
      state.isLoading[mode] = false;
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
    setTemplates(state, action) {
      const { mode, templates } = action.payload;
      console.log('templates being set', templates);
      state.templates[mode].allIds = templates.map((t) => t.id);
      state.templates[mode].byId = templates.reduce((acc, t) => {
        acc[t.id] = t;
        return acc;
      }, {});
      state.initialized[mode] = true;
    },
    addTemplate(state, action) {
      const template = action.payload;
      if (!state.initialized[template.entity_type]) {
        return;
      }
      state.templates[template.entity_type].allIds.push(template.id);
      state.templates[template.entity_type].byId[template.id] = template;
    },
    setCurrentTemplate(state, action) {
      state.current = action.payload;
    },
    clearCurrentTemplate(state) {
      state.current = null;
    },
    updateTemplate(state, action) {
      const { id, ...changes } = action.payload;
      for (const entity_type of TEMPLATE_ELEMENTS) {
        if (state.templates[entity_type].allIds.includes(id)) {
          state.templates[entity_type].byId[id] = {
            ...(state.templates[entity_type].byId[id] ?? {}),
            ...changes,
          };
          break;
        }
      }
    },
    deleteTemplate(state, action) {
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

export const fetchTemplates = (templateType) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading(templateType));
  try {
    const response = await optimai.get(`/marketplace/templates/${templateType}`);
    dispatch(
      slice.actions.setTemplates({ mode: templateType, templates: response.data.templates }),
    );
    return Promise.resolve(true);
  } catch (e) {
    console.error(`error: could not get altaner: ${e.message}`);
    dispatch(slice.actions.hasError({ mode: templateType, error: e.message }));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading(templateType));
  }
};

const selectMarketplaceState = (state) => state.marketplace;

export const selectTemplatesIds = (mode) => (state) =>
  selectMarketplaceState(state).templates[mode]?.allIds;

export const selectTemplatesById = (mode) => (state) =>
  selectMarketplaceState(state).templates[mode]?.byId;

export const selectTemplatesInitialized = (mode) => (state) =>
  selectMarketplaceState(state).initialized[mode];

export const selectTemplatesLoading = (mode) => (state) =>
  selectMarketplaceState(state).isLoading[mode];

export const selectTemplatesError = (mode) => (state) => selectMarketplaceState(state).error[mode];

export const selectTemplate = (mode, templateId) => (state) =>
  selectTemplatesById(mode)(state)?.[templateId];

export const selectCurrentTemplateMarketplace = (state) => selectMarketplaceState(state).current;
