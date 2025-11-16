/**
 * General Thunks
 * Async operations for general state management
 */
import { batch } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store';
import {
  getAccountService,
  getUserService,
  getRoleService,
  getAgentService,
  getTemplateService,
  getMarketplaceService,
  getDeveloperAppService,
  getApiKeyService,
} from '../../../../services';
import { optimai } from '../../../../utils/axios';
import { analytics } from '../../../../lib/analytics';
import {
  setAccount,
  setFullAccountLoading,
  setFullAccountInitialized,
  startAccountAttributeLoading,
  stopAccountAttributeLoading,
  setAccountAttribute,
  setAccountAttributeError,
  setRoles,
  setRolesLoading,
  updateAccountMetadata,
  addAgent,
  patchAgent,
  deleteAgent as deleteAgentAction,
  setWebhookEvents,
  clearState as clearGeneralState,
  apiTokenCreated,
  apiTokenDeleted,
  addApp,
  deleteApp,
  updateConnectionTypeSuccess,
  addActionType,
  deleteActionType,
  addResourceType,
  deleteResourceType,
  addInterface,
  clearAgentsUsage,
} from '../slices/generalSlice';
import { clearAgentsState } from '../../agents';
import { clearAltanerState, setAltanersList, fetchAltanersList } from '../../altaners';
import { clearConnectionsState } from '../../connections';
import { clearFlowState } from '../../flows';
import { clearMediaState } from '../../media';
import { clearSpacesState, stopSpacesLoading } from '../../spaces';
import { selectAccount, selectAccounts } from '../selectors';

// ============================================================================
// Account Operations
// ============================================================================

const KEY_MAPPING: Record<string, string> = {
  subscriptions: 'subscriptions',
  apikeys: 'apikeys',
  agents: 'agents',
  connections: 'connections',
  workflows: 'workflows',
  webhooks: 'webhooks',
  altaners: 'altaners',
  organisation: 'organisation',
  owner: 'user',
  developer_apps: 'developer_apps',
  apps: 'apps',
  interfaces: 'interfaces',
};

const ACCOUNT_GQ: Record<string, any> = {
  '@fields': '@all',
  user: {
    '@fields': ['id', 'email', 'first_name', 'last_name', 'avatar_url'],
    owned_accounts: {
      '@fields': '@base@exc:meta_data',
    },
  },
  organisation: {
    '@fields': ['@base', 'name'],
  },
  subscriptions: {
    '@fields': '@all',
    billing_option: {
      '@fields': ['price', 'currency', 'billing_frequency', 'billing_cycle'],
      plan: {
        '@fields': '@all',
        group: {
          '@fields': ['name'],
        },
      },
    },
    '@filter': { status: { _in: ['active', 'trialing', 'paused'] } },
  },
  apikeys: {
    '@fields': ['@base@exc:meta_data', 'name'],
  },
  agents: {
    '@fields': [
      'id',
      'name',
      'date_creation',
      'avatar_url',
      'cloned_template_id',
      'is_pinned',
      'meta_data',
    ],
    cloned_from: {
      '@fields': ['id'],
      version: {
        '@fields': ['template_id'],
      },
    },
  },
  developer_apps: {
    '@fields': '@all',
  },
  workflows: {
    '@fields': ['id', 'name', 'date_creation'],
  },
  altaners: {
    '@fields': '@all',
    '@filter': { is_deleted: { _eq: false } },
    components: {
      '@fields': '@all',
    },
  },
  webhooks: {
    '@fields': ['id', 'name', 'date_creation', 'url'],
  },
  interfaces: {
    '@fields': '@all',
    deployments: {
      '@fields': '@all',
    },
    commits: {
      '@fields': ['commit_hash', 'message', 'date_creation'],
    },
  },
  connections: {
    '@fields': '@all',
    connection_type: {
      '@fields': ['id', 'name'],
    },
  },
  apps: {
    '@fields': '@all',
    connection_types: {
      '@fields': '@all',
      webhooks: {
        '@fields': '@all',
        event_types: {
          '@fields': '@all',
        },
      },
      actions: {
        '@fields': '@all',
      },
      resources: {
        '@fields': '@all',
      },
    },
  },
};

const FILTER_ACCOUNT_GQ = (keys: string[], accountFields = '@all') => {
  const adaptedKeys = keys.map((k) => KEY_MAPPING[k]);
  const finalAccObject: Record<string, any> = {
    '@fields': accountFields,
  };
  for (const [k, v] of Object.entries(ACCOUNT_GQ).filter(([k]) => adaptedKeys.includes(k))) {
    finalAccObject[k] = v;
  }
  return finalAccObject;
};

/**
 * Get specific account attributes
 */
export const getAccountAttribute =
  (selectedAccountId: string | null, keys: string[]) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!keys?.length) {
      return;
    }

    const state = getState();
    const accountAssetsLoading = state.general.accountAssetsLoading;
    const accountAssetsInitialized = state.general.accountAssetsInitialized;
    const filteredKeys = keys.filter(
      (k) => !(accountAssetsInitialized as any)[k] && !(accountAssetsLoading as any)[k]
    );

    if (!filteredKeys?.length) {
      return;
    }

    batch(() => {
      for (const k of keys) {
        dispatch(startAccountAttributeLoading(k));
      }
    });

    try {
      const accountService = getAccountService();
      const accountId = state.general.account?.id;
      const finalAccount = selectedAccountId || accountId;

      if (!finalAccount) {
        throw new Error('No account ID available');
      }

      // Use custom altaners endpoint if altaners is in the keys
      if (filteredKeys.includes('altaners')) {
        try {
          const altanersData = await fetchAltanersList(finalAccount, 100, 0);
          dispatch(setAltanersList(altanersData.altaners ?? []));

          const remainingKeys = filteredKeys.filter((k) => k !== 'altaners');
          if (remainingKeys.length > 0) {
            const accountBody = await accountService.fetchAccountAttributes(
              finalAccount,
              FILTER_ACCOUNT_GQ(remainingKeys, 'id')
            );
            if (accountBody?.id !== finalAccount) {
              throw new Error('invalid account!');
            }
            batch(() => {
              for (const key of remainingKeys) {
                dispatch(
                  setAccountAttribute({
                    key,
                    value: (accountBody as any)[KEY_MAPPING[key]]?.items ?? [],
                  })
                );
              }
            });
          }
        } catch (e: any) {
          console.error(`error: could not get altaners: ${e}`);
        }
      } else {
        const accountBody = await accountService.fetchAccountAttributes(
          finalAccount,
          FILTER_ACCOUNT_GQ(keys, 'id')
        );
        if (accountBody?.id !== finalAccount) {
          throw new Error('invalid account!');
        }
        batch(() => {
          for (const key of keys) {
            dispatch(
              setAccountAttribute({
                key,
                value: (accountBody as any)[KEY_MAPPING[key]]?.items ?? [],
              })
            );
          }
        });
      }
    } catch (e: any) {
      console.error(`error: could not get account: ${e}`);
      for (const key of keys) {
        dispatch(setAccountAttributeError({ key, error: e.toString() }));
      }
    } finally {
      batch(() => {
        for (const key of keys) {
          dispatch(stopAccountAttributeLoading(key));
        }
      });
    }
  };

/**
 * Get account members
 */
export const getAccountMembers =
  (selectedAccountId?: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const accountAssetsLoading = state.general.accountAssetsLoading;
    const accountAssetsInitialized = state.general.accountAssetsInitialized;
    const filteredKeys = ['members'].filter(
      (k) => !(accountAssetsInitialized as any)[k] && !(accountAssetsLoading as any)[k]
    );

    if (!filteredKeys?.length) {
      return;
    }

    dispatch(startAccountAttributeLoading('members'));
    try {
      const accountService = getAccountService();
      const accountId = state.general.account?.id;
      const finalAccount = selectedAccountId || accountId;

      if (!finalAccount) {
        throw new Error('No account ID available');
      }

      const value = await accountService.fetchAccountMembers(finalAccount);
      dispatch(setAccountAttribute({ key: 'members', value }));
    } catch (e: any) {
      console.error(`error: could not get account users: ${e}`);
      dispatch(setAccountAttributeError({ key: 'members', error: e.toString() }));
    } finally {
      dispatch(stopAccountAttributeLoading('members'));
    }
  };

/**
 * Get full account details
 */
export const getAccount =
  (selectedAccountId?: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const accountInitialized = state.general.generalInitialized.account;
    const accountLoading = state.general.generalLoading.account;

    if (accountInitialized || accountLoading) {
      return;
    }

    dispatch(setFullAccountLoading(true));
    try {
      const accountService = getAccountService();
      const accountId = state.general.account?.id;
      const finalAccount = selectedAccountId || accountId;

      if (!finalAccount) {
        throw new Error('No account ID available');
      }

      const accountBody = await accountService.fetchAccount(finalAccount);

      if (accountBody?.id !== finalAccount) {
        throw new Error('invalid account!');
      }

      batch(() => {
        const organisation = accountBody?.organisation || {};

        dispatch(
          setAccount({
            id: accountBody?.id,
            name: accountBody?.name,
            credit_balance: accountBody?.credit_balance,
            stripe_id: accountBody?.stripe_id,
            room_id: accountBody.room_id,
            logo_url: accountBody?.logo_url,
            organisation_id: organisation?.id,
            organisation,
            meta_data: accountBody?.meta_data || {},
            owner: accountBody.owner,
            stripe_connect_id: accountBody?.stripe_connect_id,
          })
        );
        dispatch(setFullAccountInitialized(true));
        dispatch(stopSpacesLoading());
      });

      return Promise.resolve('success');
    } catch (e: any) {
      const messageErr = `error: could not get account: ${e}`;
      console.error(messageErr);
      return Promise.reject(messageErr);
    } finally {
      dispatch(setFullAccountLoading(false));
    }
  };

/**
 * Create account
 */
export const createAccount = (data: any) => async (dispatch: AppDispatch) => {
  try {
    const accountService = getAccountService();
    const response = await accountService.createAccount(data);
    return response;
  } catch (e: any) {
    console.error(`error: could not create account: ${e}`);
    return Promise.reject(e.toString());
  }
};

/**
 * Onboard account
 */
export const onboardAccount = (data: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const { account } = getState().general;
  try {
    if (!account?.id) {
      throw new Error('No account available');
    }

    const accountService = getAccountService();
    const chatbot_id = await accountService.onboardAccount(account.id, data);
    return chatbot_id;
  } catch (e: any) {
    console.error(`error: could not onboard account: ${e}`);
    return Promise.reject(e.toString());
  }
};

/**
 * Update account metadata
 */
export const updateAccountMeta =
  (accountId: string, data: Record<string, any>) => async (dispatch: AppDispatch) => {
    try {
      const accountService = getAccountService();
      const updatedAccount = await accountService.updateAccountMetadata(accountId, data);
      dispatch(updateAccountMetadata(updatedAccount.meta_data || data));
      return Promise.resolve(updatedAccount);
    } catch (e: any) {
      console.error(`error: could not update metadata: ${e}`);
      return Promise.reject(e.toString());
    }
  };

/**
 * Update account company
 */
export const updateAccountCompany =
  (data: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const { account } = getState().general;
    try {
      if (!account?.id) {
        throw new Error('No account available');
      }

      const accountService = getAccountService();
      const response = await accountService.updateAccountCompany(account.id, data);
      return Promise.resolve(response);
    } catch (e: any) {
      console.error(`error: could not update company: ${e}`);
      return Promise.reject(e.toString());
    }
  };

/**
 * Add account address
 */
export const addAccountAddress = (data: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const { account } = getState().general;
  try {
    if (!account?.id) {
      throw new Error('No account available');
    }

    const accountService = getAccountService();
    const response = await accountService.addAccountAddress(account.id, data);
    return Promise.resolve(response);
  } catch (e: any) {
    console.error(`error: could not add address: ${e}`);
    return Promise.reject(e.toString());
  }
};

// ============================================================================
// User Operations
// ============================================================================

/**
 * Update user info
 */
export const updateUserInfo = (data: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const { user } = getState().general;
  if (!user) {
    return;
  }

  try {
    const userService = getUserService();
    const response = await userService.updateUserInfo(user.id, data);
    return Promise.resolve(response);
  } catch (e: any) {
    console.error(`error: could not update user info: ${e}`);
    return Promise.reject(e.toString());
  }
};

/**
 * Delete organisation user
 */
export const deleteOrganisationUser =
  (org_id: string, user_id: string) => async (dispatch: AppDispatch) => {
    try {
      const userService = getUserService();
      const response = await userService.deleteOrganisationUser(org_id, user_id);
      return Promise.resolve(response);
    } catch (e: any) {
      console.error(`error: could not delete organisation user: ${e}`);
      return Promise.reject(e);
    }
  };

// ============================================================================
// Roles Operations
// ============================================================================

/**
 * Get roles
 */
export const getRoles = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const rolesInitialized = state.general.generalInitialized.roles;
  const rolesLoading = state.general.generalLoading.roles;

  if (rolesInitialized || rolesLoading) {
    return;
  }

  try {
    dispatch(setRolesLoading(true));
    const roleService = getRoleService();
    const roles = await roleService.fetchRoles();
    const rolesStructure = roleService.transformRoles(roles);
    dispatch(setRoles(rolesStructure));
    return Promise.resolve(roles);
  } catch (e: any) {
    console.error(`error: could not get roles: ${e}`);
    return Promise.reject(e);
  } finally {
    dispatch(setRolesLoading(false));
  }
};

// ============================================================================
// Invitation Operations
// ============================================================================

/**
 * Create invitation
 */
export const createInvitation =
  (
    inviteMode: 'workspace' | 'organisation',
    mode: 'link' | 'email',
    roleIds: string[],
    name?: string,
    email?: string,
    meta_data?: any
  ) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const account = selectAccount(getState());
    if (!account || (inviteMode === 'organisation' && !account?.organisation_id)) {
      return Promise.reject('invalid invitation destination (bad workspace or organisation)');
    }

    try {
      const accountService = getAccountService();
      const destinationId =
        inviteMode === 'workspace' ? account.id : account.organisation_id || '';

      const inviteData = {
        mode,
        role_ids: roleIds,
        email: mode === 'email' ? email : undefined,
        name: mode === 'email' ? name : undefined,
        meta_data: mode === 'link' ? meta_data : undefined,
      };

      const response = await accountService.createInvitation(inviteMode, destinationId, inviteData);
      return response;
    } catch (e: any) {
      console.error(`error: could not create invitation: ${e}`);
      return Promise.reject(e);
    }
  };

// ============================================================================
// Flow Operations
// ============================================================================

/**
 * Create flow
 */
export const createFlow =
  (data: any, prompt?: string, altaner_component_id?: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const { account } = getState().general;
      if (!account?.id) {
        throw new Error('No account available');
      }

      const accountService = getAccountService();
      const flow = await accountService.createFlow(account.id, data, prompt, altaner_component_id);

      // Track flow creation
      try {
        analytics.flowCreated(flow, {
          prompt,
          altaner_component_id,
          account_id: account.id,
        });
      } catch (trackingError) {
        console.warn('Failed to track flow creation:', trackingError);
      }

      return flow;
    } catch (e: any) {
      console.error(`error: could not create flow: ${e}`);

      // Track error
      try {
        analytics.trackError(e, {
          source: 'redux_action',
          action: 'createFlow',
          account_id: getState().general.account?.id,
          flow_data: data,
          prompt,
          altaner_component_id,
        });
      } catch (trackingError) {
        console.warn('Failed to track createFlow error:', trackingError);
      }

      return Promise.reject(e.toString());
    }
  };

// ============================================================================
// Room Operations
// ============================================================================

/**
 * Create room
 */
export const createRoom = (data: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    const { account } = getState().general;
    if (!account?.id) {
      throw new Error('No account available');
    }

    const accountService = getAccountService();
    const room = await accountService.createRoom(account.id, data);
    return room;
  } catch (e: any) {
    if (e.response && e.response.data && e.response.data.detail) {
      return Promise.reject(e.response.data.detail);
    } else {
      return Promise.reject(e.message);
    }
  }
};

// ============================================================================
// API Token Operations
// ============================================================================

/**
 * Create API token
 */
export const createAPIToken =
  (tokenDetails: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const { account } = getState().general;
    if (!account?.id) {
      throw new Error('No account available');
    }

    const accountService = getAccountService();
    const { token, api_key } = await accountService.createAPIToken(account.id, tokenDetails);
    dispatch(apiTokenCreated(api_key));
    return Promise.resolve(token);
  };

/**
 * Delete API token
 */
export const deleteAPIToken = (tokenId: string) => async (dispatch: AppDispatch) => {
  const apiKeyService = getApiKeyService();
  const response = await apiKeyService.deleteAPIToken(tokenId);
  dispatch(apiTokenDeleted(tokenId));
  return response;
};

/**
 * Fetch API token
 */
export const fetchAPIToken = (tokenId: string) => async (dispatch: AppDispatch) => {
  try {
    const apiKeyService = getApiKeyService();
    const token = await apiKeyService.fetchAPIToken(tokenId);
    return token;
  } catch (e: any) {
    console.error(`error: could not fetch token: ${e}`);
    return Promise.reject(e.toString());
  }
};

// ============================================================================
// Agent Operations
// ============================================================================

/**
 * Create agent
 */
export const createAgent = (data: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const { account } = getState().general;
  if (!account?.id) {
    throw new Error('No account available');
  }

  try {
    const agentService = getAgentService();
    const { agent } = await agentService.createAgent(account.id, data);
    dispatch(addAgent(agent));

    // Track agent creation
    try {
      analytics.agentCreated(agent.type || 'custom', {
        agent_id: agent.id,
        agent_name: agent.name,
        account_id: account.id,
        has_voice: !!(agent.voice_enabled || agent.voice_settings),
        template_id: agent.template_id,
      });
    } catch (trackingError) {
      console.warn('Failed to track agent creation:', trackingError);
    }

    return agent;
  } catch (e: any) {
    console.error(`error: could not create agent: ${e}`);

    // Track error
    try {
      analytics.trackError(e, {
        source: 'redux_action',
        action: 'createAgent',
        account_id: account.id,
        agent_data: data,
      });
    } catch (trackingError) {
      console.warn('Failed to track createAgent error:', trackingError);
    }

    return Promise.reject(e.toString());
  }
};

/**
 * Update agent
 */
export const updateAgent = (agentId: string, data: any) => async (dispatch: AppDispatch) => {
  try {
    const agentService = getAgentService();
    const { agent } = await agentService.updateAgent(agentId, data);
    dispatch(patchAgent(agent));
    return Promise.resolve(agent);
  } catch (e: any) {
    if (e.response && e.response.data && e.response.data.detail) {
      return Promise.reject(e.response.data.detail);
    } else {
      return Promise.reject(e.message);
    }
  }
};

/**
 * Delete agent
 */
export const deleteAccountAgent = (agentId: string) => async (dispatch: AppDispatch) => {
  try {
    const agentService = getAgentService();
    await agentService.deleteAgent(agentId);
    dispatch(deleteAgentAction(agentId));
    return Promise.resolve('success');
  } catch (e: any) {
    console.error(`error: could not delete agent ${agentId}: ${e}`);
    return Promise.reject(e);
  }
};

/**
 * Duplicate agent
 */
export const duplicateAgent = (agentId: string, componentId: string) => async (dispatch: AppDispatch) => {
  try {
    const response = await optimai.delete(`/agent/${agentId}/duplicate?altaner_component_id=${componentId}`);
    return Promise.resolve(response);
  } catch (e: any) {
    console.error(`error: could not duplicate agent ${agentId}: ${e}`);
    return Promise.reject(e);
  }
};

// ============================================================================
// Webhook Operations
// ============================================================================

/**
 * Create webhook
 */
export const createWebhook = (data: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const accountId = getState().general.account?.id;
  if (!accountId) {
    throw new Error('No account available');
  }

  try {
    const accountService = getAccountService();
    const hook = await accountService.createWebhook(accountId, data);
    return Promise.resolve(hook);
  } catch (e: any) {
    if (e.response && e.response.data && e.response.data.detail) {
      return Promise.reject(e.response.data.detail);
    } else {
      return Promise.reject(e.message);
    }
  }
};

/**
 * Fetch webhook events
 */
export const fetchWebhookEvents =
  (webhookId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const { account } = getState().general;
      if (!account?.id) {
        throw new Error('No account available');
      }

      const accountService = getAccountService();
      const events = await accountService.fetchWebhookEvents(account.id, webhookId);
      dispatch(setWebhookEvents({ webhookId, events }));
      return Promise.resolve(events);
    } catch (e: any) {
      console.error(`error: could not fetch webhook events: ${e}`);
      return Promise.reject(e.toString());
    }
  };

// ============================================================================
// Resource Operations
// ============================================================================

/**
 * Create account resource
 */
export const createAccountResource =
  (resource_name: string, payload: any, reducer?: any) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const response = await optimai.post(`/utils/${resource_name}`, payload);
      return Promise.resolve(response);
    } catch (e: any) {
      console.error(`error: could not create ${resource_name}: ${e}`);
      return Promise.reject(e);
    }
  };

/**
 * Delete account resource
 */
export const deleteAccountResource =
  (resource_name: string, resource_id: string, reducer?: any) => async (dispatch: AppDispatch) => {
    try {
      const response = await optimai.delete(`/graph/${resource_name}/${resource_id}`);
      if (reducer) {
        dispatch(reducer(resource_id));
      }
      return Promise.resolve(response);
    } catch (e: any) {
      console.error(`error: could not delete ${resource_name}: ${e}`);
      return Promise.reject(e);
    }
  };

// ============================================================================
// Template Operations
// ============================================================================

/**
 * Publish agent template
 */
export const publishAgent = (data: any) => async () => {
  try {
    const marketplaceService = getMarketplaceService();
    const template = await marketplaceService.publishAgentTemplate(data);
    return Promise.resolve(template);
  } catch (e: any) {
    if (e.response && e.response.data && e.response.data.detail) {
      return Promise.reject(e.response.data.detail);
    } else {
      return Promise.reject(e.message);
    }
  }
};

/**
 * Clone template
 */
export const cloneTemplate =
  (templateId: string, data: any, timeout = 0) =>
  async () => {
    try {
      const response = await optimai.post(`/clone/${templateId}?timeout=${timeout}`, data);
      const { clone } = response.data;
      return clone.id;
    } catch (e: any) {
      return Promise.reject(e);
    }
  };

/**
 * Create template
 */
export const createTemplate = (data: any) => async () => {
  if (!data?.entity_type) {
    return Promise.reject('invalid entity type or id');
  }
  if (!data?.id) {
    return Promise.reject(`invalid ${data.entity_type} id`);
  }

  try {
    const templateService = getTemplateService();
    const template = await templateService.createTemplate(data);
    return Promise.resolve(template);
  } catch (e: any) {
    console.error(`error: could not create ${data.entity_type} template: ${e.message}`);
    return Promise.reject(e);
  }
};

/**
 * Create template version
 */
export const createTemplateVersion = (templateId: string, data: any) => async (dispatch: AppDispatch) => {
  if (!data?.version?.version_type) {
    return Promise.reject('select a version type (patch, minor, major or prerelease)');
  }
  if (data.version.version_type === 'prerelease' && !data.version.prerelease) {
    return Promise.reject('select a valid prerelease identifier');
  }
  if (!templateId) {
    return Promise.reject('invalid template to push version');
  }

  try {
    const templateService = getTemplateService();
    const template_version = await templateService.createTemplateVersion(templateId, data);
    return Promise.resolve(template_version);
  } catch (e: any) {
    console.error(`error: could not publish template version: ${e.message}`);
    return Promise.reject(e);
  }
};

/**
 * Mark template version as selected
 */
export const markTemplateVersionAsSelected = (templateId: string, templateVersionId: string) => async () => {
  if (!templateVersionId || !templateId) {
    return Promise.reject(`invalid template version to delete: ${templateVersionId}`);
  }

  try {
    await optimai.patch(`/templates/${templateId}/versions/${templateVersionId}/appoint`);
    return Promise.resolve('success');
  } catch (e: any) {
    console.error(`error: could not delete template version: ${e.message}`);
    return Promise.reject(e);
  }
};

/**
 * Delete template version
 */
export const deleteTemplateVersion = (templateVersionId: string) => async () => {
  if (!templateVersionId) {
    return Promise.reject(`invalid template version to delete: ${templateVersionId}`);
  }

  try {
    await optimai.delete(`/templates/versions/${templateVersionId}`);
    return Promise.resolve('success');
  } catch (e: any) {
    console.error(`error: could not delete template version: ${e.message}`);
    return Promise.reject(e);
  }
};

/**
 * Update template
 */
export const updateTemplate = (templateId: string, data: any) => async (dispatch: AppDispatch) => {
  try {
    const response = await optimai.patch(`/templates/${templateId}`, data);
    return Promise.resolve(response);
  } catch (e: any) {
    console.error(`error: could not update template: ${e.message}`);
    throw e;
  }
};

// ============================================================================
// Custom App Operations
// ============================================================================

/**
 * Create custom app
 */
export const createCustomApp = (payload: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    const { account } = getState().general;
    if (!account?.id) {
      throw new Error('No account available');
    }

    const developerAppService = getDeveloperAppService();
    const app = await developerAppService.createCustomApp(account.id, payload);
    dispatch(addApp(app));
    return Promise.resolve(app);
  } catch (e: any) {
    console.error(`error: could not create custom app: ${e}`);
    return Promise.reject(e);
  }
};

/**
 * Remove app
 */
export const removeApp = (appId: string) => async (dispatch: AppDispatch) => {
  try {
    const developerAppService = getDeveloperAppService();
    await developerAppService.removeApp(appId);
    dispatch(deleteApp(appId));
    return Promise.resolve('success');
  } catch (e: any) {
    console.error(`error: could not remove app: ${e}`);
    return Promise.reject(e);
  }
};

/**
 * Update connection type
 */
export const updateConnectionType =
  (connectionTypeId: string, payload: any) => async (dispatch: AppDispatch) => {
    try {
      const developerAppService = getDeveloperAppService();
      const connection_type = await developerAppService.updateConnectionType(connectionTypeId, payload);
      dispatch(updateConnectionTypeSuccess({ connectionTypeId, connectionType: connection_type }));
      return Promise.resolve(connection_type);
    } catch (e: any) {
      console.error(`error: could not update connection type: ${e}`);
      return Promise.reject(e);
    }
  };

/**
 * Create action type
 */
export const createActionType = (payload: any) => async (dispatch: AppDispatch) => {
  try {
    const developerAppService = getDeveloperAppService();
    const action_type = await developerAppService.createActionType(payload);
    dispatch(addActionType({ action_type }));
    return Promise.resolve(action_type);
  } catch (e: any) {
    console.error(`error: could not create action type: ${e}`);
    return Promise.reject(e);
  }
};

/**
 * Patch action type
 */
export const patchActionType = (id: string, payload: any) => async (dispatch: AppDispatch) => {
  try {
    const developerAppService = getDeveloperAppService();
    const action_type = await developerAppService.patchActionType(id, payload);
    return Promise.resolve(action_type);
  } catch (e: any) {
    console.error(`error: could not patch action type: ${e}`);
    return Promise.reject(e);
  }
};

/**
 * Remove action type
 */
export const removeActionType =
  (id: string, connectionTypeId: string) => async (dispatch: AppDispatch) => {
    try {
      const developerAppService = getDeveloperAppService();
      await developerAppService.removeActionType(id);
      dispatch(deleteActionType({ connection_type_id: connectionTypeId, actionTypeId: id }));
      return Promise.resolve('success');
    } catch (e: any) {
      console.error(`error: could not delete action type: ${e}`);
      return Promise.reject(e);
    }
  };

/**
 * Create resource type
 */
export const createResourceType = (payload: any) => async (dispatch: AppDispatch) => {
  try {
    const developerAppService = getDeveloperAppService();
    const resource_type = await developerAppService.createResourceType(payload);
    dispatch(addResourceType({ resource_type }));
    return Promise.resolve(resource_type);
  } catch (e: any) {
    console.error(`error: could not create resource type: ${e}`);
    return Promise.reject(e);
  }
};

/**
 * Patch resource type
 */
export const patchResourceType = (id: string, payload: any) => async (dispatch: AppDispatch) => {
  try {
    const developerAppService = getDeveloperAppService();
    const resource_type = await developerAppService.patchResourceType(id, payload);
    return Promise.resolve(resource_type);
  } catch (e: any) {
    console.error(`error: could not patch resource type: ${e}`);
    return Promise.reject(e);
  }
};

/**
 * Remove resource type
 */
export const removeResourceType =
  (id: string, connectionTypeId: string) => async (dispatch: AppDispatch) => {
    try {
      const developerAppService = getDeveloperAppService();
      await developerAppService.removeResourceType(id);
      dispatch(deleteResourceType({ connection_type_id: connectionTypeId, resourceTypeId: id }));
      return Promise.resolve('success');
    } catch (e: any) {
      console.error(`error: could not delete resource type: ${e}`);
      return Promise.reject(e);
    }
  };

// ============================================================================
// Interface Operations
// ============================================================================

/**
 * Create interface
 */
export const createInterface = (data: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    const { account } = getState().general;
    if (!account?.id) {
      throw new Error('No account available');
    }

    const res = await optimai.post(`/account/${account.id}/interface`, data);
    return res.data;
  } catch (e: any) {
    return Promise.reject(e);
  }
};

/**
 * Update interface by ID
 */
export const updateInterfaceById = (interfaceId: string, data: any) => async () => {
  try {
    const res = await optimai.patch(`/interfaces/${interfaceId}`, data);
    return Promise.resolve(res);
  } catch (e: any) {
    return Promise.reject(e);
  }
};

/**
 * Delete interface by ID
 */
export const deleteInterfaceById = (interfaceId: string) => async () => {
  try {
    const res = await optimai.delete(`/interfaces/${interfaceId}`);
    return Promise.resolve(res);
  } catch (e: any) {
    return Promise.reject(e);
  }
};

/**
 * Get interface by ID
 */
export const getInterfaceById =
  (interfaceId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const interfaces = state.general.account?.interfaces || [];

    const existingInterface = interfaces.find((i) => i.id === interfaceId);
    if (existingInterface) {
      return Promise.resolve(existingInterface);
    }

    try {
      const response = await optimai.get(`/interfaces/v2/${interfaceId}`);
      const interfaceData = response.data.interface;
      dispatch(addInterface(interfaceData));
      return Promise.resolve(interfaceData);
    } catch (e: any) {
      console.error(`error: could not get interface ${interfaceId}: ${e}`);
      return Promise.reject(e);
    }
  };

// ============================================================================
// State Clearing Operations
// ============================================================================

/**
 * Clear account state
 */
export const clearAccountState = () => async (dispatch: AppDispatch) =>
  batch(() => {
    dispatch(clearGeneralState());
    dispatch(clearAgentsState());
    dispatch(clearConnectionsState());
    dispatch(clearMediaState());
    dispatch(clearFlowState());
    dispatch(clearAltanerState());
    dispatch(clearAgentsUsage());
    dispatch(clearSpacesState());
  });

/**
 * Switch account
 */
export const switchAccount =
  ({ accountId }: { accountId: string }) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const accounts = selectAccounts(state);
    const account = accounts.find((a) => a.id === accountId);
    const user = state.general.user;

    if (account) {
      const previousAccountId = state.general.account?.id;

      batch(() => {
        dispatch(clearAccountState());
        dispatch(setAccount(account));
      });
      localStorage.setItem('OAIPTACC', accountId);

      // Track account switch
      try {
        if (user) {
          analytics.accountSwitched(previousAccountId, accountId, {
            user_id: user.id,
            user_email: user.email,
            account_name: account.name,
            previous_account_name: state.general.account?.name,
          });

          analytics.identify(user.id, {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            account_id: accountId,
            method: 'account_switch',
            is_superadmin: user.xsup,
          });
        }
      } catch (trackingError) {
        console.warn('Failed to track account switch:', trackingError);
      }

      return Promise.resolve('success');
    }
    return Promise.reject('user has no access to account');
  };

/**
 * Update agents usage
 */
export const updateAgentsUsage = (usageData: Record<string, any>) => (dispatch: AppDispatch) => {
  dispatch(require('../slices/generalSlice').updateAgentsWithUsage(usageData));
};

