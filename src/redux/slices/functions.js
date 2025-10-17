import { createSlice, createSelector } from '@reduxjs/toolkit';

import { optimai_cloud } from '../../utils/axios';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  // Functions/Services data per base
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
  // Function details (with code) per function
  functionDetails: {
    // [functionName]: {
    //   data: null,
    //   loading: false,
    //   error: null,
    //   lastFetched: null
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

    // Function details reducers
    setFunctionDetailsLoading(state, action) {
      const { functionName, loading } = action.payload;
      if (!state.functionDetails[functionName]) {
        state.functionDetails[functionName] = {
          data: null,
          loading: false,
          error: null,
          lastFetched: null,
        };
      }
      state.functionDetails[functionName].loading = loading;
    },
    setFunctionDetails(state, action) {
      const { functionName, data } = action.payload;
      state.functionDetails[functionName] = {
        data,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      };
    },
    setFunctionDetailsError(state, action) {
      const { functionName, error } = action.payload;
      if (!state.functionDetails[functionName]) {
        state.functionDetails[functionName] = {
          data: null,
          loading: false,
          error: null,
          lastFetched: null,
        };
      }
      state.functionDetails[functionName].error = error;
      state.functionDetails[functionName].loading = false;
    },
    clearFunctionDetails(state, action) {
      const { functionName } = action.payload;
      if (functionName) {
        delete state.functionDetails[functionName];
      } else {
        state.functionDetails = {};
      }
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
  setFunctionDetailsLoading,
  setFunctionDetails,
  setFunctionDetailsError,
  clearFunctionDetails,
} = slice.actions;

// ============================================================================
// THUNKS
// ============================================================================

/**
 * Fetch all services/routers for a base
 */
export const fetchFunctions = (baseId) => async (dispatch) => {
  dispatch(setFunctionsLoading({ baseId, loading: true }));
  try {
    const response = await optimai_cloud.get(`/v1/instances/${baseId}/functions/functions`);
    // New API returns {count, routers: [...]}
    const functions = response.data?.routers || response.data?.functions || response.data || [];
    dispatch(setFunctions({ baseId, functions }));
    return functions;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to fetch services';
    dispatch(setFunctionsError({ baseId, error: errorMessage }));
    throw error;
  }
};

/**
 * Fetch service/router details (including code)
 */
export const fetchFunctionDetails = (baseId, functionName) => async (dispatch) => {
  dispatch(setFunctionDetailsLoading({ functionName, loading: true }));
  try {
    const response = await optimai_cloud.get(`/v1/instances/${baseId}/functions/functions/${functionName}`);
    const functionData = response.data;
    dispatch(setFunctionDetails({ functionName, data: functionData }));
    return functionData;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to fetch service details';
    dispatch(setFunctionDetailsError({ functionName, error: errorMessage }));
    throw error;
  }
};

/**
 * Create a new service/router
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
      error.response?.data?.detail || error.message || 'Failed to create service';
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing service/router
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
      error.response?.data?.detail || error.message || 'Failed to update service';
    throw new Error(errorMessage);
  }
};

/**
 * Delete a service/router
 */
export const deleteFunction = (baseId, functionName) => async (dispatch) => {
  try {
    await optimai_cloud.delete(`/v1/instances/${baseId}/functions/functions/${functionName}`);
    dispatch(removeFunction({ baseId, functionName }));
    return Promise.resolve();
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to delete service';
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

export const selectFunctionDetails = createSelector(
  [selectFunctionsState, (_, functionName) => functionName],
  (functionsState, functionName) =>
    functionsState.functionDetails[functionName] || {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    },
);

