import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { batch } from 'react-redux';

import { switchAccount } from './general/index';
import { analytics } from '../../lib/analytics';
import { getAltanerService } from '../../services';
import type {
  Altaner,
  AltanerComponent,
  AltanerTemplate,
  AltanerTemplateVersion,
  CreateAltanerData,
  UpdateAltanerData,
} from '../../services';
import {
  getDisplayModeForProject,
  setDisplayModeForProject as saveDisplayModeToStorage,
} from '../../utils/displayModeStorage';
import { checkObjectsEqual } from '../helpers/memoize';
import type { RootState, AppDispatch } from '../store';

// ==================== State Types ====================

interface AltanersState {
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  altaners: Record<string, Altaner>;
  altanersList: Altaner[];
  current: string | null;
  viewType: 'preview' | 'code';
  displayMode: 'chat' | 'preview' | 'both';
  operateMode: boolean;
}

// ==================== Initial State ====================

const initialState: AltanersState = {
  isLoading: false,
  error: null,
  initialized: false,
  altaners: {},
  altanersList: [],
  current: null,
  viewType: 'preview',
  displayMode: 'both',
  operateMode: false,
};

// ==================== Slice ====================

const slice = createSlice({
  name: 'altaners',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
      state.initialized = true;
    },
    hasError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
    setAltanersList(state, action: PayloadAction<Altaner[]>) {
      state.altanersList = action.payload;
      state.initialized = true;
    },
    addAltaner(state, action: PayloadAction<Altaner>) {
      const altaner = action.payload;
      // Normalize components structure: backend now returns array directly, but internally we store as {items: [...]}
      if (altaner.components && Array.isArray(altaner.components)) {
        altaner.components = { items: altaner.components as AltanerComponent[] };
      } else if (!altaner.components) {
        altaner.components = { items: [] };
      }
      state.altaners[altaner.id] = altaner;
    },
    setAltaner(state, action: PayloadAction<string>) {
      const altanerId = action.payload;
      state.current = altanerId;
    },
    clearCurrentAltaner(state) {
      state.current = null;
    },
    setViewType(state, action: PayloadAction<'preview' | 'code'>) {
      state.viewType = action.payload;
    },
    setDisplayMode(state, action: PayloadAction<'chat' | 'preview' | 'both'>) {
      state.displayMode = action.payload;
    },
    setDisplayModeForProject(state, action: PayloadAction<{ altanerId: string; displayMode: 'chat' | 'preview' | 'both' }>) {
      const { altanerId, displayMode } = action.payload;
      state.displayMode = displayMode;
      saveDisplayModeToStorage(altanerId, displayMode);
    },
    loadDisplayModeForProject(state, action: PayloadAction<string>) {
      const altanerId = action.payload;
      const savedDisplayMode = getDisplayModeForProject(altanerId);
      if (savedDisplayMode) {
        state.displayMode = savedDisplayMode;
      } else {
        state.displayMode = 'both';
      }
    },
    setOperateMode(state, action: PayloadAction<boolean>) {
      state.operateMode = action.payload;
    },
    toggleOperateMode(state) {
      state.operateMode = !state.operateMode;
    },
    updateAltaner(state, action: PayloadAction<Partial<Altaner> & { id: string }>) {
      const { id, ...changes } = action.payload;
      state.altaners[id] = { ...(state.altaners[id] ?? {} as Altaner), ...changes };
    },
    deleteAltaner(state, action: PayloadAction<string>) {
      const altanerId = action.payload;
      if (altanerId in state.altaners) {
        delete state.altaners[altanerId];
      }
    },
    // TEMPLATES
    addTemplate(state, action: PayloadAction<{ altaner_id: string; attributes: AltanerTemplate }>) {
      if (!state.current || !state.altaners[state.current]) {
        return;
      }
      const { altaner_id, attributes } = action.payload;
      if (state.altaners[state.current].id !== altaner_id) {
        return;
      }
      state.altaners[state.current].template = attributes;
    },
    updateTemplate(state, action: PayloadAction<{ altaner_id: string; ids: string[]; changes: Partial<AltanerTemplate> }>) {
      if (!state.current || !state.altaners[state.current]) {
        return;
      }
      const { altaner_id, ids, changes } = action.payload;
      if (
        state.altaners[state.current].id !== altaner_id ||
        state.altaners[state.current].template?.id !== ids[0]
      ) {
        return;
      }
      state.altaners[state.current].template = {
        ...(state.altaners[state.current].template || {} as AltanerTemplate),
        ...changes,
      };
    },
    deleteTemplate(state, action: PayloadAction<{ altaner_id: string; ids: string[] }>) {
      if (!state.current || !state.altaners[state.current]) {
        return;
      }
      const { altaner_id, ids } = action.payload;
      if (
        state.altaners[state.current].id !== altaner_id ||
        state.altaners[state.current].template?.id !== ids[0]
      ) {
        return;
      }
      delete state.altaners[state.current].template;
    },
    addTemplateVersion(state, action: PayloadAction<{ altaner_id: string; attributes: AltanerTemplateVersion }>) {
      if (!state.current || !state.altaners[state.current]?.template) {
        return;
      }
      const { altaner_id, attributes } = action.payload;
      if (
        state.altaners[state.current].id !== altaner_id ||
        state.altaners[state.current].template?.id !== attributes?.template_id
      ) {
        return;
      }
      if (!state.altaners[state.current].template!.versions?.items) {
        state.altaners[state.current].template!.versions = {
          items: [],
        };
      }
      state.altaners[state.current].template!.versions!.items.push(attributes);
    },
    updateTemplateVersion(state, action: PayloadAction<{ altaner_id: string; ids: string[]; changes: Partial<AltanerTemplateVersion> }>) {
      if (!state.current || !state.altaners[state.current]?.template?.versions?.items) {
        return;
      }
      const { altaner_id, ids, changes } = action.payload;
      let numIds = ids.length;
      if (state.altaners[state.current].id !== altaner_id || !numIds) {
        return;
      }
      for (const i in state.altaners[state.current].template!.versions!.items) {
        const id = state.altaners[state.current].template!.versions!.items[i].id;
        if (ids.includes(id)) {
          state.altaners[state.current].template!.versions!.items[i] = {
            ...state.altaners[state.current].template!.versions!.items[i],
            ...changes,
          };
          numIds -= 1;
        }
        if (!numIds) {
          break;
        }
      }
    },
    deleteTemplateVersion(state, action: PayloadAction<{ altaner_id: string; ids: string[] }>) {
      if (!state.current || !state.altaners[state.current]?.template?.versions?.items) {
        return;
      }
      const { altaner_id, ids } = action.payload;
      if (state.altaners[state.current].id !== altaner_id || !ids.length) {
        return;
      }
      state.altaners[state.current].template!.versions!.items = state.altaners[
        state.current
      ].template!.versions!.items.filter((v) => !ids.includes(v.id));
    },
    addAltanerComponent(state, action: PayloadAction<{ altaner_id: string; attributes: AltanerComponent }>) {
      const { altaner_id, attributes } = action.payload;
      if (state.altaners[altaner_id]) {
        if (!state.altaners[altaner_id].components) {
          state.altaners[altaner_id].components = { items: [] };
        }
        state.altaners[altaner_id].components!.items.push(attributes);
      }
    },
    patchAltanerComponent(state, action: PayloadAction<{ altaner_id: string; ids: string[]; changes: Partial<AltanerComponent> }>) {
      const { altaner_id, ids, changes } = action.payload;
      if (state.altaners[altaner_id] && state.altaners[altaner_id].components) {
        const componentIndex = state.altaners[altaner_id].components!.items.findIndex(
          (c) => c.id === ids[0],
        );
        if (componentIndex !== -1) {
          const updatedComponent = {
            ...state.altaners[altaner_id].components!.items[componentIndex],
            ...changes,
          };
          state.altaners[altaner_id].components!.items[componentIndex] = updatedComponent;
        }
      }
    },
    deleteAltanerComponent(state, action: PayloadAction<{ altaner_id: string; ids: string[] }>) {
      const { altaner_id, ids } = action.payload;

      if (state.altaners[altaner_id] && state.altaners[altaner_id].components) {
        state.altaners[altaner_id].components!.items = state.altaners[
          altaner_id
        ].components!.items.filter((component) => !ids.includes(component.id));
      } else {
        console.warn('No components found for altaner_id:', altaner_id);
      }
    },
  },
});

export default slice.reducer;

// ==================== Action Exports ====================

export const {
  addAltaner,
  updateAltaner,
  deleteAltaner,
  deleteAltanerComponent,
  addAltanerComponent,
  patchAltanerComponent,
  clearCurrentAltaner,
  clearState: clearAltanerState,
  setAltanersList,
  setViewType,
  setDisplayMode,
  setDisplayModeForProject,
  loadDisplayModeForProject,
  setOperateMode,
  toggleOperateMode,
  addTemplate: addAltanerTemplate,
  updateTemplate: updateAltanerTemplate,
  deleteTemplate: deleteAltanerTemplate,
  addTemplateVersion: addAltanerTemplateVersion,
  updateTemplateVersion: updateAltanerTemplateVersion,
  deleteTemplateVersion: deleteAltanerTemplateVersion,
} = slice.actions;

// ==================== Thunks ====================

/**
 * Get altaner by ID
 */
export const getAltanerById = (altanerId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(slice.actions.startLoading());
  try {
    const altanerService = getAltanerService();
    const response = await altanerService.getById(altanerId);
    const altaner = response.altaner;
    
    if (!altaner?.id) {
      throw new Error(`altaner ${altanerId} is invalid`);
    }

    // Extract frontend URLs from the root of the response
    if (response.frontend_preview_url) {
      altaner.frontend_preview_url = response.frontend_preview_url;
    }
    if (response.frontend_live_url) {
      altaner.frontend_live_url = response.frontend_live_url;
    }

    const accountId = getState().general.account.id;
    if (altaner.account_id !== accountId) {
      let error = false;
      await dispatch(switchAccount({ accountId: altaner.account_id })).catch(() => {
        error = true;
      });
      if (error) {
        throw new Error('altaner does not belong to current account');
      }
    }
    
    batch(() => {
      dispatch(slice.actions.addAltaner(altaner));
      dispatch(slice.actions.setAltaner(altaner.id));
    });
    
    return altaner;
  } catch (e) {
    const error = e as Error;
    console.error(`error: could not get altaner: ${error.message}`);
    dispatch(slice.actions.hasError(error.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Create a new altaner
 */
export const createAltaner =
  (data: CreateAltanerData = {}, idea?: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const accountId = state.general.account?.id;
    const user = state.general.user;

    if (!accountId) throw new Error('undefined account');

    dispatch(slice.actions.startLoading());
    try {
      const altanerService = getAltanerService();
      const altaner = await altanerService.create(accountId, data, idea);

      if (!altaner || !altaner.id) {
        throw new Error('Invalid altaner response');
      }

      // Track project creation in analytics
      // Read idea metadata from localStorage if available
      let ideaMetadata: any = null;
      try {
        const storedMetadata = localStorage.getItem('altan_idea_metadata');
        if (storedMetadata) {
          ideaMetadata = JSON.parse(storedMetadata);
          // Only use metadata if it's recent (within last 5 minutes) and matches the idea ID
          const isRecent = Date.now() - (ideaMetadata.timestamp || 0) < 5 * 60 * 1000;
          const matchesIdea = !idea || ideaMetadata.idea_id === idea;
          if (!isRecent || !matchesIdea) {
            ideaMetadata = null;
          }
        }
      } catch (err) {
        console.error('Failed to parse idea metadata:', err);
      }

      // Track analytics with all available details
      const projectName = ideaMetadata?.project_name || data.name || altaner.name || 'New Project';
      const projectType = ideaMetadata?.project_type || 'direct';

      await analytics.createProject(projectName, projectType, {
        user_id: user?.id,
        user_email: user?.email,
        account_id: accountId,
        project_id: altaner.id,
        ...(ideaMetadata?.idea_id && { idea_id: ideaMetadata.idea_id }),
        ...(ideaMetadata?.has_attachments !== undefined && {
          has_attachments: ideaMetadata.has_attachments,
        }),
        ...(ideaMetadata?.attachment_count !== undefined && {
          attachment_count: ideaMetadata.attachment_count,
        }),
        ...(ideaMetadata?.template_id && { template_id: ideaMetadata.template_id }),
        ...(ideaMetadata?.template_name && { template_name: ideaMetadata.template_name }),
        ...(ideaMetadata?.github_url && { github_url: ideaMetadata.github_url }),
        ...(ideaMetadata?.github_branch && { github_branch: ideaMetadata.github_branch }),
      });

      // Clear idea metadata from localStorage after tracking
      if (ideaMetadata) {
        localStorage.removeItem('altan_idea_metadata');
      }

      return altaner;
    } catch (e) {
      const error = e as Error;
      console.error(`error: could not create altaner: ${error.message}`);
      dispatch(slice.actions.hasError(error.message));
      throw e;
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

/**
 * Update altaner by ID
 */
export const updateAltanerById = (altanerId: string, altanerData: UpdateAltanerData) => async (dispatch: AppDispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const altanerService = getAltanerService();
    const updatedAltaner = await altanerService.update(altanerId, altanerData);
    dispatch(slice.actions.updateAltaner({ id: altanerId, ...updatedAltaner }));
    return updatedAltaner;
  } catch (e) {
    const error = e as Error;
    dispatch(slice.actions.hasError(error.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Update altaner positions by ID
 */
export const updateAltanerPositionsById = (altanerId: string, data: any) => async (dispatch: AppDispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const altanerService = getAltanerService();
    const altaner = await altanerService.updatePositions(altanerId, data);
    return altaner;
  } catch (e) {
    const error = e as Error;
    console.error(`error: could not update altaner: ${error.message}`);
    dispatch(slice.actions.hasError(error.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Update altaner component by ID
 */
export const updateAltanerComponentById = (altanerComponentId: string, data: any) => async (dispatch: AppDispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const altanerService = getAltanerService();
    const component = await altanerService.updateComponentById(altanerComponentId, data);
    return component;
  } catch (e) {
    const error = e as Error;
    console.error(`error: could not update altaner component: ${error.message}`);
    dispatch(slice.actions.hasError(error.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Create altaner component
 */
export const createAltanerComponent = (altanerId: string, data: any) => async (dispatch: AppDispatch) => {
  console.log('creating altaner component', data);
  dispatch(slice.actions.startLoading());
  try {
    const altanerService = getAltanerService();
    const component = await altanerService.createComponent(altanerId, data);
    return component;
  } catch (e) {
    const error = e as Error;
    console.error(`error: could not create altaner component: ${error.message}`);
    dispatch(slice.actions.hasError(error.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Update altaner component
 */
export const updateAltanerComponent = (altanerId: string, altanerComponentId: string, data: any) => async (dispatch: AppDispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const altanerService = getAltanerService();
    const component = await altanerService.updateComponent(altanerId, altanerComponentId, data);
    return component;
  } catch (e) {
    const error = e as Error;
    console.error(`error: could not update altaner component: ${error.message}`);
    dispatch(slice.actions.hasError(error.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Delete altaner component by ID
 */
export const deleteAltanerComponentById = (altanerComponentId: string) => async (dispatch: AppDispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const altanerService = getAltanerService();
    await altanerService.deleteComponent(altanerComponentId);
  } catch (e) {
    const error = e as Error;
    console.error(`error: could not delete altaner component: ${error.message}`);
    dispatch(slice.actions.hasError(error.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Delete altaner by ID
 */
export const deleteAltanerById = (altanerId: string) => async (dispatch: AppDispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const altanerService = getAltanerService();
    await altanerService.delete(altanerId);
  } catch (e) {
    const error = e as Error;
    console.error(`error: could not delete altaner: ${error.message}`);
    dispatch(slice.actions.hasError(error.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

/**
 * Fetch altaners list using the service
 */
export const fetchAltanersList = async (accountId: string, limit = 10, offset = 0): Promise<any> => {
  const altanerService = getAltanerService();
  return await altanerService.getList({ account_id: accountId, limit, offset });
};

// ==================== Selectors ====================

const selectAltanerState = (state: RootState) => state.altaners;

const selectCurrentAltanerId = (state: RootState) => selectAltanerState(state).current;

const selectAltaners = (state: RootState) => selectAltanerState(state).altaners;

export const selectAltanersList = (state: RootState) => selectAltanerState(state).altanersList;

export const selectAltanersLoading = (state: RootState) => selectAltanerState(state).isLoading;

export const selectAltanersInitialized = (state: RootState) => selectAltanerState(state).initialized;

export const selectCurrentAltaner = (state: RootState): Altaner | undefined => {
  const currentId = selectCurrentAltanerId(state);
  return currentId ? selectAltaners(state)?.[currentId] : undefined;
};

export const selectViewType = (state: RootState) => selectAltanerState(state).viewType;

export const selectDisplayMode = (state: RootState) => selectAltanerState(state).displayMode;

export const selectOperateMode = (state: RootState) => selectAltanerState(state).operateMode;

export const selectAltanerTemplate = (state: RootState) => selectCurrentAltaner(state)?.template;

const selectAltanerComponents = (state: RootState) => selectCurrentAltaner(state)?.components?.items;

const selectAltanerVariables = (state: RootState) => selectCurrentAltaner(state)?.meta_data?.variables;

export const selectAltanerVariablesMap = createSelector(
  [selectAltanerVariables],
  (variables) =>
    variables?.reduce((acc: Record<string, unknown>, v) => {
      acc[v.name] = v.value;
      return acc;
    }, {}),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

const replacePlaceholders = (text: string, data: Record<string, unknown>): string =>
  text.replace(/{{\[\$\]\.([\w.]+?)}}/g, (match, path) => {
    const keys = path.split('.');
    let value: any = data;

    for (const key of keys) {
      if (value && Object.prototype.hasOwnProperty.call(value, key)) {
        value = value[key];
      } else {
        return match;
      }
    }
    return String(value);
  });

export const selectSortedAltanerComponents = createSelector(
  [selectAltanerComponents, selectAltanerVariablesMap],
  (components, variables) =>
    !components?.length
      ? null
      : [...components]
          .sort((a, b) => a.position - b.position)
          .reduce((acc: Record<string, AltanerComponent>, t) => {
            if (t.type === 'external_link' || t.type === 'iframe') {
              acc[t.id] = {
                ...t,
                params: {
                  ...t.params,
                  url: replacePlaceholders(t.params?.url ?? '', variables || {}),
                },
              };
            } else {
              acc[t.id] = t;
            }
            return acc;
          }, {}),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

