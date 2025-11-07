import { createSelector, createSlice } from '@reduxjs/toolkit';
import { batch } from 'react-redux';

import { switchAccount } from './general';
import { analytics } from '../../lib/analytics';
import { optimai } from '../../utils/axios';
import {
  getDisplayModeForProject,
  setDisplayModeForProject as saveDisplayModeToStorage,
} from '../../utils/displayModeStorage';
import { checkObjectsEqual } from '../helpers/memoize';

const initialState = {
  isLoading: false,
  error: null,
  initialized: false,
  altaners: {},
  altanersList: [], // List of altaners from account
  current: null,
  viewType: 'preview', // 'preview' or 'code'
  displayMode: 'both', // 'chat', 'preview', 'both'
};

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
    hasError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
    setAltanersList(state, action) {
      state.altanersList = action.payload;
      state.initialized = true;
    },
    addAltaner(state, action) {
      const altaner = action.payload;
      state.altaners[altaner.id] = altaner;
    },
    setAltaner(state, action) {
      state.current = action.payload;
    },
    clearCurrentAltaner(state) {
      state.current = null;
    },
    setViewType(state, action) {
      state.viewType = action.payload;
    },
    setDisplayMode(state, action) {
      state.displayMode = action.payload;
    },
    setDisplayModeForProject(state, action) {
      const { altanerId, displayMode } = action.payload;
      state.displayMode = displayMode;
      // Persist to localStorage
      saveDisplayModeToStorage(altanerId, displayMode);
    },
    loadDisplayModeForProject(state, action) {
      const altanerId = action.payload;
      const savedDisplayMode = getDisplayModeForProject(altanerId);
      if (savedDisplayMode) {
        state.displayMode = savedDisplayMode;
      } else {
        // Default to 'both' if no preference is saved
        state.displayMode = 'both';
      }
    },
    updateAltaner(state, action) {
      const { id, ...changes } = action.payload;
      state.altaners[id] = { ...(state.altaners[id] ?? {}), ...changes };
    },
    deleteAltaner(state, action) {
      const altanerId = action.payload;
      if (altanerId in state.altaners) {
        delete state.altaners[altanerId];
      }
    },
    // TEMPLATES
    addTemplate(state, action) {
      if (!state.altaners[state.current]) {
        return;
      }
      const { altaner_id, attributes } = action.payload;
      if (state.altaners[state.current].id !== altaner_id) {
        return;
      }
      state.altaners[state.current].template = attributes;
    },
    updateTemplate(state, action) {
      if (!state.altaners[state.current]) {
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
        ...(state.altaners[state.current].template || {}),
        ...changes,
      };
    },
    deleteTemplate(state, action) {
      if (!state.altaners[state.current]) {
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
    addTemplateVersion(state, action) {
      if (!state.altaners[state.current]?.template) {
        return;
      }
      const { altaner_id, attributes } = action.payload;
      if (
        state.altaners[state.current].id !== altaner_id ||
        state.altaners[state.current].template?.id !== attributes?.template_id
      ) {
        return;
      }
      if (!state.altaners[state.current].template.versions?.items) {
        state.altaners[state.current].template.versions = {
          items: [],
        };
      }
      state.altaners[state.current].template.versions.items.push(attributes);
    },
    updateTemplateVersion(state, action) {
      if (!state.altaners[state.current]?.template?.versions?.items) {
        return;
      }
      const { altaner_id, ids, changes } = action.payload;
      let numIds = ids.length;
      if (state.altaners[state.current].id !== altaner_id || !numIds) {
        return;
      }
      for (const i in state.altaners[state.current].template.versions.items) {
        const id = state.altaners[state.current].template.versions.items[i].id;
        if (ids.includes(id)) {
          state.altaners[state.current].template.versions.items[i] = {
            ...state.altaners[state.current].template.versions.items[i],
            ...changes,
          };
          numIds -= 1;
        }
        if (!numIds) {
          break;
        }
      }
    },
    deleteTemplateVersion(state, action) {
      if (!state.altaners[state.current]?.template?.versions?.items) {
        return;
      }
      const { altaner_id, ids } = action.payload;
      if (state.altaners[state.current].id !== altaner_id || !ids.length) {
        return;
      }
      state.altaners[state.current].template.versions.items = state.altaners[
        state.current
      ].template.versions.items.filter((v) => !ids.includes(v.id));
    },
    addAltanerComponent(state, action) {
      const { altaner_id, attributes } = action.payload;
      if (state.altaners[altaner_id]) {
        if (!state.altaners[altaner_id].components) {
          state.altaners[altaner_id].components = { items: [] };
        }
        state.altaners[altaner_id].components.items.push(attributes);

        // Update current if the component is under current
        if (state.current && state.current.id === altaner_id) {
          state.current.components.items.push(attributes);
        }
      }
    },
    patchAltanerComponent(state, action) {
      const { altaner_id, ids, changes } = action.payload;
      if (state.altaners[altaner_id] && state.altaners[altaner_id].components) {
        const componentIndex = state.altaners[altaner_id].components.items.findIndex(
          (c) => c.id === ids[0],
        );
        if (componentIndex !== -1) {
          const updatedComponent = {
            ...state.altaners[altaner_id].components.items[componentIndex],
            ...changes,
          };
          state.altaners[altaner_id].components.items[componentIndex] = updatedComponent;

          // Update current if the component is under current
          if (state.current && state.current.id === altaner_id) {
            const currentComponentIndex = state.current.components.items.findIndex(
              (c) => c.id === ids[0],
            );
            if (currentComponentIndex !== -1) {
              state.current.components.items[currentComponentIndex] = updatedComponent;
            }
          }
        }
      }
    },
    deleteAltanerComponent(state, action) {
      const { altaner_id, ids } = action.payload;

      if (state.altaners[altaner_id] && state.altaners[altaner_id].components) {
        state.altaners[altaner_id].components.items = state.altaners[
          altaner_id
        ].components.items.filter((component) => !ids.includes(component.id));

        // Update current if the component is under current
        if (state.current && state.current.id === altaner_id) {
          state.current.components.items = state.current.components.items.filter(
            (component) => !ids.includes(component.id),
          );
        }
      } else {
        console.warn('No components found for altaner_id:', altaner_id);
      }
    },
  },
});

export default slice.reducer;

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
  // TEMPLATES
  addTemplate: addAltanerTemplate,
  updateTemplate: updateAltanerTemplate,
  deleteTemplate: deleteAltanerTemplate,
  addTemplateVersion: addAltanerTemplateVersion,
  updateTemplateVersion: updateAltanerTemplateVersion,
  deleteTemplateVersion: deleteAltanerTemplateVersion,
} = slice.actions;

export const getAltanerById = (altanerId) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai.get(`/altaner/${altanerId}`);
    const altaner = response.data.altaner;
    if (!altaner?.id) {
      throw new Error(`altaner ${altanerId} is invalid`);
    }
    const accountId = getState().general.account.id;
    if (altaner.account_id !== accountId) {
      let error = false;
      dispatch(switchAccount({ accountId: altaner.account_id })).catch(() => {
        error = true;
      });
      if (error) {
        return Promise.reject('flow does not belong to current account');
      }
    }
    batch(() => {
      dispatch(slice.actions.addAltaner(altaner));
      dispatch(slice.actions.setAltaner(altaner.id));
    });
    return Promise.resolve(altaner);
  } catch (e) {
    console.error(`error: could not get altaner: ${e.message}`);
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const createAltaner =
  (data = {}, idea) =>
  async (dispatch, getState) => {
    const state = getState();
    const accountId = state.general.account?.id;
    const user = state.general.user;

    if (!accountId) throw new Error('undefined account');

    dispatch(slice.actions.startLoading());
    try {
      let url = `/account/v3/${accountId}/project`;
      if (idea) {
        url += `?idea=${encodeURIComponent(idea)}`;
      }
      const response = await optimai.post(url, data);
      const altaner = response.data;

      if (!altaner || !altaner.id) {
        throw new Error('Invalid altaner response');
      }

      // Track project creation in analytics
      // Read idea metadata from localStorage if available
      let ideaMetadata = null;
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
      console.error(`error: could not create altaner: ${e.message}`);
      dispatch(slice.actions.hasError(e.message));
      throw e;
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

export const updateAltanerById = (altanerId, altanerData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai.patch(`/altaner/${altanerId}`, altanerData);
    dispatch(slice.actions.updateAltaner(response.data));
    return Promise.resolve(response.data);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const updateAltanerPositionsById = (altanerId, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai.patch(`/altaner/${altanerId}/positions`, data);
    const { altaner } = response.data;
    return altaner;
  } catch (e) {
    console.error(`error: could not update altaner: ${e.message}`);
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const updateAltanerComponentById = (altanerComponentId, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai.patch(`/altaner/components/${altanerComponentId}`, data);
    const { component } = response.data;
    return component;
  } catch (e) {
    console.error(`error: could not update altaner: ${e.message}`);
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const createAltanerComponent = (altanerId, data) => async (dispatch) => {
  console.log('creating altaner component', data);
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai.post(`/altaner/${altanerId}/component`, data);
    const { component } = response.data;
    return component;
  } catch (e) {
    console.error(`error: could not update altaner: ${e.message}`);
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const updateAltanerComponent = (altanerId, altanerComponentId, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai.patch(
      `/altaner/${altanerId}/component/${altanerComponentId}`,
      data,
    );
    const { component } = response.data;
    return component;
  } catch (e) {
    console.error(`error: could not update altaner: ${e.message}`);
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const deleteAltanerComponentById = (altanerComponentId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await optimai.delete(`/altaner/components/${altanerComponentId}`);
  } catch (e) {
    console.error(`error: could not delete altaner component: ${e.message}`);
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const deleteAltanerById = (altanerId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await optimai.delete(`/altaner/${altanerId}`);
  } catch (e) {
    console.error(`error: could not delete altaner: ${e.message}`);
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const duplicateAltaner = (altanerId, duplicateData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai.post(`/altaner/${altanerId}/duplicate`, duplicateData);
    dispatch(slice.actions.addAltaner(response.data));
    return Promise.resolve(response.data);
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

// Custom fetcher for altaners using the new paginated endpoint
export const fetchAltanersList = async (accountId, limit = 100, offset = 0) => {
  const response = await optimai.get('/altaner/list', {
    params: {
      account_id: accountId,
      limit,
      offset,
    },
  });
  return response.data;
};

// Load altaners list for account
export const loadAltanersList = (accountId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const data = await fetchAltanersList(accountId, 100, 0);
    dispatch(setAltanersList(data.altaners || []));
    return Promise.resolve(data.altaners);
  } catch (e) {
    console.error('error: could not load altaners list:', e);
    dispatch(slice.actions.hasError(e.message));
    return Promise.reject(e);
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

const selectAltanerState = (state) => state.altaners;

const selectCurrentAltanerId = (state) => selectAltanerState(state).current;

const selectAltaners = (state) => selectAltanerState(state).altaners;

export const selectAltanersList = (state) => selectAltanerState(state).altanersList;

export const selectAltanersLoading = (state) => selectAltanerState(state).isLoading;

export const selectAltanersInitialized = (state) => selectAltanerState(state).initialized;

export const selectCurrentAltaner = (state) =>
  selectAltaners(state)?.[selectCurrentAltanerId(state)];

export const selectViewType = (state) => selectAltanerState(state).viewType;

export const selectDisplayMode = (state) => selectAltanerState(state).displayMode;

export const selectAltanerTemplate = (state) => selectCurrentAltaner(state)?.template;

const selectAltanerComponents = (state) => selectCurrentAltaner(state)?.components?.items;

const selectAltanerVariables = (state) => selectCurrentAltaner(state)?.meta_data?.variables;

export const selectAltanerVariablesMap = createSelector(
  [selectAltanerVariables],
  (variables) =>
    variables?.reduce((acc, v) => {
      acc[v.name] = v.value;
      return acc;
    }, {}),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

const replacePlaceholders = (text, data) =>
  text.replace(/{{\[\$\]\.([\w.]+?)}}/g, (match, path) => {
    const keys = path.split('.');
    let value = data;

    for (const key of keys) {
      if (value && Object.prototype.hasOwnProperty.call(value, key)) {
        value = value[key];
      } else {
        // If the key is not found, return the original placeholder
        return match;
      }
    }
    // Return the resolved value
    return String(value);
  });

export const selectSortedAltanerComponents = createSelector(
  [selectAltanerComponents, selectAltanerVariablesMap],
  (components, variables) =>
    !components?.length
      ? null
      : [...components]
          .sort((a, b) => a.position - b.position)
          .reduce((acc, t) => {
            // TODO: allow variables in other components
            if (t.type === 'external_link' || t.type === 'iframe') {
              acc[t.id] = {
                ...t,
                params: {
                  ...t.params,
                  url: replacePlaceholders(t.params?.url ?? '', variables),
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
