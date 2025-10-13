import { createSlice, createSelector } from '@reduxjs/toolkit';

import { optimai_cloud } from '../../utils/axios';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  // Functions data per base
  functions: {
    // [baseId]: {
    //   items: [],
    //   loading: false,
    //   error: null,
    //   lastFetched: null
    // }
  },
  // Secrets data per base
  secrets: {
    // [baseId]: {
    //   items: [],
    //   loading: false,
    //   error: null,
    //   lastFetched: null
    // }
  },
  // Execution results per function
  executionResults: {
    // [functionName]: {
    //   result: null,
    //   loading: false,
    //   error: null,
    //   timestamp: null
    // }
  },
  // Version data per function
  versions: {
    // [functionName]: {
    //   items: [],
    //   loading: false,
    //   error: null
    // }
  },
};

// ============================================================================
// SLICE
// ============================================================================

const slice = createSlice({
  name: 'functions',
  initialState,
  reducers: {
    // Functions reducers
    setFunctionsLoading(state, action) {
      const { baseId, loading } = action.payload;
      if (!state.functions[baseId]) {
        state.functions[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.functions[baseId].loading = loading;
    },
    setFunctions(state, action) {
      const { baseId, functions } = action.payload;
      if (!state.functions[baseId]) {
        state.functions[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.functions[baseId].items = functions;
      state.functions[baseId].loading = false;
      state.functions[baseId].error = null;
      state.functions[baseId].lastFetched = Date.now();
    },
    setFunctionsError(state, action) {
      const { baseId, error } = action.payload;
      if (!state.functions[baseId]) {
        state.functions[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.functions[baseId].error = error;
      state.functions[baseId].loading = false;
    },
    addFunction(state, action) {
      const { baseId, functionItem } = action.payload;
      if (!state.functions[baseId]) {
        state.functions[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.functions[baseId].items.push(functionItem);
    },
    updateFunction(state, action) {
      const { baseId, functionName, changes } = action.payload;
      if (state.functions[baseId]) {
        const index = state.functions[baseId].items.findIndex((f) => f.name === functionName);
        if (index !== -1) {
          state.functions[baseId].items[index] = {
            ...state.functions[baseId].items[index],
            ...changes,
          };
        }
      }
    },
    removeFunction(state, action) {
      const { baseId, functionName } = action.payload;
      if (state.functions[baseId]) {
        state.functions[baseId].items = state.functions[baseId].items.filter(
          (f) => f.name !== functionName,
        );
      }
    },
    clearFunctions(state, action) {
      const { baseId } = action.payload;
      if (baseId) {
        delete state.functions[baseId];
      } else {
        state.functions = {};
      }
    },

    // Secrets reducers
    setSecretsLoading(state, action) {
      const { baseId, loading } = action.payload;
      if (!state.secrets[baseId]) {
        state.secrets[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.secrets[baseId].loading = loading;
    },
    setSecrets(state, action) {
      const { baseId, secrets } = action.payload;
      if (!state.secrets[baseId]) {
        state.secrets[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.secrets[baseId].items = secrets;
      state.secrets[baseId].loading = false;
      state.secrets[baseId].error = null;
      state.secrets[baseId].lastFetched = Date.now();
    },
    setSecretsError(state, action) {
      const { baseId, error } = action.payload;
      if (!state.secrets[baseId]) {
        state.secrets[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.secrets[baseId].error = error;
      state.secrets[baseId].loading = false;
    },
    addSecret(state, action) {
      const { baseId, secret } = action.payload;
      if (!state.secrets[baseId]) {
        state.secrets[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      const index = state.secrets[baseId].items.findIndex((s) => s.key === secret.key);
      if (index !== -1) {
        state.secrets[baseId].items[index] = secret;
      } else {
        state.secrets[baseId].items.push(secret);
      }
    },
    removeSecret(state, action) {
      const { baseId, secretKey } = action.payload;
      if (state.secrets[baseId]) {
        state.secrets[baseId].items = state.secrets[baseId].items.filter(
          (s) => s.key !== secretKey,
        );
      }
    },

    // Execution results reducers
    setExecutionLoading(state, action) {
      const { functionName, loading } = action.payload;
      if (!state.executionResults[functionName]) {
        state.executionResults[functionName] = {
          result: null,
          loading: false,
          error: null,
          timestamp: null,
        };
      }
      state.executionResults[functionName].loading = loading;
    },
    setExecutionResult(state, action) {
      const { functionName, result } = action.payload;
      state.executionResults[functionName] = {
        result,
        loading: false,
        error: null,
        timestamp: Date.now(),
      };
    },
    setExecutionError(state, action) {
      const { functionName, error } = action.payload;
      if (!state.executionResults[functionName]) {
        state.executionResults[functionName] = {
          result: null,
          loading: false,
          error: null,
          timestamp: null,
        };
      }
      state.executionResults[functionName].error = error;
      state.executionResults[functionName].loading = false;
      state.executionResults[functionName].timestamp = Date.now();
    },
    clearExecutionResult(state, action) {
      const { functionName } = action.payload;
      delete state.executionResults[functionName];
    },

    // Versions reducers
    setVersionsLoading(state, action) {
      const { functionName, loading } = action.payload;
      if (!state.versions[functionName]) {
        state.versions[functionName] = { items: [], loading: false, error: null };
      }
      state.versions[functionName].loading = loading;
    },
    setVersions(state, action) {
      const { functionName, versions } = action.payload;
      state.versions[functionName] = {
        items: versions,
        loading: false,
        error: null,
      };
    },
    setVersionsError(state, action) {
      const { functionName, error } = action.payload;
      if (!state.versions[functionName]) {
        state.versions[functionName] = { items: [], loading: false, error: null };
      }
      state.versions[functionName].error = error;
      state.versions[functionName].loading = false;
    },
  },
});

export default slice.reducer;

// Export actions
export const {
  setFunctionsLoading,
  setFunctions,
  setFunctionsError,
  addFunction,
  updateFunction,
  removeFunction,
  clearFunctions,
  setSecretsLoading,
  setSecrets,
  setSecretsError,
  addSecret,
  removeSecret,
  setExecutionLoading,
  setExecutionResult,
  setExecutionError,
  clearExecutionResult,
  setVersionsLoading,
  setVersions,
  setVersionsError,
} = slice.actions;

// ============================================================================
// THUNKS
// ============================================================================

/**
 * Fetch all functions for a base
 */
export const fetchFunctions = (baseId) => async (dispatch) => {
  dispatch(setFunctionsLoading({ baseId, loading: true }));
  try {
    const response = await optimai_cloud.get(`/v1/instances/${baseId}/functions/functions`);
    const functions = response.data?.functions || response.data || [];
    dispatch(setFunctions({ baseId, functions }));
    return functions;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to fetch functions';
    dispatch(setFunctionsError({ baseId, error: errorMessage }));
    throw error;
  }
};

/**
 * Create a new function
 */
export const createFunction = (baseId, functionData) => async (dispatch) => {
  try {
    const response = await optimai_cloud.post(`/v1/instances/${baseId}/functions/functions`, functionData);
    const newFunction = response.data;

    // Fetch updated function list
    await dispatch(fetchFunctions(baseId));

    return newFunction;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to create function';
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing function
 */
export const updateFunctionThunk = (baseId, functionName, updates) => async (dispatch) => {
  try {
    const response = await optimai_cloud.patch(`/v1/instances/${baseId}/functions/functions`, {
      name: functionName,
      ...updates,
    });

    // Fetch updated function list
    await dispatch(fetchFunctions(baseId));

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to update function';
    throw new Error(errorMessage);
  }
};

/**
 * Delete a function
 */
export const deleteFunction = (baseId, functionName) => async (dispatch) => {
  try {
    await optimai_cloud.delete(`/v1/instances/${baseId}/functions/functions/${functionName}`);
    dispatch(removeFunction({ baseId, functionName }));
    return Promise.resolve();
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to delete function';
    throw new Error(errorMessage);
  }
};

/**
 * Execute a function
 */
export const executeFunction = (baseId, functionName, executeData = {}) => async (dispatch) => {
  dispatch(setExecutionLoading({ functionName, loading: true }));
  try {
    const response = await optimai_cloud.post(`/v1/instances/${baseId}/functions/functions/${functionName}`, executeData);
    dispatch(setExecutionResult({ functionName, result: response.data }));
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to execute function';
    dispatch(setExecutionError({ functionName, error: errorMessage }));
    throw error;
  }
};

/**
 * Fetch function versions
 */
export const fetchFunctionVersions = (baseId, functionName) => async (dispatch) => {
  dispatch(setVersionsLoading({ functionName, loading: true }));
  try {
    const response = await optimai_cloud.get(`/v1/instances/${baseId}/functions/functions/${functionName}/versions`);
    const versions = response.data || [];
    dispatch(setVersions({ functionName, versions }));
    return versions;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to fetch versions';
    dispatch(setVersionsError({ functionName, error: errorMessage }));
    throw error;
  }
};

/**
 * Change the latest version of a function
 */
export const changeLatestVersion = (baseId, functionName, functionId) => async (dispatch) => {
  try {
    await optimai_cloud.patch(`/v1/instances/${baseId}/functions/functions/${functionName}/latest_version`, null, {
      params: { function_id: functionId },
    });

    // Refresh function list
    await dispatch(fetchFunctions(baseId));

    // Refresh versions
    await dispatch(fetchFunctionVersions(baseId, functionName));

    return Promise.resolve();
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to change latest version';
    throw new Error(errorMessage);
  }
};

/**
 * Toggle function enabled state
 */
export const toggleFunctionEnabled = (baseId, functionName, enabled) => async (dispatch) => {
  try {
    await optimai_cloud.patch(`/v1/instances/${baseId}/functions/functions/${functionName}/enabled`, null, {
      params: { enabled },
    });

    dispatch(updateFunction({ baseId, functionName, changes: { enabled } }));
    return Promise.resolve();
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to toggle function state';
    throw new Error(errorMessage);
  }
};

/**
 * Fetch secrets for a base
 */
export const fetchSecrets = (baseId) => async (dispatch) => {
  dispatch(setSecretsLoading({ baseId, loading: true }));
  try {
    const response = await optimai_cloud.get(`/v1/instances/${baseId}/functions/secrets`);
    const secrets = response.data?.secrets || response.data || [];
    dispatch(setSecrets({ baseId, secrets }));
    return secrets;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch secrets';
    dispatch(setSecretsError({ baseId, error: errorMessage }));
    throw error;
  }
};

/**
 * Create or update a secret
 */
export const createOrUpdateSecret = (baseId, secretData) => async (dispatch) => {
  try {
    const response = await optimai_cloud.post(`/v1/instances/${baseId}/functions/secrets`, secretData);
    const secret = response.data;
    dispatch(addSecret({ baseId, secret }));
    return secret;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message || 'Failed to save secret';
    throw new Error(errorMessage);
  }
};

/**
 * Delete a secret
 */
export const deleteSecret = (baseId, secretKey) => async (dispatch) => {
  try {
    await optimai_cloud.delete(`/v1/instances/${baseId}/functions/secrets/${secretKey}`);
    dispatch(removeSecret({ baseId, secretKey }));
    return Promise.resolve();
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete secret';
    throw new Error(errorMessage);
  }
};

// ============================================================================
// SELECTORS
// ============================================================================

export const selectFunctionsState = (state) => state.functions;

export const selectFunctionsForBase = createSelector(
  [selectFunctionsState, (_, baseId) => baseId],
  (functionsState, baseId) =>
    functionsState.functions[baseId] || {
      items: [],
      loading: false,
      error: null,
      lastFetched: null,
    },
);

export const selectSecretsForBase = createSelector(
  [selectFunctionsState, (_, baseId) => baseId],
  (functionsState, baseId) =>
    functionsState.secrets[baseId] || { items: [], loading: false, error: null, lastFetched: null },
);

export const selectExecutionResult = createSelector(
  [selectFunctionsState, (_, functionName) => functionName],
  (functionsState, functionName) =>
    functionsState.executionResults[functionName] || {
      result: null,
      loading: false,
      error: null,
      timestamp: null,
    },
);

export const selectVersionsForFunction = createSelector(
  [selectFunctionsState, (_, functionName) => functionName],
  (functionsState, functionName) =>
    functionsState.versions[functionName] || { items: [], loading: false, error: null },
);

