import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { getCloudService } from '../../services';
import type { CloudService, CloudSecret, CreateServiceData, CreateSecretData } from '../../services';
import type { AppDispatch, RootState } from '../store';

// ============================================================================
// TYPES
// ============================================================================

interface ServiceState {
  items: CloudService[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

interface SecretState {
  items: CloudSecret[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

interface ServiceDetailsState {
  data: CloudService | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

interface ServicesSliceState {
  services: Record<string, ServiceState>;
  secrets: Record<string, SecretState>;
  serviceDetails: Record<string, ServiceDetailsState>;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: ServicesSliceState = {
  // Services data per base
  services: {},
  // Secrets data per base
  secrets: {},
  // Service details (with code) per service
  serviceDetails: {},
};

// ============================================================================
// SLICE
// ============================================================================

const slice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    // Services reducers
    setServicesLoading(state, action: PayloadAction<{ baseId: string; loading: boolean }>) {
      const { baseId, loading } = action.payload;
      if (!state.services[baseId]) {
        state.services[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.services[baseId].loading = loading;
    },
    setServices(state, action: PayloadAction<{ baseId: string; services: CloudService[] }>) {
      const { baseId, services } = action.payload;
      if (!state.services[baseId]) {
        state.services[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.services[baseId].items = services;
      state.services[baseId].loading = false;
      state.services[baseId].error = null;
      state.services[baseId].lastFetched = Date.now();
    },
    setServicesError(state, action: PayloadAction<{ baseId: string; error: string }>) {
      const { baseId, error } = action.payload;
      if (!state.services[baseId]) {
        state.services[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.services[baseId].error = error;
      state.services[baseId].loading = false;
    },
    addService(state, action: PayloadAction<{ baseId: string; service: CloudService }>) {
      const { baseId, service } = action.payload;
      if (!state.services[baseId]) {
        state.services[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.services[baseId].items.push(service);
    },
    updateService(
      state,
      action: PayloadAction<{ baseId: string; serviceName: string; changes: Partial<CloudService> }>,
    ) {
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
    removeService(state, action: PayloadAction<{ baseId: string; serviceName: string }>) {
      const { baseId, serviceName } = action.payload;
      if (state.services[baseId]) {
        state.services[baseId].items = state.services[baseId].items.filter(
          (s) => s.name !== serviceName,
        );
      }
    },
    clearServices(state, action: PayloadAction<{ baseId?: string }>) {
      const { baseId } = action.payload;
      if (baseId) {
        delete state.services[baseId];
      } else {
        state.services = {};
      }
    },

    // Secrets reducers
    setSecretsLoading(state, action: PayloadAction<{ baseId: string; loading: boolean }>) {
      const { baseId, loading } = action.payload;
      if (!state.secrets[baseId]) {
        state.secrets[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.secrets[baseId].loading = loading;
    },
    setSecrets(state, action: PayloadAction<{ baseId: string; secrets: CloudSecret[] }>) {
      const { baseId, secrets } = action.payload;
      if (!state.secrets[baseId]) {
        state.secrets[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.secrets[baseId].items = secrets;
      state.secrets[baseId].loading = false;
      state.secrets[baseId].error = null;
      state.secrets[baseId].lastFetched = Date.now();
    },
    setSecretsError(state, action: PayloadAction<{ baseId: string; error: string }>) {
      const { baseId, error } = action.payload;
      if (!state.secrets[baseId]) {
        state.secrets[baseId] = { items: [], loading: false, error: null, lastFetched: null };
      }
      state.secrets[baseId].error = error;
      state.secrets[baseId].loading = false;
    },
    addSecret(state, action: PayloadAction<{ baseId: string; secret: CloudSecret }>) {
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
    removeSecret(state, action: PayloadAction<{ baseId: string; secretKey: string }>) {
      const { baseId, secretKey } = action.payload;
      if (state.secrets[baseId]) {
        state.secrets[baseId].items = state.secrets[baseId].items.filter(
          (s) => s.key !== secretKey,
        );
      }
    },

    // Service details reducers
    setServiceDetailsLoading(state, action: PayloadAction<{ serviceName: string; loading: boolean }>) {
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
    setServiceDetails(state, action: PayloadAction<{ serviceName: string; data: CloudService }>) {
      const { serviceName, data } = action.payload;
      state.serviceDetails[serviceName] = {
        data,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      };
    },
    setServiceDetailsError(state, action: PayloadAction<{ serviceName: string; error: string }>) {
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
    clearServiceDetails(state, action: PayloadAction<{ serviceName?: string }>) {
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

const cloudService = getCloudService();

/**
 * Fetch all services for a base
 */
export const fetchServices = (baseId: string) => async (dispatch: AppDispatch) => {
  dispatch(setServicesLoading({ baseId, loading: true }));
  try {
    const services = await cloudService.fetchServices(baseId);
    dispatch(setServices({ baseId, services }));
    return services;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail || error.message || 'Failed to fetch services';
    dispatch(setServicesError({ baseId, error: errorMessage }));
    throw error;
  }
};

/**
 * Fetch service details (including code)
 */
export const fetchServiceDetails =
  (baseId: string, serviceName: string) => async (dispatch: AppDispatch) => {
    dispatch(setServiceDetailsLoading({ serviceName, loading: true }));
    try {
      const serviceData = await cloudService.fetchServiceDetails(baseId, serviceName);
      dispatch(setServiceDetails({ serviceName, data: serviceData }));
      return serviceData;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to fetch service details';
      dispatch(setServiceDetailsError({ serviceName, error: errorMessage }));
      throw error;
    }
  };

/**
 * Create a new service
 */
export const createService =
  (baseId: string, serviceData: CreateServiceData) => async (dispatch: AppDispatch) => {
    try {
      const newService = await cloudService.createService(baseId, serviceData);

      // Fetch updated service list
      await dispatch(fetchServices(baseId));

      return newService;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to create service';
      throw new Error(errorMessage);
    }
  };

/**
 * Update an existing service
 */
export const updateServiceThunk =
  (baseId: string, serviceName: string, updates: CreateServiceData) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await cloudService.updateService(baseId, serviceName, updates);

      // Fetch updated service list
      await dispatch(fetchServices(baseId));

      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to update service';
      throw new Error(errorMessage);
    }
  };

/**
 * Delete a service
 */
export const deleteService =
  (baseId: string, serviceName: string) => async (dispatch: AppDispatch) => {
    try {
      await cloudService.deleteService(baseId, serviceName);
      dispatch(removeService({ baseId, serviceName }));
      return Promise.resolve();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to delete service';
      throw new Error(errorMessage);
    }
  };

/**
 * Fetch secrets for a base
 */
export const fetchSecrets = (baseId: string) => async (dispatch: AppDispatch) => {
  dispatch(setSecretsLoading({ baseId, loading: true }));
  try {
    const secrets = await cloudService.fetchSecrets(baseId);
    dispatch(setSecrets({ baseId, secrets }));
    return secrets;
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch secrets';
    dispatch(setSecretsError({ baseId, error: errorMessage }));
    throw error;
  }
};

/**
 * Create or update a secret
 */
export const createOrUpdateSecret =
  (baseId: string, secretData: CreateSecretData) => async (dispatch: AppDispatch) => {
    try {
      const secret = await cloudService.createSecret(baseId, secretData);
      dispatch(addSecret({ baseId, secret }));
      return secret;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save secret';
      throw new Error(errorMessage);
    }
  };

/**
 * Delete a secret
 */
export const deleteSecret = (baseId: string, secretKey: string) => async (dispatch: AppDispatch) => {
  try {
    await cloudService.deleteSecret(baseId, secretKey);
    dispatch(removeSecret({ baseId, secretKey }));
    return Promise.resolve();
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete secret';
    throw new Error(errorMessage);
  }
};

// ============================================================================
// SELECTORS
// ============================================================================

export const selectServicesState = (state: RootState) => state.services;

export const selectServicesForBase = createSelector(
  [selectServicesState, (_: RootState, baseId: string) => baseId],
  (servicesState, baseId) =>
    servicesState.services[baseId] || {
      items: [],
      loading: false,
      error: null,
      lastFetched: null,
    },
);

export const selectSecretsForBase = createSelector(
  [selectServicesState, (_: RootState, baseId: string) => baseId],
  (servicesState, baseId) =>
    servicesState.secrets[baseId] || { items: [], loading: false, error: null, lastFetched: null },
);

export const selectServiceDetails = createSelector(
  [selectServicesState, (_: RootState, serviceName: string) => serviceName],
  (servicesState, serviceName) =>
    servicesState.serviceDetails[serviceName] || {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    },
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

