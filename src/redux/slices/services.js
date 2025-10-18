import { createSlice, createSelector } from '@reduxjs/toolkit';

import { optimai_cloud } from '../../utils/axios';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  // Services data per base
  services: {
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
  // Service details (with code) per service
  serviceDetails: {
    // [serviceName]: {
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
  name: 'services',
  initialState,
  reducers: {
    // Services reducers
    setServicesLoading(state, action) {
      const { baseId, loading } = action.payload;
      if (!state.services[baseId]) {
        state.services[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.services[baseId].loading = loading;
    },
    setServices(state, action) {
      const { baseId, services } = action.payload;
      if (!state.services[baseId]) {
        state.services[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.services[baseId].items = services;
      state.services[baseId].loading = false;
      state.services[baseId].error = null;
      state.services[baseId].lastFetched = Date.now();
    },
    setServicesError(state, action) {
      const { baseId, error } = action.payload;
      if (!state.services[baseId]) {
        state.services[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.services[baseId].error = error;
      state.services[baseId].loading = false;
    },
    addService(state, action) {
      const { baseId, service } = action.payload;
      if (!state.services[baseId]) {
        state.services[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.services[baseId].items.push(service);
    },
    updateService(state, action) {
      const { baseId, serviceName, changes } = action.payload;
      if (state.services[baseId]) {
        const index = state.services[baseId].items.findIndex((s) => s.name === serviceName);
        if (index !== -1) {
          state.services[baseId].items[index] = {
            ...state.services[baseId].items[index],
            ...changes,
          };
        }
      }
    },
    removeService(state, action) {
      const { baseId, serviceName } = action.payload;
      if (state.services[baseId]) {
        state.services[baseId].items = state.services[baseId].items.filter(
          (s) => s.name !== serviceName,
        );
      }
    },
    clearServices(state, action) {
      const { baseId } = action.payload;
      if (baseId) {
        delete state.services[baseId];
      } else {
        state.services = {};
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

    // Service details reducers
    setServiceDetailsLoading(state, action) {
      const { serviceName, loading } = action.payload;
      if (!state.serviceDetails[serviceName]) {
        state.serviceDetails[serviceName] = {
          data: null,
          loading: false,
          error: null,
          lastFetched: null,
        };
      }
      state.serviceDetails[serviceName].loading = loading;
    },
    setServiceDetails(state, action) {
      const { serviceName, data } = action.payload;
      state.serviceDetails[serviceName] = {
        data,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      };
    },
    setServiceDetailsError(state, action) {
      const { serviceName, error } = action.payload;
      if (!state.serviceDetails[serviceName]) {
        state.serviceDetails[serviceName] = {
          data: null,
          loading: false,
          error: null,
          lastFetched: null,
        };
      }
      state.serviceDetails[serviceName].error = error;
      state.serviceDetails[serviceName].loading = false;
    },
    clearServiceDetails(state, action) {
      const { serviceName } = action.payload;
      if (serviceName) {
        delete state.serviceDetails[serviceName];
      } else {
        state.serviceDetails = {};
      }
    },
  },
});

export default slice.reducer;

// Export actions
export const {
  setServicesLoading,
  setServices,
  setServicesError,
  addService,
  updateService,
  removeService,
  clearServices,
  setSecretsLoading,
  setSecrets,
  setSecretsError,
  addSecret,
  removeSecret,
  setServiceDetailsLoading,
  setServiceDetails,
  setServiceDetailsError,
  clearServiceDetails,
} = slice.actions;

// ============================================================================
// THUNKS
// ============================================================================

/**
 * Fetch all services for a base
 */
export const fetchServices = (baseId) => async (dispatch) => {
  dispatch(setServicesLoading({ baseId, loading: true }));
  try {
    const response = await optimai_cloud.get(`/v1/instances/${baseId}/services/services`);
    const services = response.data?.services || response.data || [];
    dispatch(setServices({ baseId, services }));
    return services;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to fetch services';
    dispatch(setServicesError({ baseId, error: errorMessage }));
    throw error;
  }
};

/**
 * Fetch service details (including code)
 */
export const fetchServiceDetails = (baseId, serviceName) => async (dispatch) => {
  dispatch(setServiceDetailsLoading({ serviceName, loading: true }));
  try {
    const response = await optimai_cloud.get(
      `/v1/instances/${baseId}/services/services/${serviceName}`
    );
    const serviceData = response.data;
    dispatch(setServiceDetails({ serviceName, data: serviceData }));
    return serviceData;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to fetch service details';
    dispatch(setServiceDetailsError({ serviceName, error: errorMessage }));
    throw error;
  }
};

/**
 * Create a new service
 */
export const createService = (baseId, serviceData) => async (dispatch) => {
  try {
    const response = await optimai_cloud.post(
      `/v1/instances/${baseId}/services/services`,
      serviceData
    );
    const newService = response.data;

    // Fetch updated service list
    await dispatch(fetchServices(baseId));

    return newService;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to create service';
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing service
 */
export const updateServiceThunk = (baseId, serviceName, updates) => async (dispatch) => {
  try {
    const response = await optimai_cloud.patch(`/v1/instances/${baseId}/services/services`, {
      name: serviceName,
      ...updates,
    });

    // Fetch updated service list
    await dispatch(fetchServices(baseId));

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to update service';
    throw new Error(errorMessage);
  }
};

/**
 * Delete a service
 */
export const deleteService = (baseId, serviceName) => async (dispatch) => {
  try {
    await optimai_cloud.delete(`/v1/instances/${baseId}/services/services/${serviceName}`);
    dispatch(removeService({ baseId, serviceName }));
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
    const response = await optimai_cloud.get(`/v1/instances/${baseId}/services/secrets`);
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
    const response = await optimai_cloud.post(
      `/v1/instances/${baseId}/services/secrets`,
      secretData
    );
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
    await optimai_cloud.delete(`/v1/instances/${baseId}/services/secrets/${secretKey}`);
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

export const selectServicesState = (state) => state.services;

export const selectServicesForBase = createSelector(
  [selectServicesState, (_, baseId) => baseId],
  (servicesState, baseId) =>
    servicesState.services[baseId] || {
      items: [],
      loading: false,
      error: null,
      lastFetched: null,
    }
);

export const selectSecretsForBase = createSelector(
  [selectServicesState, (_, baseId) => baseId],
  (servicesState, baseId) =>
    servicesState.secrets[baseId] || { items: [], loading: false, error: null, lastFetched: null }
);

export const selectServiceDetails = createSelector(
  [selectServicesState, (_, serviceName) => serviceName],
  (servicesState, serviceName) =>
    servicesState.serviceDetails[serviceName] || {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    }
);

// Backward compatibility exports (keep old function names for gradual migration)
export const fetchFunctions = fetchServices;
export const fetchFunctionDetails = fetchServiceDetails;
export const createFunction = createService;
export const updateFunctionThunk = updateServiceThunk;
export const deleteFunction = deleteService;
export const selectFunctionsState = selectServicesState;
export const selectFunctionsForBase = selectServicesForBase;
export const selectFunctionDetails = selectServiceDetails;

