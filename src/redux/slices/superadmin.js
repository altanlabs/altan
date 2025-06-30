import { createSlice } from '@reduxjs/toolkit';

import { selectAccountId } from './general';
import { optimai, optimai_galaxia } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  initialized: {
    accounts: false,
    subscriptions: false,
    apps: false,
  },
  isLoading: {
    accounts: false,
    subscriptions: false,
    apps: false,
  },
  error: {
    accounts: null,
    subscriptions: null,
    apps: null,
  },
  activeToken: null,
  activeAccount: null,
  accounts: [],
  subscriptions: [],
  apps: [],
};

const slice = createSlice({
  name: 'superadmin',
  initialState,
  reducers: {
    startLoading(state, action) {
      state.isLoading[action.payload] = true;
    },
    hasError(state, action) {
      const { error, mode } = action.payload;
      state.error[mode] = error;
    },
    setActiveToken(state, action) {
      const token = action.payload;
      state.activeToken = token;
    },
    setAccounts(state, action) {
      const accounts = action.payload;
      state.accounts = [...state.accounts, ...accounts];
      state.initialized.accounts = true;
      state.isLoading.accounts = false;
    },
    setSubscriptions(state, action) {
      const subscriptions = action.payload;
      state.subscriptions = [...state.subscriptions, ...subscriptions];
      state.initialized.subscriptions = true;
      state.isLoading.subscriptions = false;
    },
    setApps(state, action) {
      const apps = action.payload;
      state.apps = [...state.apps, ...apps];
      state.initialized.apps = true;
      state.isLoading.apps = false;
    },
    setActiveAccount(state, action) {
      state.activeAccount = action.payload;
    },
    setCreditBalanceForAccount(state, action) {
      const { accountId, subscriptionId, credits } = action.payload;
      const accountIndex = state.accounts.findIndex((a) => a.account.id === accountId);
      if (accountIndex === -1) return;
      const subscriptionIndex = state.accounts[accountIndex].account.subscriptions.findIndex(
        (s) => s.id === subscriptionId,
      );
      if (subscriptionIndex === -1) return;
      state.accounts[accountIndex].account.subscriptions[subscriptionIndex].credit_balance =
        credits;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setActiveAccount } = slice.actions;

// ----------------------------------------------------------------------

export const getAllAccounts = () => async (dispatch, getState) => {
  const { initialized, isLoading } = getState().superadmin;
  if (!!isLoading.accounts || !!initialized.accounts) return;
  dispatch(slice.actions.startLoading('accounts'));
  try {
    const response = await optimai.post('/utils/Account/multiple/gq', {
      '@fields': ['@base', 'name', 'logo_url'],
      organisation: {
        '@fields': ['@base', 'name'],
      },
      user: {
        '@fields': ['id', 'email', 'user_name'],
        person: {
          '@fields': ['nickname', 'first_name', 'last_name'],
        },
      },
    });
    const accounts = response.data.items;
    dispatch(slice.actions.setAccounts(accounts));
  } catch (e) {
    dispatch(slice.actions.hasError({ mode: 'accounts', error: e }));
    console.error(`error: could not get accounts: ${e}`);
  }
};

export const searchAccounts = ({ name, id, owner_email, limit = 50, offset = 0 }) => async (dispatch, getState) => {
  // Only search if at least one filter is provided
  if (!name && !id && !owner_email) {
    return [];
  }

  console.log('🚀 searchAccounts called with:', { name, id, owner_email, limit, offset });

  try {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (id) params.append('id', id);
    if (owner_email) params.append('owner_email', owner_email);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    console.log('🌐 API URL:', `/account/list?${params.toString()}`);

    const response = await optimai.get(`/account/list?${params.toString()}`);
    console.log('📡 Raw API response:', response.data);
    
    const accounts = response.data.accounts;
    console.log('📋 Accounts array:', accounts);
    
    // Transform the flat API response to match the expected nested structure
    const transformedAccounts = accounts.map(account => {
      console.log('🔄 Transforming account:', account);
      
      const transformed = {
        id: account.id,
        name: account.name || account.meta_data?.displayName || 'Unnamed Account',
        logo_url: account.logo_url,
        date_creation: account.date_creation,
        currency: account.currency,
        stripe_id: account.stripe_id,
        room_id: account.room_id,
        // Create nested organisation object
        organisation: account.organisation_id ? {
          id: account.organisation_id,
          name: account.organisation?.name || 'Unknown Organization',
          date_creation: account.organisation?.date_creation || account.date_creation
        } : null,
        // Create nested user object structure that AccountDetailRow expects
        // Handle case where API only returns user_id without nested user object
        user: {
          id: account.user_id,
          email: account.user?.email || 'Unknown Email',
          user_name: account.user?.user_name || account.user?.person?.nickname || '',
          person: {
            first_name: account.user?.person?.first_name || '',
            last_name: account.user?.person?.last_name || '',
            nickname: account.user?.person?.nickname || account.user?.user_name || ''
          }
        },
        // Keep original flat data for compatibility
        user_id: account.user_id,
        organisation_id: account.organisation_id,
        meta_data: account.meta_data || {}
      };
      
      console.log('✨ Transformed account:', transformed);
      return transformed;
    });
    
    console.log('🎉 Final transformed accounts:', transformedAccounts);
    return transformedAccounts;
  } catch (e) {
    console.error('💥 Search accounts error:', e);
    console.error(`error: could not search accounts: ${e}`);
    throw e; // Re-throw to let the component handle the error
  }
};

export const getAllApps = () => async (dispatch, getState) => {
  const { initialized, isLoading } = getState().superadmin;
  if (!!isLoading.apps || !!initialized.apps) return;
  try {
    const response = await optimai.get('/sv/apps');
    const { apps } = response.data;
    dispatch(slice.actions.setApps(apps));
  } catch (error) {
    dispatch(slice.actions.hasError({ mode: 'apps', error }));
    console.error('An error occurred while fetching data: ', error);
  }
};

export const getSuperAdminStats = () => async (dispatch, getState) => {
  try {
    const response = await optimai.post('/graph/subscription_plans/multiple', {
      '@fields': '@all',
      subscriptions: {
        '@fields': '@all',
        account: {
          '@fields': '@base',
        },
        '@filter': { status: { _eq: 'active' } },
      },
    });
    const { items } = response.data;
    console.log('Items', items);
    // dispatch(slice.actions.setApps(apps));
  } catch (error) {
    dispatch(slice.actions.hasError({ mode: 'stats', error }));
    console.error('An error occurred while fetching data: ', error);
  }
};

export const setCreditBalance =
  (accountId, subscriptionId, credits) => async (dispatch, getState) => {
    if (!accountId || !subscriptionId || !(credits === 0 || !!credits))
      return Promise.reject('Invalid credits or subscription.');
    try {
      const response = await optimai.patch(`/subscription/${subscriptionId}/balance`, { credits });
      const { subscription } = response.data;
      dispatch(
        slice.actions.setCreditBalanceForAccount({
          accountId,
          subscriptionId,
          credits: subscription.credits,
        }),
      );
      return Promise.resolve(subscription.credits);
    } catch (e) {
      return Promise.reject(e.message);
    }
  };

export const getTableSchema = (table) => async (dispatch, getState) => {
  try {
    const response = await optimai.get(`/utils/${table}/schema`);
    return Promise.resolve(response.data);
  } catch (e) {
    return Promise.reject(e.message);
  }
};

export const createEntry = (table, entry) => async (dispatch, getState) => {
  try {
    const response = await optimai.post(`/utils/${table}`, entry);
    console.log(response.data);
    return Promise.resolve(response.data);
  } catch (e) {
    return Promise.reject(e.message);
  }
};

export const getTable = (table, isSuperAdmin) => async (dispatch, getState) => {
  const state = getState();
  try {
    const accountId = selectAccountId(state);

    let url = `/utils/${table}`;
    if (!isSuperAdmin && accountId) {
      url += `?account_id=${accountId}`;
    }

    const response = await optimai.get(url);
    console.log('TABLE', response.data);
    return Promise.resolve(response.data);
  } catch (e) {
    return Promise.reject(e.message);
  }
};

export const getGalaxiaFlowStatus = (flowId) => async (dispatch, getState) => {
  try {
    const response = await optimai_galaxia.get(`/zeus/status/flow/${flowId}`);
    return Promise.resolve(response.data);
  } catch (e) {
    return Promise.reject(e.message);
  }
};

const toPascalCase = (str) =>
  str
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');

export const getEntry = async (tableName, entityId) => {
  const table = toPascalCase(tableName);
  try {
    const response = await optimai.get(`/utils/${table}/${entityId}`);
    console.log(response.data);
    return response.data.element;
  } catch (e) {
    console.error('Error fetching entity:', e.message);
    return Promise.reject(e.message);
  }
};

export const getEntity = async (columnName, entityId) => {
  // Remove '_id' to get the table name and convert it to PascalCase
  const table = toPascalCase(columnName.replace(/_id$/, ''));

  try {
    const response = await optimai.get(`/utils/${table}/${entityId}`);
    console.log(response.data);
    return response.data.element;
  } catch (e) {
    console.error('Error fetching entity:', e.message);
    return Promise.reject(e.message);
  }
};

export const deleteEntity = (table, entityId) => async (dispatch, getState) => {
  try {
    const response = await optimai.delete(`/utils/${table}/${entityId}`);
    return response.data;
  } catch (e) {
    return Promise.reject(e.message);
  }
};

export const updateEntry = (table, entityId, entry) => async (dispatch, getState) => {
  try {
    const response = await optimai.patch(`/utils/${table}/${entityId}`, entry);
    return Promise.resolve(response.data);
  } catch (e) {
    return Promise.reject(e.message);
  }
};

export const changeAccountOwner = (account_id, owner_id) => async (dispatch, getState) => {
  try {
    const response = await optimai.patch(`/account/${account_id}/owner/${owner_id}`);
    return Promise.resolve(response.data);
  } catch (e) {
    return Promise.reject(e.message);
  }
};

export const addUserToAccount = (account_id, new_user_id) => async (dispatch, getState) => {
  try {
    const response = await optimai.post(`/account/${account_id}/add/user/${new_user_id}`);
    return Promise.resolve(response.data);
  } catch (e) {
    return Promise.reject(e.message);
  }
};
