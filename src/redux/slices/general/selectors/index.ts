/**
 * General Selectors
 * Selectors for accessing general state
 */
import { createSelector } from '@reduxjs/toolkit';

import { checkArraysEqualsProperties, checkObjectsEqual } from '../../../helpers/memoize';
import type {
  RootState,
  GeneralState,
  Account,
  User,
  Subscription,
  Agent,
  CustomApp,
  Interface,
  InterfaceCommit,
} from '../types/state';

// ============================================================================
// Base Selectors
// ============================================================================

const selectGeneralState = (state: RootState): GeneralState => state.general;

export const selectUser = (state: RootState): User | null => selectGeneralState(state).user;

export const selectGlobalVars = (state: RootState) => selectGeneralState(state).globalVars;

export const selectHeaderVisible = (state: RootState): boolean => selectGeneralState(state).headerVisible;

export const selectAccount = (state: RootState): Account => selectGeneralState(state).account;

export const selectAccountId = (state: RootState): string | undefined => selectGeneralState(state).account?.id;

export const selectAccountCreditBalance = (state: RootState): number | undefined =>
  selectGeneralState(state).account?.credit_balance;

export const selectAccountAssetsInitialized = (key: string) => (state: RootState): boolean =>
  (selectGeneralState(state).accountAssetsInitialized as any)[key];

export const selectAccountAssetsLoading = (key: string) => (state: RootState): boolean =>
  (selectGeneralState(state).accountAssetsLoading as any)[key];

export const selectGeneralInitialized = (key: string) => (state: RootState): boolean =>
  (selectGeneralState(state).generalInitialized as any)[key];

export const selectGeneralLoading = (key: string) => (state: RootState): boolean =>
  (selectGeneralState(state).generalLoading as any)[key];

export const selectRoles = (state: RootState) => selectGeneralState(state).roles;

export const selectAccounts = (state: RootState): Account[] => selectGeneralState(state).accounts;

export const selectAccountRooms = (state: RootState) => selectAccount(state).rooms || [];

export const selectAccountConnections = (state: RootState) => selectAccount(state).connections || [];

// ============================================================================
// Subscription Selectors
// ============================================================================

export const selectAccountSubscriptions = (state: RootState): Subscription[] => {
  const subscriptions = selectAccount(state)?.subscriptions;
  return Array.isArray(subscriptions) ? subscriptions : [];
};

// Free plan ID constant
const FREE_PLAN_ID = 'a13e9a2b-f4c7-485c-8394-64e46bc7bf11';

export const selectIsAccountFree = createSelector(
  [selectAccountSubscriptions],
  (subscriptions): boolean => {
    if (!subscriptions || subscriptions.length === 0) {
      return true;
    }

    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing'
    );

    if (!activeSubscription) {
      return true;
    }

    const billingOptionId = activeSubscription?.billing_option_id;
    return billingOptionId === FREE_PLAN_ID;
  },
  {
    memoizeOptions: {
      resultEqualityCheck: (a, b) => a === b,
    },
  }
);

export const selectHasGrowthSubscription = createSelector(
  [selectAccountSubscriptions],
  (subscriptions): boolean => {
    if (!subscriptions || subscriptions.length === 0) {
      return false;
    }

    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing'
    );

    if (!activeSubscription) {
      return false;
    }

    const planName = activeSubscription?.billing_option?.plan?.name;
    return !!(planName && planName.startsWith('Growth'));
  },
  {
    memoizeOptions: {
      resultEqualityCheck: (a, b) => a === b,
    },
  }
);

// ============================================================================
// Apps & Connection Types Selectors
// ============================================================================

export const selectCustomApps = (state: RootState): CustomApp[] => selectAccount(state).apps || [];

export const selectCustomConnectionTypes = createSelector(
  [selectCustomApps],
  (apps) => apps.flatMap((app) => app.connection_types?.items || []),
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  }
);

// ============================================================================
// Agent Selectors
// ============================================================================

export const selectSortedAgents = createSelector(
  [selectAccount],
  (account): Agent[] => {
    const agents = account?.agents;
    if (!agents) return [];
    return [...agents].sort((a, b) => a.name.localeCompare(b.name));
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  }
);

// ============================================================================
// Account Details Selector
// ============================================================================

export const selectAccountDetails = createSelector(
  [selectAccount],
  (account) =>
    account && account.id
      ? {
          id: account.id,
          name: account.name,
          logo_url: account?.logo_url,
          meta_data: account.meta_data,
        }
      : {},
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  }
);

// ============================================================================
// Navigation Selector
// ============================================================================

export const selectNav = createSelector(
  [selectAccount],
  (account) =>
    account.meta_data?.nav || ['view_flows', 'view_agents', 'view_bases', 'view_interfaces'],
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  }
);

// ============================================================================
// Tables Selector
// ============================================================================

export const selectTables = createSelector(
  [selectAccount],
  (account) => {
    if (!account || !Array.isArray(account.bases)) {
      console.warn('selectTables: account.bases is not available or not an array:', {
        account,
        bases: account?.bases,
      });
      return [];
    }

    return account.bases.flatMap((base) =>
      (base?.tables?.items || []).map((table) => ({
        details: { ...table, base_id: base.id },
        resource_type_id: 'table',
      }))
    );
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  }
);

// ============================================================================
// Rooms Selectors
// ============================================================================

export const selectRoomByExternalId = (externalId: string) =>
  createSelector(
    [selectAccount],
    (account) => account.rooms?.find((room) => room.external_id === externalId),
    {
      memoizeOptions: {
        resultEqualityCheck: checkObjectsEqual,
      },
    }
  );

export const selectRooms = createSelector(
  [selectAccount],
  (account) => {
    if (!account || !Array.isArray(account.rooms)) {
      console.warn('selectRooms: account.rooms is not available or not an array:', {
        account,
        rooms: account?.rooms,
      });
      return [];
    }

    return account.rooms.map((r) => ({ details: r, resource_type_id: 'room' }));
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  }
);

// ============================================================================
// Apps Selector
// ============================================================================

export const selectApps = createSelector(
  [selectAccount],
  (account) => {
    if (!account || !Array.isArray(account.apps)) {
      console.warn('selectApps: account.apps is not available or not an array:', {
        account,
        apps: account?.apps,
      });
      return [];
    }

    return account.apps.map((app) => ({
      details: {
        ...app,
        connection_types: app.connection_types?.items || [],
      },
      resource_type_id: 'app',
    }));
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  }
);

// ============================================================================
// Extended Resources Selector
// ============================================================================

export const selectExtendedResources = createSelector(
  [selectRooms, selectTables, selectAccountId, (_state: RootState, internal = false) => internal],
  (rooms, tables, accountId, internal) =>
    !internal
      ? []
      : [
          ...rooms,
          ...tables,
          { details: { id: accountId, name: 'This Workspace' }, resource_type_id: 'account' },
        ],
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  }
);

// ============================================================================
// Interface Selectors
// ============================================================================

const selectInterfaces = (state: RootState): Interface[] | undefined => selectAccount(state)?.interfaces;

export const makeSelectInterfaceById = () =>
  createSelector(
    [selectInterfaces, (_state: RootState, interfaceId: string) => interfaceId],
    (interfaces, interfaceId): Interface | null => 
      interfaces?.find((i) => i.id === interfaceId) || null
  );

export const makeSelectCurrentCommitSha = () =>
  createSelector(
    [makeSelectInterfaceById()],
    (ui): string | null => ui?.meta_data?.current_commit?.sha?.trim() || null
  );

export const makeSelectSortedCommits = () =>
  createSelector([makeSelectInterfaceById()], (ui): InterfaceCommit[] => {
    const commits = ui?.commits?.items || [];
    return [...commits].sort((a, b) => {
      const dateA = a.date_creation ? new Date(a.date_creation).getTime() : 0;
      const dateB = b.date_creation ? new Date(b.date_creation).getTime() : 0;
      return dateB - dateA;
    });
  });

// ============================================================================
// Workflow Execution Selectors
// ============================================================================

export const selectWorkflowExecutions = (workflowId: string) => (state: RootState) =>
  state.general.workflowExecutions[workflowId] || [];

export const selectWorkflowExecutionsInitialized = (state: RootState): boolean =>
  state.general.workflowExecutionsInitialized;

