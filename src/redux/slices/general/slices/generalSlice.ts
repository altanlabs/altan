/**
 * General Slice - Main application state
 * Handles user, account, and global application state
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setNested } from '../../../../components/tools/dynamic/utils';
import type {
  GeneralState,
  User,
  Account,
  Agent,
  Webhook,
  Subscription,
  Altaner,
  DeveloperApp,
  CustomApp,
  Interface,
  RolesState,
  GlobalVarsPayload,
  SetAccountAttributePayload,
  SetAccountAttributeErrorPayload,
  UpdateAccountAltanerPayload,
  UpdateDeveloperAppPayload,
  UpdateAppPayload,
  AddActionTypePayload,
  UpdateActionTypePayload,
  DeleteActionTypePayload,
  AddResourceTypePayload,
  UpdateResourceTypePayload,
  DeleteResourceTypePayload,
  UpdateConnectionTypePayload,
  UpdateInterfacePayload,
  AddInterfaceDeploymentPayload,
  UpdateInterfaceDeploymentPayload,
  AddInterfaceCommitPayload,
  UpdateInterfaceCommitPayload,
  UpdateWorkflowExecutionPayload,
  SetWebhookEventsPayload,
  UpdateSubscriptionPayload,
  WorkflowExecution,
  ApiKey,
} from '../types/state';

const initialState: GeneralState = {
  initialized: false,
  isLoading: false,
  error: null,
  user: null,
  permissionDialogOpen: false,
  createAltaner: false,
  globalVars: {
    open: false,
    position: null,
    context: null,
  },
  generalLoading: {
    account: false,
    roles: false,
  },
  generalInitialized: {
    account: false,
    roles: false,
  },
  roles: {
    byName: {},
    byId: {},
  },
  account: {
    id: '',
    webhooks: [],
    members: [],
    rooms: [],
    attributes: [],
    subscriptions: [],
    agents: [],
    altaners: [],
    payments: [],
    developer_apps: [],
    connections: [],
    apps: [],
    interfaces: [],
    bases: [],
    meta_data: {
      nav: [],
    },
  },
  accountAssetsLoading: {
    altaners: false,
    rooms: false,
    workflows: false,
    payments: false,
    webhooks: false,
    subscriptions: false,
    apikeys: false,
    agents: false,
    members: false,
    developer_apps: false,
    connections: false,
    apps: false,
    interfaces: false,
    bases: false,
  },
  accountAssetsInitialized: {
    altaners: false,
    rooms: false,
    workflows: false,
    payments: false,
    webhooks: false,
    subscriptions: false,
    apikeys: false,
    agents: false,
    members: false,
    developer_apps: false,
    connections: false,
    apps: false,
    interfaces: false,
    bases: false,
  },
  accountAssetsErrors: {
    altaners: null,
    rooms: null,
    workflows: null,
    payments: null,
    webhooks: null,
    subscriptions: null,
    apikeys: null,
    agents: null,
    members: null,
    developer_apps: null,
    connections: null,
    apps: null,
    interfaces: null,
    bases: null,
  },
  webSocketEvents: [],
  accounts: [],
  fileInViewer: null,
  fileViewerOpen: false,
  stripeDashboard: null,
  stripeActivation: null,
  stripeAccount: null,
  headerVisible: true,
  workflowExecutions: {},
  workflowExecutionsInitialized: false,
  agentsUsageData: {},
};

const slice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    // Loading & Error State
    startLoading(state) {
      state.initialized = false;
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
    },
    hasError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Global Vars Menu
    openGlobalVarsMenu(state, action: PayloadAction<GlobalVarsPayload>) {
      const { position, context } = action.payload;
      state.globalVars.open = true;
      state.globalVars.position = position;
      state.globalVars.context = context;
    },
    closeGlobalVarsMenu(state) {
      state.globalVars.open = false;
      state.globalVars.position = null;
      state.globalVars.context = null;
    },

    // Header Visibility
    showHeader(state) {
      state.headerVisible = true;
    },
    hideHeader(state) {
      state.headerVisible = false;
    },

    // WebSocket Events
    addWebSocketEvent(state, action: PayloadAction<any>) {
      state.webSocketEvents.push(action.payload);
    },
    setWebSocketEvents(state, action: PayloadAction<any[]>) {
      state.webSocketEvents = action.payload;
    },

    // Dialogs
    openPermissionDialog(state) {
      state.permissionDialogOpen = true;
    },
    closePermissionDialog(state) {
      state.permissionDialogOpen = false;
    },
    openCreateAltaner(state) {
      state.createAltaner = true;
    },
    closeCreateAltaner(state) {
      state.createAltaner = false;
    },

    // User
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },

    // Stripe
    setActivationLink(state, action: PayloadAction<string>) {
      state.stripeActivation = action.payload;
    },
    setStripeAccount(state, action: PayloadAction<any>) {
      state.stripeAccount = action.payload;
    },
    setStripeDashboard(state, action: PayloadAction<string>) {
      state.stripeDashboard = action.payload;
    },

    // Account Loading & Initialization
    setFullAccountLoading(state, action: PayloadAction<boolean>) {
      state.generalLoading.account = action.payload;
    },
    setFullAccountInitialized(state, action: PayloadAction<boolean>) {
      state.generalInitialized.account = action.payload;
    },

    // Account
    setAccount(state, action: PayloadAction<Partial<Account>>) {
      const account = action.payload;
      if (!state.account) {
        state.account = account as Account;
      } else {
        Object.assign(state.account, account);
      }
    },
    updateAccount(state, action: PayloadAction<Account>) {
      state.account = action.payload;
    },
    updateAccountCreditBalance(state, action: PayloadAction<number>) {
      if (state.account) {
        state.account.credit_balance = action.payload;
      }
    },
    updateAccountMetadata(state, action: PayloadAction<Record<string, any>>) {
      if (state.account) {
        state.account.meta_data = action.payload;
      }
    },

    // Accounts List
    setAccounts(state, action: PayloadAction<Account[]>) {
      state.accounts = action.payload;
    },

    // Roles
    setRoles(state, action: PayloadAction<RolesState>) {
      state.roles = action.payload;
      state.generalInitialized.roles = true;
    },
    setRolesLoading(state, action: PayloadAction<boolean>) {
      state.generalLoading.roles = action.payload;
    },

    // Account Assets Loading & Initialization
    startAccountAttributeLoading(state, action: PayloadAction<string>) {
      const key = action.payload;
      setNested(state.accountAssetsLoading, key, true);
      setNested(state.accountAssetsInitialized, key, false);
    },
    stopAccountAttributeLoading(state, action: PayloadAction<string>) {
      const key = action.payload;
      setNested(state.accountAssetsLoading, key, false);
    },
    setAccountAttributeError(state, action: PayloadAction<SetAccountAttributeErrorPayload>) {
      const { key, error } = action.payload;
      setNested(state.accountAssetsErrors, key, error);
    },
    setAccountAttribute(state, action: PayloadAction<SetAccountAttributePayload>) {
      const { key, value } = action.payload;
      if (!state.account) {
        state.account = {} as Account;
      }
      setNested(state.account, key, value);
      setNested(state.accountAssetsInitialized, key, true);
    },

    // Agents
    addAgent(state, action: PayloadAction<Agent>) {
      if (!state.account.agents) {
        state.account.agents = [];
      }
      state.account.agents.push(action.payload);
    },
    patchAgent(state, action: PayloadAction<Agent>) {
      const patchedAgent = action.payload;
      if (state.account.agents) {
        const agent = state.account.agents.find((a) => a.id === patchedAgent.id);
        if (agent) {
          Object.assign(agent, patchedAgent);
        }
      }
    },
    deleteAgent(state, action: PayloadAction<string>) {
      if (state.account.agents) {
        state.account.agents = state.account.agents.filter((agent) => agent.id !== action.payload);
      }
    },

    // Webhooks
    addWebhook(state, action: PayloadAction<Webhook>) {
      if (!state.account.webhooks) {
        state.account.webhooks = [];
      }
      state.account.webhooks.push(action.payload);
    },
    deleteWebhook(state, action: PayloadAction<string>) {
      if (state.account.webhooks) {
        state.account.webhooks = state.account.webhooks.filter((item) => item.id !== action.payload);
      }
    },
    setWebhookEvents(state, action: PayloadAction<SetWebhookEventsPayload>) {
      const { webhookId, events } = action.payload;
      if (state.account.webhooks) {
        const webhook = state.account.webhooks.find((w) => w.id === webhookId);
        if (webhook) {
          webhook.events = { items: events };
        }
      }
    },

    // Attributes
    deleteAttribute(state, action: PayloadAction<string>) {
      if (state.account.attributes) {
        state.account.attributes = state.account.attributes.filter((a) => a.id !== action.payload);
      }
    },

    // Commands
    deleteCommand(state, action: PayloadAction<string>) {
      if (state.account.organisation?.members) {
        // Note: This seems to be a typo in the original code - it should probably be commands
        // Keeping as-is for compatibility
      }
    },

    // Members
    deleteMember(state, action: PayloadAction<string>) {
      if (state.account.organisation?.members) {
        state.account.organisation.members = state.account.organisation.members.filter(
          (member) => member.id !== action.payload
        );
      }
    },

    // API Tokens
    apiTokenCreated(state, action: PayloadAction<ApiKey>) {
      if (!state.account.apikeys) {
        state.account.apikeys = [];
      }
      state.account.apikeys.push(action.payload);
    },
    apiTokenDeleted(state, action: PayloadAction<string>) {
      if (state.account.apikeys) {
        state.account.apikeys = state.account.apikeys.filter((token) => token.id !== action.payload);
      }
    },

    // Subscriptions
    addSubscription(state, action: PayloadAction<Subscription>) {
      if (!state.account.subscriptions) {
        state.account.subscriptions = [];
      }
      state.account.subscriptions.push(action.payload);
    },
    updateSubscription(state, action: PayloadAction<UpdateSubscriptionPayload>) {
      if (state.account.subscriptions) {
        const index = state.account.subscriptions.findIndex((sub) => sub.id === action.payload.id);
        if (index !== -1) {
          state.account.subscriptions[index] = {
            ...state.account.subscriptions[index],
            ...action.payload,
          };
        }
      }
    },
    deleteSubscription(state, action: PayloadAction<string>) {
      if (state.account.subscriptions) {
        state.account.subscriptions = state.account.subscriptions.filter(
          (sub) => sub.id !== action.payload
        );
      }
    },

    // Altaners
    addAccountAltaner(state, action: PayloadAction<Altaner>) {
      if (!state.account.altaners) {
        state.account.altaners = [];
      }
      state.account.altaners.push(action.payload);
    },
    updateAccountAltaner(state, action: PayloadAction<UpdateAccountAltanerPayload>) {
      const { ids, changes } = action.payload;
      if (!ids || !Array.isArray(ids)) {
        console.warn('updateAccountAltaner: ids is undefined or not an array', action.payload);
        return;
      }
      if (state.account.altaners) {
        ids.forEach((altanerId) => {
          const index = state.account.altaners!.findIndex((a) => a.id === altanerId);
          if (index !== -1) {
            state.account.altaners![index] = { ...state.account.altaners![index], ...changes };
          }
        });
      }
    },
    deleteAccountAltaner(state, action: PayloadAction<string>) {
      if (state.account.altaners) {
        state.account.altaners = state.account.altaners.filter((a) => a.id !== action.payload);
      }
    },

    // Developer Apps
    addDeveloperApp(state, action: PayloadAction<DeveloperApp>) {
      if (!state.account.developer_apps) {
        state.account.developer_apps = [];
      }
      state.account.developer_apps.push(action.payload);
    },
    updateDeveloperApp(state, action: PayloadAction<UpdateDeveloperAppPayload>) {
      const { id, ...changes } = action.payload;
      if (state.account.developer_apps) {
        const index = state.account.developer_apps.findIndex((app) => app.id === id);
        if (index !== -1) {
          state.account.developer_apps[index] = {
            ...state.account.developer_apps[index],
            ...changes,
          };
        }
      }
    },
    deleteDeveloperApp(state, action: PayloadAction<string>) {
      if (state.account.developer_apps) {
        state.account.developer_apps = state.account.developer_apps.filter(
          (app) => app.id !== action.payload
        );
      }
    },

    // Custom Apps
    addApp(state, action: PayloadAction<CustomApp>) {
      if (!state.account.apps) {
        state.account.apps = [];
      }
      state.account.apps.push(action.payload);
    },
    updateApp(state, action: PayloadAction<UpdateAppPayload>) {
      const { id, ...changes } = action.payload;
      if (state.account.apps) {
        const index = state.account.apps.findIndex((app) => app.id === id);
        if (index !== -1) {
          state.account.apps[index] = {
            ...state.account.apps[index],
            ...changes,
          };
        }
      }
    },
    deleteApp(state, action: PayloadAction<string>) {
      if (state.account.apps) {
        state.account.apps = state.account.apps.filter((app) => app.id !== action.payload);
      }
    },

    // Action Types
    addActionType(state, action: PayloadAction<AddActionTypePayload>) {
      const { action_type } = action.payload;
      const { connection_type_id, connection_type } = action_type;
      const { app_id } = connection_type || {};

      if (state.account.apps && app_id) {
        const app = state.account.apps.find((app) => app.id === app_id);
        if (app?.connection_types?.items) {
          const connectionType = app.connection_types.items.find((ct) => ct.id === connection_type_id);
          if (connectionType) {
            if (!Array.isArray(connectionType.actions)) {
              connectionType.actions = [];
            }
            connectionType.actions.push(action_type);
          }
        }
      }
    },
    updateActionType(state, action: PayloadAction<UpdateActionTypePayload>) {
      const { connection_type_id, actionTypeId, changes } = action.payload;
      if (state.account.apps) {
        const app = state.account.apps.find((app) =>
          app.connection_types?.items.some((ct) => ct.id === connection_type_id)
        );
        if (app?.connection_types?.items) {
          const connectionType = app.connection_types.items.find((ct) => ct.id === connection_type_id);
          if (connectionType?.actions) {
            const actionType = connectionType.actions.find((at) => at.id === actionTypeId);
            if (actionType) {
              Object.assign(actionType, changes);
            }
          }
        }
      }
    },
    deleteActionType(state, action: PayloadAction<DeleteActionTypePayload>) {
      const { connection_type_id, actionTypeId } = action.payload;
      if (state.account.apps) {
        const app = state.account.apps.find((app) =>
          app.connection_types?.items.some((ct) => ct.id === connection_type_id)
        );
        if (app?.connection_types?.items) {
          const connectionType = app.connection_types.items.find((ct) => ct.id === connection_type_id);
          if (connectionType?.actions && Array.isArray(connectionType.actions)) {
            connectionType.actions = connectionType.actions.filter((at) => at.id !== actionTypeId);
          }
        }
      }
    },

    // Resource Types
    addResourceType(state, action: PayloadAction<AddResourceTypePayload>) {
      const { resource_type } = action.payload;
      const { connection_type_id, connection_type } = resource_type;
      const { app_id } = connection_type || {};

      if (state.account.apps && app_id) {
        const app = state.account.apps.find((app) => app.id === app_id);
        if (app?.connection_types?.items) {
          const connectionType = app.connection_types.items.find((ct) => ct.id === connection_type_id);
          if (connectionType) {
            if (!connectionType.resources) {
              connectionType.resources = { items: [] };
            }
            if (!Array.isArray(connectionType.resources.items)) {
              connectionType.resources.items = [];
            }
            connectionType.resources.items.push(resource_type);
          }
        }
      }
    },
    updateResourceType(state, action: PayloadAction<UpdateResourceTypePayload>) {
      const { connection_type_id, resourceTypeId, changes } = action.payload;
      if (state.account.apps) {
        const app = state.account.apps.find((app) =>
          app.connection_types?.items.some((ct) => ct.id === connection_type_id)
        );
        if (app?.connection_types?.items) {
          const connectionType = app.connection_types.items.find((ct) => ct.id === connection_type_id);
          if (connectionType?.resources?.items) {
            const resourceType = connectionType.resources.items.find((rt) => rt.id === resourceTypeId);
            if (resourceType) {
              Object.assign(resourceType, changes);
            }
          }
        }
      }
    },
    deleteResourceType(state, action: PayloadAction<DeleteResourceTypePayload>) {
      const { connection_type_id, resourceTypeId } = action.payload;
      if (state.account.apps) {
        const app = state.account.apps.find((app) =>
          app.connection_types?.items.some((ct) => ct.id === connection_type_id)
        );
        if (app?.connection_types?.items) {
          const connectionType = app.connection_types.items.find((ct) => ct.id === connection_type_id);
          if (connectionType?.resources?.items && Array.isArray(connectionType.resources.items)) {
            connectionType.resources.items = connectionType.resources.items.filter(
              (rt) => rt.id !== resourceTypeId
            );
          }
        }
      }
    },

    // Connection Types
    updateConnectionTypeSuccess(state, action: PayloadAction<UpdateConnectionTypePayload>) {
      const { connectionTypeId, connectionType } = action.payload;
      if (state.account.apps) {
        const app = state.account.apps.find((app) =>
          app.connection_types?.items.some((ct) => ct.id === connectionTypeId)
        );
        if (app?.connection_types?.items) {
          const index = app.connection_types.items.findIndex((ct) => ct.id === connectionTypeId);
          if (index !== -1) {
            app.connection_types.items[index] = connectionType;
          }
        }
      }
    },

    // Interfaces
    addInterface(state, action: PayloadAction<Interface>) {
      if (!Array.isArray(state.account.interfaces)) {
        state.account.interfaces = [];
      }
      state.account.interfaces.push(action.payload);
    },
    updateInterface(state, action: PayloadAction<UpdateInterfacePayload>) {
      const { id, ...changes } = action.payload;
      if (state.account.interfaces) {
        const index = state.account.interfaces.findIndex((i) => i.id === id);
        if (index !== -1) {
          state.account.interfaces[index] = {
            ...state.account.interfaces[index],
            ...changes,
          };
        }
      }
    },
    deleteInterface(state, action: PayloadAction<string>) {
      if (state.account.interfaces) {
        state.account.interfaces = state.account.interfaces.filter((i) => i.id !== action.payload);
      }
    },

    // Interface Deployments
    addInterfaceDeployment(state, action: PayloadAction<AddInterfaceDeploymentPayload>) {
      const { id, interface_id, ...deploymentData } = action.payload;
      if (state.account.interfaces) {
        const interface_ = state.account.interfaces.find((i) => i.id === interface_id);
        if (interface_) {
          if (!interface_.deployments) {
            interface_.deployments = { items: [] };
          } else if (!interface_.deployments.items) {
            interface_.deployments.items = [];
          }

          const deploymentIndex = interface_.deployments.items.findIndex((d) => d.id === id);
          if (deploymentIndex !== -1) {
            interface_.deployments.items[deploymentIndex] = {
              ...interface_.deployments.items[deploymentIndex],
              ...deploymentData,
              id,
              interface_id,
            };
          } else {
            interface_.deployments.items.push({
              id,
              interface_id,
              ...deploymentData,
            });
          }
        }
      }
    },
    updateInterfaceDeployment(state, action: PayloadAction<UpdateInterfaceDeploymentPayload>) {
      const { id, interface_id, vercel_deployment_id, search_all_interfaces, ...changes } = action.payload;

      let interface_: Interface | undefined;
      let deploymentIndex = -1;

      if (search_all_interfaces && !interface_id && state.account.interfaces) {
        for (const iface of state.account.interfaces) {
          if (iface.deployments?.items) {
            let idx = iface.deployments.items.findIndex((d) => d.id === id);

            if (idx === -1 && vercel_deployment_id) {
              idx = iface.deployments.items.findIndex(
                (d) => d.meta_data?.deployment_info?.id === vercel_deployment_id
              );
            }

            if (idx === -1) {
              idx = iface.deployments.items.findIndex((d) => d.deployment_id === id);
            }

            if (idx !== -1) {
              interface_ = iface;
              deploymentIndex = idx;
              break;
            }
          }
        }
      } else if (state.account.interfaces) {
        interface_ = state.account.interfaces.find((i) => i.id === interface_id);

        if (interface_?.deployments?.items) {
          deploymentIndex = interface_.deployments.items.findIndex((d) => d.id === id);

          if (deploymentIndex === -1 && vercel_deployment_id) {
            deploymentIndex = interface_.deployments.items.findIndex(
              (d) => d.meta_data?.deployment_info?.id === vercel_deployment_id
            );
          }

          if (deploymentIndex === -1) {
            deploymentIndex = interface_.deployments.items.findIndex((d) => d.deployment_id === id);
          }
        }
      }

      if (interface_ && deploymentIndex !== -1 && interface_.deployments?.items) {
        interface_.deployments.items[deploymentIndex] = {
          ...interface_.deployments.items[deploymentIndex],
          ...changes,
          id: interface_.deployments.items[deploymentIndex].id,
          interface_id: interface_.id,
        };
      } else if (interface_id && interface_) {
        if (!interface_.deployments) {
          interface_.deployments = { items: [] };
        } else if (!interface_.deployments.items) {
          interface_.deployments.items = [];
        }
        interface_.deployments.items.push({
          id,
          interface_id,
          ...changes,
        });
      }
    },
    deleteInterfaceDeployment(state, action: PayloadAction<string>) {
      const deploymentId = action.payload;
      if (state.account.interfaces) {
        const interface_ = state.account.interfaces.find((i) =>
          i.deployments?.items?.some((d) => d.id === deploymentId)
        );
        if (interface_?.deployments?.items) {
          interface_.deployments.items = interface_.deployments.items.filter(
            (d) => d.id !== deploymentId
          );
        }
      }
    },

    // Interface Commits
    addInterfaceCommit(state, action: PayloadAction<AddInterfaceCommitPayload>) {
      const { id, interface_id, ...commitData } = action.payload;
      if (state.account.interfaces) {
        const interface_ = state.account.interfaces.find((i) => i.id === interface_id);
        if (interface_) {
          if (!interface_.commits) {
            interface_.commits = { items: [] };
          } else if (!interface_.commits.items) {
            interface_.commits.items = [];
          }

          const commitIndex = interface_.commits.items.findIndex((c) => c.id === id);
          if (commitIndex !== -1) {
            interface_.commits.items[commitIndex] = {
              ...interface_.commits.items[commitIndex],
              ...commitData,
              id,
              interface_id,
            };
          } else {
            interface_.commits.items.push({
              id,
              interface_id,
              ...commitData,
            });
          }
        }
      }
    },
    updateInterfaceCommit(state, action: PayloadAction<UpdateInterfaceCommitPayload>) {
      const { id, interface_id, ...changes } = action.payload;
      if (state.account.interfaces) {
        const interface_ = state.account.interfaces.find((i) => i.id === interface_id);
        if (interface_?.commits?.items) {
          const commitIndex = interface_.commits.items.findIndex((c) => c.id === id);
          if (commitIndex !== -1) {
            interface_.commits.items[commitIndex] = {
              ...interface_.commits.items[commitIndex],
              ...changes,
              id,
              interface_id,
            };
          }
        }
      }
    },
    deleteInterfaceCommit(state, action: PayloadAction<string>) {
      const commitId = action.payload;
      if (state.account.interfaces) {
        const interface_ = state.account.interfaces.find((i) =>
          i.commits?.items?.some((c) => c.id === commitId)
        );
        if (interface_?.commits?.items) {
          interface_.commits.items = interface_.commits.items.filter((c) => c.id !== commitId);
        }
      }
    },

    // Workflow Executions
    addWorkflowExecution(state, action: PayloadAction<WorkflowExecution>) {
      const execution = action.payload;
      const workflowId = execution.workflow_id;

      if (!state.workflowExecutions[workflowId]) {
        state.workflowExecutions[workflowId] = [];
      }

      state.workflowExecutions[workflowId].unshift(execution);

      if (state.account.workflows) {
        const workflow = state.account.workflows.find((w) => w.id === workflowId);
        if (workflow) {
          if (!workflow.executions) {
            workflow.executions = { items: [] };
          }
          workflow.executions.items.unshift(execution);
        }
      }

      if (state.workflowExecutions[workflowId].length > 100) {
        state.workflowExecutions[workflowId].pop();
      }
    },
    updateWorkflowExecutions(state, action: PayloadAction<any[]>) {
      const workflowsWithExecutions = action.payload;
      if (state.account?.workflows) {
        workflowsWithExecutions.forEach((workflow) => {
          if (workflow.executions?.items) {
            const workflowIndex = state.account.workflows!.findIndex((w) => w.id === workflow.id);
            if (workflowIndex !== -1) {
              state.account.workflows![workflowIndex].executions = {
                items: workflow.executions.items,
              };
              state.workflowExecutions[workflow.id] = workflow.executions.items;
            }
          }
        });
      }
      state.workflowExecutionsInitialized = true;
    },
    updateWorkflowExecution(state, action: PayloadAction<UpdateWorkflowExecutionPayload>) {
      const { id, changes } = action.payload;
      const workflowId = changes.workflow_id;

      if (workflowId && state.workflowExecutions[workflowId]) {
        const index = state.workflowExecutions[workflowId].findIndex((e) => e.id === id);
        if (index !== -1) {
          state.workflowExecutions[workflowId][index] = {
            ...state.workflowExecutions[workflowId][index],
            ...changes,
          };
        }
      }

      if (workflowId && state.account.workflows) {
        const workflow = state.account.workflows.find((w) => w.id === workflowId);
        if (workflow?.executions?.items) {
          const index = workflow.executions.items.findIndex((e) => e.id === id);
          if (index !== -1) {
            workflow.executions.items[index] = {
              ...workflow.executions.items[index],
              ...changes,
            };
          }
        }
      }
    },

    // Agents Usage Data
    updateAgentsWithUsage(state, action: PayloadAction<Record<string, any>>) {
      state.agentsUsageData = {
        ...state.agentsUsageData,
        ...action.payload,
      };
    },
    clearAgentsUsage(state) {
      state.agentsUsageData = {};
    },

    // Clear State
    clearState(state) {
      const user = state.user ? { ...state.user } : null;
      const accounts = state.accounts ? [...state.accounts] : [];
      Object.assign(state, initialState);
      state.user = user;
      state.accounts = accounts;
    },
  },
});

export default slice.reducer;

export const {
  // Loading & Error
  startLoading,
  stopLoading,
  hasError,

  // Global Vars
  openGlobalVarsMenu,
  closeGlobalVarsMenu,

  // Header
  showHeader,
  hideHeader,

  // WebSocket
  addWebSocketEvent,
  setWebSocketEvents,

  // Dialogs
  openPermissionDialog,
  closePermissionDialog,
  openCreateAltaner,
  closeCreateAltaner,

  // User
  setUser,

  // Stripe
  setActivationLink,
  setStripeAccount,
  setStripeDashboard,

  // Account
  setAccount,
  updateAccount,
  updateAccountCreditBalance,
  updateAccountMetadata,
  setAccounts,
  setFullAccountLoading,
  setFullAccountInitialized,

  // Roles
  setRoles,
  setRolesLoading,

  // Account Assets
  startAccountAttributeLoading,
  stopAccountAttributeLoading,
  setAccountAttribute,
  setAccountAttributeError,

  // Agents
  addAgent,
  patchAgent,
  deleteAgent,

  // Webhooks
  addWebhook,
  deleteWebhook,
  setWebhookEvents,

  // Attributes
  deleteAttribute,

  // Commands
  deleteCommand,

  // Members
  deleteMember,

  // API Tokens
  apiTokenCreated,
  apiTokenDeleted,

  // Subscriptions
  addSubscription,
  updateSubscription,
  deleteSubscription,

  // Altaners
  addAccountAltaner,
  updateAccountAltaner,
  deleteAccountAltaner,

  // Developer Apps
  addDeveloperApp,
  updateDeveloperApp,
  deleteDeveloperApp,

  // Custom Apps
  addApp,
  updateApp,
  deleteApp,

  // Action Types
  addActionType,
  updateActionType,
  deleteActionType,

  // Resource Types
  addResourceType,
  updateResourceType,
  deleteResourceType,

  // Connection Types
  updateConnectionTypeSuccess,

  // Interfaces
  addInterface,
  updateInterface,
  deleteInterface,

  // Interface Deployments
  addInterfaceDeployment,
  updateInterfaceDeployment,
  deleteInterfaceDeployment,

  // Interface Commits
  addInterfaceCommit,
  updateInterfaceCommit,
  deleteInterfaceCommit,

  // Workflow Executions
  addWorkflowExecution,
  updateWorkflowExecutions,
  updateWorkflowExecution,

  // Agents Usage
  updateAgentsWithUsage,
  clearAgentsUsage,

  // Clear
  clearState,
} = slice.actions;

