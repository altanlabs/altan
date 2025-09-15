import { createSelector, createSlice } from '@reduxjs/toolkit';
// utils
import { batch } from 'react-redux';

import { clearAltanerState } from './altaners';
import { clearConnectionsState } from './connections';
import { clearFlowState } from './flows';
import { clearGateState } from './gates';
import { clearMediaState } from './media';
import { clearNotificationsState } from './notifications';
import { clearSpacesState, stopSpacesLoading } from './spaces';
import { setNested } from '../../components/tools/dynamic/utils';
import { optimai, optimai_integration } from '../../utils/axios';
import { ALTAN_AGENT_TEMPLATE_IDS } from '../../utils/constants';
import { checkArraysEqualsProperties, checkObjectsEqual } from '../helpers/memoize';

// ----------------------------------------------------------------------

const initialState = {
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
  roles: {},
  account: {
    id: null,
    stripe_id: null,
    webhooks: [],
    forms: [],
    members: [],
    rooms: [],
    attributes: [],
    subscriptions: [],
    agents: [],
    gates: [],
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
    gates: false,
    forms: false,
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
    gates: false,
    forms: false,
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
    gates: null,
    forms: null,
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
    startLoading(state) {
      state.initialized = false;
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
    },
    hasError(state, action) {
      const e = action.payload;
      state.isLoading = false;
      state.error = e;
    },
    openGlobalVarsMenu(state, action) {
      const { position, context } = action.payload;
      state.globalVars.open = true;
      state.globalVars.position = position;
      state.globalVars.context = context;
    },
    showHeader(state) {
      state.headerVisible = true;
    },
    hideHeader(state) {
      state.headerVisible = false;
    },
    closeGlobalVarsMenu(state) {
      state.globalVars.open = false;
      state.globalVars.position = null;
      state.globalVars.context = null;
    },
    addWebSocketEvent(state, action) {
      state.webSocketEvents.push(action.payload);
    },
    setWebSocketEvents(state, action) {
      state.webSocketEvents = action.payload;
    },
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
    setUser(state, action) {
      state.user = action.payload;
    },
    setActivationLink(state, action) {
      state.stripeActivation = action.payload;
    },
    setStripeAccount(state, action) {
      state.stripeAccount = action.payload;
    },
    setStripeDashboard(state, action) {
      state.stripeDashboard = action.payload;
    },
    setFullAccountLoading(state, action) {
      state.generalLoading.account = !!action.payload;
    },
    setFullAccountInitialized(state, action) {
      state.generalInitialized.account = !!action.payload;
    },
    setAccount(state, action) {
      const account = action.payload;
      if (!state.account) {
        state.account = account;
      } else {
        for (const [k, v] of Object.entries(account)) {
          state.account[k] = v;
        }
      }
    },
    setRoles(state, action) {
      state.roles = action.payload;
      state.generalInitialized.roles = true;
    },
    setRolesLoading(state, action) {
      state.generalLoading.roles = !!action.payload;
    },
    startAccountAttributeLoading(state, action) {
      const key = action.payload;
      setNested(state.accountAssetsLoading, key, true);
      setNested(state.accountAssetsInitialized, key, false);
    },
    stopAccountAttributeLoading(state, action) {
      const key = action.payload;
      setNested(state.accountAssetsLoading, key, false);
    },
    setAccountAttributeError(state, action) {
      const { key, error } = action.payload;
      setNested(state.accountAssetsErrors, key, error);
    },
    setAccountAttribute(state, action) {
      const { key, value } = action.payload;
      if (!state.account) {
        state.account = {};
      }
      setNested(state.account, key, value);
      setNested(state.accountAssetsInitialized, key, true);
    },
    updateAccount(state, action) {
      const account = action.payload;
      state.account = account;
    },
    updateAccountMetadata(state, action) {
      const meta_data = action.payload;
      state.account.meta_data = meta_data;
    },
    setAccounts(state, action) {
      state.accounts = action.payload;
    },
    addAgent(state, action) {
      state.account.agents.push(action.payload);
    },
    addWebhook(state, action) {
      state.account.webhooks.push(action.payload);
    },
    addForm(state, action) {
      state.account.forms.push(action.payload);
    },
    patchForm(state, action) {
      const patchForm = action.payload;
      const form = state.account.forms.find((a) => a.id === patchForm.id);
      Object.assign(form, patchForm);
    },
    addFormResponses(state, action) {
      const { formId, responses } = action.payload;
      const form = state.account.forms.find((form) => form.id === formId);
      if (form) {
        form.responses = responses;
      }
    },
    patchAgent(state, action) {
      const patchedAgent = action.payload;
      const agent = state.account.agents.find((a) => a.id === patchedAgent.id);
      Object.assign(agent, patchedAgent);
    },
    deleteForm(state, action) {
      state.account.forms = state.account.forms.filter((f) => f.id !== action.payload);
    },
    deleteAgent(state, action) {
      state.account.agents = state.account.agents.filter((agent) => agent.id !== action.payload);
    },
    deleteAttribute(state, action) {
      state.account.attributes = state.account.attributes.filter((a) => a.id !== action.payload);
    },
    deleteWebhook(state, action) {
      state.account.webhooks = state.account.webhooks.filter((item) => item.id !== action.payload);
    },
    deleteCommand(state, action) {
      state.account.commands = state.account.commands.filter(
        (command) => command.id !== action.payload,
      );
    },
    deleteMember(state, action) {
      state.account.organisation.members = state.account.organisation.members.filter(
        (member) => member.id !== action.payload,
      );
    },
    apiTokenCreated(state, action) {
      state.account.apikeys.push(action.payload);
    },
    apiTokenDeleted(state, action) {
      state.account.apikeys = state.account.apikeys.filter((token) => token.id !== action.payload);
    },
    setWebhookEvents(state, action) {
      const { webhookId, events } = action.payload;
      const webhook = state.account.webhooks.find((w) => w.id === webhookId);
      if (webhook) {
        webhook.events = events;
      }
    },
    clearState(state) {
      const user = { ...(state.user || {}) };
      const accounts = [...(state.accounts ?? [])];
      Object.assign(state, initialState);
      state.user = user;
      state.accounts = accounts;
    },
    addSubscription(state, action) {
      if (!state.account.subscriptions) {
        state.account.subscriptions = [];
      }
      state.account.subscriptions.push(action.payload);
    },
    updateSubscription(state, action) {
      const index = state.account.subscriptions.findIndex((sub) => sub.id === action.payload.id);
      if (index !== -1) {
        state.account.subscriptions[index] = {
          ...state.account.subscriptions[index],
          ...action.payload,
        };
      }
    },
    deleteSubscription(state, action) {
      state.account.subscriptions = state.account.subscriptions.filter(
        (sub) => sub.id !== action.payload,
      );
    },
    addAccountAltaner(state, action) {
      const altaner = action.payload;
      state.account.altaners.push(altaner);
    },
    updateAccountAltaner(state, action) {
      const { ids, changes } = action.payload;
      ids.forEach((altanerId) => {
        const index = state.account.altaners.findIndex((a) => a.id === altanerId);
        if (index !== -1) {
          state.account.altaners[index] = { ...state.account.altaners[index], ...changes };
        }
      });
    },
    deleteAccountAltaner(state, action) {
      state.account.altaners = state.account.altaners.filter((a) => a.id !== action.payload);
    },
    addDeveloperApp(state, action) {
      state.account.developer_apps.push(action.payload);
    },
    updateDeveloperApp(state, action) {
      const { id, ...changes } = action.payload;
      const index = state.account.developer_apps.findIndex((app) => app.id === id);
      if (index !== -1) {
        state.account.developer_apps[index] = {
          ...state.account.developer_apps[index],
          ...changes,
        };
      }
    },
    deleteDeveloperApp(state, action) {
      state.account.developer_apps = state.account.developer_apps.filter(
        (app) => app.id !== action.payload,
      );
    },
    addApp(state, action) {
      state.account.apps.push(action.payload);
    },
    updateApp(state, action) {
      const { id, ...changes } = action.payload;
      const index = state.account.apps.findIndex((app) => app.id === id);
      if (index !== -1) {
        state.account.apps[index] = {
          ...state.account.apps[index],
          ...changes,
        };
      }
    },
    deleteApp(state, action) {
      state.account.apps = state.account.apps.filter((app) => app.id !== action.payload);
    },
    addActionType(state, action) {
      const { action_type } = action.payload;
      const { connection_type_id, connection_type } = action_type;
      const { app_id } = connection_type;

      const app = state.account.apps.find((app) => app.id === app_id);
      if (app) {
        const connectionType = app.connection_types.items.find(
          (ct) => ct.id === connection_type_id,
        );
        if (connectionType) {
          if (!Array.isArray(connectionType.actions)) {
            connectionType.actions = [];
          }
          connectionType.actions.push(action_type);
        }
      }
    },
    updateActionType(state, action) {
      const { connection_type_id, actionTypeId, changes } = action.payload;
      const app = state.account.apps.find((app) =>
        app.connection_types.items.some((ct) => ct.id === connection_type_id),
      );
      if (app) {
        const connectionType = app.connection_types.items.find(
          (ct) => ct.id === connection_type_id,
        );
        if (connectionType) {
          const actionType = connectionType.actions.find((at) => at.id === actionTypeId);
          if (actionType) {
            Object.assign(actionType, changes);
          }
        }
      }
    },
    deleteActionType(state, action) {
      const { connection_type_id, actionTypeId } = action.payload;
      const app = state.account.apps.find((app) =>
        app.connection_types.items.some((ct) => ct.id === connection_type_id),
      );
      if (app) {
        const connectionType = app.connection_types.items.find(
          (ct) => ct.id === connection_type_id,
        );
        if (connectionType && Array.isArray(connectionType.actions.items)) {
          connectionType.actions.items = connectionType.actions.items.filter(
            (at) => at.id !== actionTypeId,
          );
        }
      }
    },
    addResourceType(state, action) {
      const { resource_type } = action.payload;
      const { connection_type_id, connection_type } = resource_type;
      const { app_id } = connection_type;

      const app = state.account.apps.find((app) => app.id === app_id);
      if (app) {
        const connectionType = app.connection_types.items.find(
          (ct) => ct.id === connection_type_id,
        );
        if (connectionType?.resources?.items) {
          if (!connectionType.resources) {
            connectionType.resources = { items: [] };
          }
          if (!Array.isArray(connectionType.resources.items)) {
            connectionType.resources.items = [];
          }
          connectionType.resources.items.push(resource_type);
        }
      }
    },
    updateResourceType(state, action) {
      const { connection_type_id, resourceTypeId, changes } = action.payload;
      const app = state.account.apps.find((app) =>
        app.connection_types.items.some((ct) => ct.id === connection_type_id),
      );
      if (app) {
        const connectionType = app.connection_types.items.find(
          (ct) => ct.id === connection_type_id,
        );
        if (connectionType?.resources?.items) {
          if (!connectionType.resources) {
            connectionType.resources = { items: [] };
          }
          if (!Array.isArray(connectionType.resources.items)) {
            connectionType.resources.items = [];
          }
          const resourceType = connectionType.resources.items.find(
            (rt) => rt.id === resourceTypeId,
          );
          if (resourceType) {
            Object.assign(resourceType, changes);
          }
        }
      }
    },
    deleteResourceType(state, action) {
      const { connection_type_id, resourceTypeId } = action.payload;
      const app = state.account.apps.find((app) =>
        app.connection_types.items.some((ct) => ct.id === connection_type_id),
      );
      if (app) {
        const connectionType = app.connection_types.items.find(
          (ct) => ct.id === connection_type_id,
        );
        if (connectionType && Array.isArray(connectionType.resources.items)) {
          connectionType.resources.items = connectionType.resources.items.filter(
            (rt) => rt.id !== resourceTypeId,
          );
        }
      }
    },
    updateConnectionTypeSuccess: (state, action) => {
      const { connectionTypeId, connectionType } = action.payload;
      const app = state.account.apps.find((app) =>
        app.connection_types.items.some((ct) => ct.id === connectionTypeId),
      );
      if (app) {
        const index = app.connection_types.items.findIndex((ct) => ct.id === connectionTypeId);
        if (index !== -1) {
          app.connection_types.items[index] = connectionType;
        }
      }
    },
    addInterface(state, action) {
      if (!Array.isArray(state.account.interfaces)) {
        state.account.interfaces = [];
      }
      state.account.interfaces.push(action.payload);
    },
    updateInterface(state, action) {
      const { id, ...changes } = action.payload;
      const index = state.account.interfaces.findIndex((i) => i.id === id);
      if (index !== -1) {
        state.account.interfaces[index] = {
          ...state.account.interfaces[index],
          ...changes,
        };
      }
    },
    deleteInterface(state, action) {
      state.account.interfaces = state.account.interfaces.filter((i) => i.id !== action.payload);
    },
    addInterfaceDeployment(state, action) {
      const { id, interface_id, ...deploymentData } = action.payload;
      const interface_ = state.account.interfaces.find((i) => i.id === interface_id);

      if (interface_) {
        // Ensure deployments and deployments.items are initialized
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
    },
    updateInterfaceDeployment(state, action) {
      const { id, interface_id, vercel_deployment_id, search_all_interfaces, ...changes } = action.payload;
      console.log('Redux updateInterfaceDeployment called with:', { id, interface_id, vercel_deployment_id, search_all_interfaces, changes });
      
      let interface_ = null;
      let deploymentIndex = -1;
      
      // If we need to search all interfaces (interface_id is null)
      if (search_all_interfaces && !interface_id) {
        console.log('Searching all interfaces for deployment...');
        
        for (const iface of state.account.interfaces) {
          if (iface.deployments?.items) {
            // Try to find deployment by primary ID first
            let idx = iface.deployments.items.findIndex((d) => d.id === id);
            
            // If not found by primary ID, try to find by vercel deployment ID
            if (idx === -1 && vercel_deployment_id) {
              idx = iface.deployments.items.findIndex(
                (d) => d.meta_data?.deployment_info?.id === vercel_deployment_id,
              );
            }
            
            // If not found by either ID, try to find by deployment_id field
            if (idx === -1) {
              idx = iface.deployments.items.findIndex((d) => d.deployment_id === id);
            }
            
            if (idx !== -1) {
              interface_ = iface;
              deploymentIndex = idx;
              console.log('Found deployment in interface:', interface_.name, 'at index:', deploymentIndex);
              break;
            }
          }
        }
      } else {
        // Normal case: we have interface_id
        interface_ = state.account.interfaces.find((i) => i.id === interface_id);
        console.log('Found interface:', interface_?.name || 'NOT FOUND');
        
        if (interface_?.deployments?.items) {
          console.log('Existing deployments:', interface_.deployments.items.map(d => ({ id: d.id, deployment_id: d.deployment_id, vercel_id: d.meta_data?.deployment_info?.id })));
          
          // Try to find deployment by primary ID first
          deploymentIndex = interface_.deployments.items.findIndex((d) => d.id === id);
          console.log('Search by primary ID result:', deploymentIndex);

          // If not found by primary ID, try to find by vercel deployment ID
          if (deploymentIndex === -1 && vercel_deployment_id) {
            deploymentIndex = interface_.deployments.items.findIndex(
              (d) => d.meta_data?.deployment_info?.id === vercel_deployment_id,
            );
            console.log('Search by vercel ID result:', deploymentIndex);
          }

          // If not found by either ID, try to find by deployment_id field
          if (deploymentIndex === -1) {
            deploymentIndex = interface_.deployments.items.findIndex((d) => d.deployment_id === id);
            console.log('Search by deployment_id field result:', deploymentIndex);
          }
        }
      }
      
      if (interface_ && deploymentIndex !== -1) {
        console.log('Updating existing deployment at index:', deploymentIndex);
        interface_.deployments.items[deploymentIndex] = {
          ...interface_.deployments.items[deploymentIndex],
          ...changes,
          id: interface_.deployments.items[deploymentIndex].id, // Keep original ID
          interface_id: interface_.id, // Use the found interface ID
        };
      } else if (interface_id && interface_) {
        console.log('Creating new deployment');
        // If still not found but we have interface_id, create new deployment
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
      } else {
        console.log('Could not find interface or deployment to update');
      }
    },
    deleteInterfaceDeployment(state, action) {
      const deploymentId = action.payload;
      const interface_ = state.account.interfaces.find((i) =>
        i.deployments?.items?.some((d) => d.id === deploymentId),
      );
      if (interface_?.deployments?.items) {
        interface_.deployments.items = interface_.deployments.items.filter(
          (d) => d.id !== deploymentId,
        );
      }
    },
    addWorkflowExecution: (state, action) => {
      const execution = action.payload;
      const workflowId = execution.workflow_id;

      // Initialize if needed
      if (!state.workflowExecutions[workflowId]) {
        state.workflowExecutions[workflowId] = [];
      }

      // Add to both places for backward compatibility
      state.workflowExecutions[workflowId].unshift(execution);

      // Update in workflows array too
      const workflow = state.account.workflows.find((w) => w.id === workflowId);
      if (workflow) {
        if (!workflow.executions) {
          workflow.executions = { items: [] };
        }
        workflow.executions.items.unshift(execution);
      }

      // Keep only last 100 executions
      if (state.workflowExecutions[workflowId].length > 100) {
        state.workflowExecutions[workflowId].pop();
      }
    },
    updateWorkflowExecutions: (state, action) => {
      const workflowsWithExecutions = action.payload;
      if (state.account?.workflows) {
        workflowsWithExecutions.forEach((workflow) => {
          if (workflow.executions?.items) {
            const workflowIndex = state.account.workflows.findIndex((w) => w.id === workflow.id);
            if (workflowIndex !== -1) {
              state.account.workflows[workflowIndex].executions = {
                items: workflow.executions.items,
              };
              // Store in our new workflowExecutions object
              state.workflowExecutions[workflow.id] = workflow.executions.items;
            }
          }
        });
      }
      state.workflowExecutionsInitialized = true;
    },
    updateWorkflowExecution: (state, action) => {
      const { id, changes } = action.payload;
      const workflowId = changes.workflow_id;

      if (state.workflowExecutions[workflowId]) {
        const index = state.workflowExecutions[workflowId].findIndex((e) => e.id === id);
        if (index !== -1) {
          state.workflowExecutions[workflowId][index] = {
            ...state.workflowExecutions[workflowId][index],
            ...changes,
          };
        }
      }

      // Update in workflows array too for backward compatibility
      const workflow = state.account.workflows?.find((w) => w.id === workflowId);
      if (workflow?.executions?.items) {
        const index = workflow.executions.items.findIndex((e) => e.id === id);
        if (index !== -1) {
          workflow.executions.items[index] = {
            ...workflow.executions.items[index],
            ...changes,
          };
        }
      }
    },
    updateAgentsWithUsage: (state, action) => {
      state.agentsUsageData = {
        ...state.agentsUsageData,
        ...action.payload,
      };
    },
    clearAgentsUsage(state) {
      state.agentsUsageData = {};
    },
    addInterfaceCommit(state, action) {
      const { id, interface_id, ...commitData } = action.payload;
      const interface_ = state.account.interfaces.find((i) => i.id === interface_id);

      if (interface_) {
        // Ensure commits and commits.items are initialized
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
    },
    updateInterfaceCommit(state, action) {
      const { id, interface_id, ...changes } = action.payload;
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
    },
    deleteInterfaceCommit(state, action) {
      const commitId = action.payload;
      const interface_ = state.account.interfaces.find((i) =>
        i.commits?.items?.some((c) => c.id === commitId),
      );
      if (interface_?.commits?.items) {
        interface_.commits.items = interface_.commits.items.filter((c) => c.id !== commitId);
      }
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  openGlobalVarsMenu,
  closeGlobalVarsMenu,
  addAccountAltaner,
  updateAccountAltaner,
  deleteAccountAltaner,
  addWebSocketEvent,
  setWebSocketEvents,
  setUser,
  setAccount,
  setAccounts,
  updateAccount,
  deleteAgent,
  addWebhook,
  deleteWebhook,
  deleteForm,
  addForm,
  patchForm,
  addAgent,
  openPermissionDialog,
  closePermissionDialog,
  openCreateAltaner,
  closeCreateAltaner,
  setWebhookEvents,
  clearState: clearGeneralState,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  addDeveloperApp,
  updateDeveloperApp,
  deleteDeveloperApp,
  addApp,
  updateApp,
  deleteApp,
  addActionType,
  updateActionType,
  deleteActionType,
  addResourceType,
  updateResourceType,
  deleteResourceType,
  updateConnectionTypeSuccess,
  hideHeader,
  showHeader,
  addInterface,
  updateInterface,
  deleteInterface,
  addInterfaceDeployment,
  updateInterfaceDeployment,
  deleteInterfaceDeployment,
  addWorkflowExecution,
  updateWorkflowExecutions,
  updateWorkflowExecution,
  updateAgentsWithUsage,
  clearAgentsUsage,
  addInterfaceCommit,
  updateInterfaceCommit,
  deleteInterfaceCommit,
  startAccountAttributeLoading,
  stopAccountAttributeLoading,
  setAccountAttribute,
  setAccountAttributeError,
} = slice.actions;

// ----------------------------------------------------------------------

// SELECTORS

const selectGeneralState = (state) => state.general;

export const selectUser = (state) => selectGeneralState(state).user;

export const selectGlobalVars = (state) => selectGeneralState(state).globalVars;

export const selectHeaderVisible = (state) => selectGeneralState(state).headerVisible;

export const selectAccount = (state) => selectGeneralState(state).account;

export const selectAccountId = (state) => selectGeneralState(state).account.id;

export const selectAccountCreditBalance = (state) => selectGeneralState(state).account.credit_balance;

export const selectAccountAssetsInitialized = (key) => (state) =>
  selectGeneralState(state).accountAssetsInitialized[key];

export const selectAccountAssetsLoading = (key) => (state) =>
  selectGeneralState(state).accountAssetsLoading[key];

export const selectGeneralInitialized = (key) => (state) =>
  selectGeneralState(state).generalInitialized[key];

export const selectGeneralLoading = (key) => (state) =>
  selectGeneralState(state).generalLoading[key];

export const selectRoles = (state) => selectGeneralState(state).roles;

export const selectAccountSubscriptions = (state) => selectAccount(state).subscriptions;

// Free plan ID constant
const FREE_PLAN_ID = 'a13e9a2b-f4c7-485c-8394-64e46bc7bf11';

export const selectIsAccountFree = createSelector(
  [selectAccountSubscriptions],
  (subscriptions) => {
    if (!subscriptions || subscriptions.length === 0) {
      return true; // No subscriptions means free account
    }

    // Check if any active subscription is the free plan
    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing',
    );

    if (!activeSubscription) {
      return true; // No active subscription means free account
    }

    const billingOptionId = activeSubscription?.billing_option_id;
    // Check billing_option_id instead of plan.id
    const isFree = billingOptionId === FREE_PLAN_ID;

    return isFree;
  },
  {
    memoizeOptions: {
      resultEqualityCheck: (a, b) => a === b,
    },
  },
);

export const selectHasGrowthSubscription = createSelector(
  [selectAccountSubscriptions],
  (subscriptions) => {
    if (!subscriptions || subscriptions.length === 0) {
      return false; // No subscriptions means no Growth plan
    }

    // Check if any active subscription is a Growth plan
    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing',
    );

    if (!activeSubscription) {
      return false; // No active subscription means no Growth plan
    }

    const planName = activeSubscription?.billing_option?.plan?.name;
    // Check if the plan name starts with "Growth"
    return planName && planName.startsWith('Growth');
  },
  {
    memoizeOptions: {
      resultEqualityCheck: (a, b) => a === b,
    },
  },
);

export const selectCustomApps = (state) => selectAccount(state).apps;

export const selectCustomConnectionTypes = createSelector(
  [selectCustomApps],
  (apps) => apps.flatMap((app) => app.connection_types.items),
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  },
);

export const selectSortedAgents = createSelector(
  [selectAccount],
  (account) => {
    const agents = account?.agents;
    if (!agents) return [];

    // Filter out agents cloned from Altan's official templates
    const filteredAgents = agents.filter((agent) => {
      return !(
        agent?.cloned_from?.version?.template_id &&
        ALTAN_AGENT_TEMPLATE_IDS.includes(agent.cloned_from.version.template_id)
      );
    });

    return filteredAgents.sort((a, b) => a.name.localeCompare(b.name));
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  },
);

export const selectAccountDetails = createSelector(
  [selectAccount],
  (account) =>
    !!account
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
  },
);

export const selectAccounts = (state) => selectGeneralState(state).accounts;

export const selectAccountRooms = (state) => selectAccount(state).rooms;

export const selectAccountConnections = (state) => selectAccount(state).connections;

export const selectNav = createSelector(
  [selectAccount],
  (account) =>
    account.meta_data?.nav || [
      'view_flows',
      'view_agents',
      'view_bases',
      'view_forms',
      'view_interfaces',
    ],
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  },
);

export const selectForms = createSelector(
  [selectAccount],
  (account) => {
    // Defensive check: ensure account and forms exist
    if (!account || !Array.isArray(account.forms)) {
      console.warn('selectForms: account.forms is not available or not an array:', { account, forms: account?.forms });
      return [];
    }

    return account.forms.map((f) => ({ details: f, resource_type_id: 'form' }));
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  },
);

export const selectTables = createSelector(
  [selectAccount],
  (account) => {
    // Defensive check: ensure account and bases exist
    if (!account || !Array.isArray(account.bases)) {
      console.warn('selectTables: account.bases is not available or not an array:', { account, bases: account?.bases });
      return [];
    }

    return account.bases.flatMap((base) =>
      (base?.tables?.items || []).map((table) => ({
        details: { ...table, base_id: base.id },
        resource_type_id: 'table',
      })),
    );
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  },
);

// rooms

export const selectRoomByExternalId = (externalId) =>
  createSelector(
    [selectAccount],
    (account) => account.rooms.find((room) => room.external_id === externalId),
    {
      memoizeOptions: {
        resultEqualityCheck: checkObjectsEqual,
      },
    },
  );

export const selectRooms = createSelector(
  [selectAccount],
  (account) => {
    // Defensive check: ensure account and rooms exist
    if (!account || !Array.isArray(account.rooms)) {
      console.warn('selectRooms: account.rooms is not available or not an array:', { account, rooms: account?.rooms });
      return [];
    }

    return account.rooms.map((r) => ({ details: r, resource_type_id: 'room' }));
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  },
);

export const selectGates = createSelector(
  [selectAccount],
  (account) => {
    // Defensive check: ensure account and gates exist
    if (!account || !Array.isArray(account.gates)) {
      console.warn('selectGates: account.gates is not available or not an array:', { account, gates: account?.gates });
      return [];
    }

    return account.gates.map((r) => ({ details: r, resource_type_id: 'gate' }));
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  },
);

export const selectApps = createSelector(
  [selectAccount],
  (account) => {
    // Defensive check: ensure account and apps exist
    if (!account || !Array.isArray(account.apps)) {
      console.warn('selectApps: account.apps is not available or not an array:', { account, apps: account?.apps });
      return [];
    }

    return account.apps.map((app) => ({
      details: {
        ...app,
        // Include connection types directly in the app details
        connection_types: app.connection_types?.items || [],
      },
      resource_type_id: 'app',
    }));
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  },
);

export const selectExtendedResources = createSelector(
  [
    selectRooms,
    selectForms,
    selectGates,
    selectTables,
    selectAccountId,
    (state, internal = false) => internal,
  ],
  (rooms, forms, gates, tables, accountId, internal) =>
    !internal
      ? []
      : [
          ...rooms,
          ...forms,
          ...gates,
          ...tables,
          { details: { id: accountId, name: 'This Workspace' }, resource_type_id: 'account' },
        ],
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  },
);

const selectInterfaces = (state) => selectAccount(state)?.interfaces;

export const makeSelectInterfaceById = () =>
  createSelector(
    [selectInterfaces, (state, interfaceId) => interfaceId],
    (interfaces, interfaceId) => interfaces?.find((i) => i.id === interfaceId) || null,
  );

// Selector to get the current commit SHA
export const makeSelectCurrentCommitSha = () =>
  createSelector(
    [makeSelectInterfaceById()],
    (ui) => ui?.meta_data?.current_commit?.sha?.trim() || null,
  );

// Selector to get sorted commits list
export const makeSelectSortedCommits = () =>
  createSelector([makeSelectInterfaceById()], (ui) => {
    const commits = ui?.commits?.items || [];
    return [...commits].sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
  });

export const selectWorkflowExecutions = (workflowId) => (state) =>
  state.general.workflowExecutions[workflowId] || [];

export const selectWorkflowExecutionsInitialized = (state) =>
  state.general.workflowExecutionsInitialized;

const ACCOUNT_GQ = {
  '@fields': '@all',
  user: {
    '@fields': ['id', 'email'],
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
  gates: {
    '@fields': ['@base@exc:meta_data', 'name'],
  },
  agents: {
    '@fields': ['id', 'name', 'date_creation', 'avatar_url', 'cloned_template_id', 'is_pinned'],
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

const KEY_MAPPING = {
  subscriptions: 'subscriptions',
  apikeys: 'apikeys',
  agents: 'agents',
  connections: 'connections',
  workflows: 'workflows',
  webhooks: 'webhooks',
  forms: 'forms',
  gates: 'gates',
  altaners: 'altaners',
  // payments: 'payments',
  // DEFAULT
  organisation: 'organisation',
  owner: 'user',
  developer_apps: 'developer_apps',
  apps: 'apps',
  interfaces: 'interfaces',
};

const FILTER_ACCOUNT_GQ = (keys, accountFields = '@all') => {
  const adaptedKeys = keys.map((k) => KEY_MAPPING[k]);
  const finalAccObject = {
    '@fields': accountFields,
  };
  for (const [k, v] of Object.entries(ACCOUNT_GQ).filter(([k]) => adaptedKeys.includes(k))) {
    finalAccObject[k] = v;
  }
  return finalAccObject;
};

// ACCOUNT ----------------------------------------------------------------------

export const getAccountAttribute = (selectedAccountId, keys) => async (dispatch, getState) => {
  if (!keys?.length) {
    return;
  }
  const state = getState();
  const accountAssetsLoading = state.general.accountAssetsLoading;
  const accountAssetsInitialized = state.general.accountAssetsInitialized;
  const filteredKeys = keys.filter((k) => !accountAssetsInitialized[k] && !accountAssetsLoading[k]);

  if (!filteredKeys?.length) {
    return;
  }
  batch(() => {
    for (const k of keys) {
      dispatch(slice.actions.startAccountAttributeLoading(k));
    }
  });
  try {
    const accountId = state.general.account?.id;
    const finalAccount = selectedAccountId || accountId;
    const response = await optimai.post(
      `/account/${finalAccount}/gq`,
      FILTER_ACCOUNT_GQ(keys, 'id'),
    );
    const accountBody = response.data;
    if (accountBody?.id !== finalAccount) {
      throw Error('invalid account!');
    }
    batch(() => {
      for (const key of keys) {
        dispatch(
          slice.actions.setAccountAttribute({
            key,
            value: accountBody[KEY_MAPPING[key]]?.items ?? [],
          }),
        );
      }
    });
  } catch (e) {
    console.error(`error: could not get account: ${e}`);
    for (const key of keys) {
      dispatch(slice.actions.setAccountAttributeError({ key, error: e.toString() }));
    }
  } finally {
    batch(() => {
      for (const key of keys) {
        dispatch(slice.actions.stopAccountAttributeLoading(key));
      }
    });
  }
};

export const getAccountMembers = (selectedAccountId) => async (dispatch, getState) => {
  const state = getState();
  const accountAssetsLoading = state.general.accountAssetsLoading;
  const accountAssetsInitialized = state.general.accountAssetsInitialized;
  const filteredKeys = ['members'].filter(
    (k) => !accountAssetsInitialized[k] && !accountAssetsLoading[k],
  );
  if (!filteredKeys?.length) {
    return;
  }
  dispatch(slice.actions.startAccountAttributeLoading('members'));
  try {
    const accountId = state.general.account?.id;
    const finalAccount = selectedAccountId || accountId;
    const response = await optimai.get(`/account/${finalAccount}/users`);
    const value = response.data?.members ?? [];
    dispatch(slice.actions.setAccountAttribute({ key: 'members', value }));
  } catch (e) {
    console.error(`error: could not get account users: ${e}`);
    dispatch(slice.actions.setAccountAttributeError({ key: 'members', error: e.toString() }));
  } finally {
    dispatch(slice.actions.stopAccountAttributeLoading('members'));
  }
};

export const getAccount = (selectedAccountId) => async (dispatch, getState) => {
  const state = getState();
  const accountInitialized = state.general.generalInitialized.account;
  const accountLoading = state.general.generalLoading.account;
  if (accountInitialized || accountLoading) {
    return;
  }
  dispatch(slice.actions.setFullAccountLoading(true));
  try {
    const accountId = state.general.account?.id;
    const finalAccount = selectedAccountId || accountId;
    const response = await optimai.post(
      `/account/${finalAccount}/gq`,
      FILTER_ACCOUNT_GQ(['organisation', 'user', 'company']),
    );
    const accountBody = response.data;
    if (accountBody?.id !== finalAccount) {
      throw Error('invalid account!');
    }
    batch(() => {
      const organisation = accountBody?.organisation || {};
      dispatch(
        slice.actions.setAccount({
          id: accountBody?.id,
          name: accountBody?.name,
          credit_balance: accountBody?.credit_balance,
          stripe_id: accountBody?.stripe_id,
          room_id: accountBody.room_id,
          logo_url: accountBody?.logo_url,
          organisation_id: organisation?.id,
          organisation,
          meta_data: accountBody?.meta_data || {},
          owner: accountBody.user,
          stripe_connect_id: accountBody?.stripe_connect_id,
        }),
      );
      dispatch(slice.actions.setFullAccountInitialized(true));
      dispatch(stopSpacesLoading());
    });
    return Promise.resolve('success');
  } catch (e) {
    const messageErr = `error: could not get account: ${e}`;
    console.error(messageErr);
    dispatch(slice.actions.hasError(e.toString()));
    return Promise.reject(messageErr);
  } finally {
    dispatch(slice.actions.setFullAccountLoading(false));
  }
};

export const createAccount = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai.post('/account/new', data);
    return response;
  } catch (e) {
    console.error(`error: could not update info: ${e}`);
    dispatch(slice.actions.hasError(e.toString()));
    return Promise.reject(e.toString());
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const onboardAccount = (data) => async (dispatch, getState) => {
  const { account } = getState().general;
  try {
    const response = await optimai.patch(`/account/${account.id}/onboarding`, data);
    const {
      // account: updatedAccount,
      chatbot_id: chatbot_id,
    } = response.data;
    return chatbot_id;
  } catch (e) {
    console.error(`error: could not update info: ${e}`);
    dispatch(slice.actions.hasError(e.toString()));
    return Promise.reject(e.toString());
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

// ----------------------------------------------------------------------

export const getAccountCompany = () => async (dispatch, getState) => {
  try {
    const { account } = getState().general;
    const response = await optimai.post(`/account/${account.id}/gq`, {
      '@fields': ['id'],
    });
    dispatch(slice.actions.replaceAccountCompany(response.data));
  } catch (e) {
    console.error(`error: could not get account: ${e}`);
    dispatch(slice.actions.hasError(e.toString()));
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

// ----------------------------------------------------------------------

export const createAccountResource =
  (resource_name, payload, reducer) => async (dispatch, getState) => {
    try {
      const response = await optimai.post(`/utils/${resource_name}`, payload);
      // if (!!reducer) {
      //   console.log("dispatching reducert")
      //   dispatch(reducer(resource_id));
      // }
      return Promise.resolve(response);
    } catch (e) {
      console.error(`error: could not delete ${resource_name}: ${e}`);
      return Promise.reject(e);
    }
  };

export const deleteAccountResource = (resource_name, resource_id, reducer) => async (dispatch) => {
  try {
    const response = await optimai.delete(`/graph/${resource_name}/${resource_id}`);
    if (!!reducer) {
      dispatch(reducer(resource_id));
    }
    return Promise.resolve(response);
  } catch (e) {
    console.error(`error: could not delete ${resource_name}: ${e}`);
    return Promise.reject(e);
  }
};

export const deleteAccountAgent = (agentId) => async (dispatch) => {
  try {
    const response = await optimai.delete(`/agent/${agentId}`);
    dispatch(deleteAgent(agentId));
    return Promise.resolve(response);
  } catch (e) {
    console.error(`error: could not delete agent ${agentId}: ${e}`);
    return Promise.reject(e);
  }
};

export const duplicateAgent = (agentId, componentId) => async (dispatch) => {
  try {
    const response = await optimai.delete(
      `/agent/${agentId}/duplicate?altaner_component_id=${componentId}`,
    );
    return Promise.resolve(response);
  } catch (e) {
    console.error(`error: could not delete agent ${agentId}: ${e}`);
    return Promise.reject(e);
  }
};

export const deleteOrganisationUser = (org_id, user_id) => async (dispatch) => {
  try {
    const response = await optimai.delete(`/org/${org_id}/remove/${user_id}`);
    dispatch(slice.actions.deleteOrganisationUser(user_id));
    return Promise.resolve(response);
  } catch (e) {
    console.error(`error: could not delete organisation user: ${e}`);
    return Promise.reject(e);
  }
};

export const updateAccountCompany = (data) => async (dispatch, getState) => {
  const { account } = getState().general;
  try {
    const response = await optimai.patch(`/account/${account.id}/company`, data);
    await dispatch(getAccountCompany());

    return Promise.resolve(response);
  } catch (e) {
    console.error(`error: could not update info: ${e}`);
    dispatch(slice.actions.hasError(e.toString()));
    return Promise.reject(e.toString());
  } finally {
  }
};

export const addAccountAddress = (data) => async (dispatch, getState) => {
  const { account } = getState().general;
  try {
    const response = await optimai.post(`/account/${account.id}/company/address`, data);
    await dispatch(getAccountCompany());

    return Promise.resolve(response.data);
  } catch (e) {
    console.error(`error: could not update info: ${e}`);
    dispatch(slice.actions.hasError(e.toString()));
    return Promise.reject(e.toString());
  } finally {
  }
};

export const updateAccountMeta = (accountId, data) => async (dispatch) => {
  try {
    const response = await optimai.patch(`/account/${accountId}`, {
      patches: [{ key: 'meta_data', value: data }],
    });
    const { account: updatedAccount } = response.data;
    dispatch(slice.actions.updateAccountMetadata(updatedAccount.meta_data));
    return Promise.resolve(updatedAccount);
  } catch (e) {
    console.error(`error: could not update info: ${e}`);
    dispatch(slice.actions.hasError(e.toString()));
    return Promise.reject(e.toString());
  } finally {
  }
};

export const updateUserInfo = (data) => async (dispatch, getState) => {
  const { user } = getState().general;
  if (!user) {
    return;
  }
  try {
    const response = await optimai.patch(`/user/${user.id}/update`, data);
    return Promise.resolve(response.data);
  } catch (e) {
    console.error(`error: could not update info: ${e}`);
    dispatch(slice.actions.hasError(e.toString()));
    return Promise.reject(e.toString());
  } finally {
  }
};

//  INVITATIONS -----------------------------------------------------------------------------------------

export const getRoles = () => async (dispatch, getState) => {
  const state = getState();
  const rolesInitialized = state.general.generalInitialized.roles;
  const rolesLoading = state.general.generalLoading.roles;
  if (rolesInitialized || rolesLoading) {
    return;
  }
  try {
    dispatch(slice.actions.setRolesLoading(true));
    const response = await optimai.get('/org/roles/info');

    const { roles } = response.data;
    dispatch(
      slice.actions.setRoles(
        roles.reduce(
          (acc, r) => {
            acc.byName[r.name] = r.id;
            acc.byId[r.id] = r;
            return acc;
          },
          {
            byName: {},
            byId: {},
          },
        ),
      ),
    );
    return Promise.resolve(roles);
  } catch (e) {
    console.error(`error: could not get roles: ${e}`);
    return Promise.reject(e);
  } finally {
    dispatch(slice.actions.setRolesLoading(false));
  }
};

// ... existing code ...
export const createInvitation =
  (inviteMode, mode, roleIds, name, email, meta_data) => async (dispatch, getState) => {
    const account = selectAccount(getState());
    if (!account || (inviteMode === 'organisation' && !account?.organisation_id)) {
      return Promise.reject('invalid invitation destination (bad workspace or organisation)');
    }

    try {
      const response = await optimai.post(
        `/${inviteMode === 'workspace' ? `account/${account?.id}` : `org/${account?.organisation_id}`}/invite`,
        {
          mode: mode === 'link' ? 'link' : 'email',
          role_ids: roleIds,
          email: mode === 'email' ? email : undefined,
          name: mode === 'email' ? name : undefined,
          meta_data: mode === 'link' ? meta_data : undefined,
        },
      );
      return response.data;
    } catch (e) {
      console.error(`error: could not create invitation: ${e}`);
      return Promise.reject(e);
    }
  };
// ... existing code ...
export const createFlow = (data, prompt, altaner_component_id) => async (dispatch, getState) => {
  const { account } = getState().general;
  let url = `/account/${account.id}/flow`;

  // Build query parameters
  const params = [];
  if (prompt) {
    params.push(`prompt=${encodeURIComponent(prompt)}`);
  }
  if (altaner_component_id) {
    params.push(`altaner_component_id=${encodeURIComponent(altaner_component_id)}`);
  }

  // Add query parameters to URL if any exist
  if (params.length > 0) {
    url = `${url}?${params.join('&')}`;
  }

  const response = await optimai.post(url, data);
  return response.data.flow;
};

//  API Tokens -----------------------------------------------------------------------------------------

export const createAPIToken = (tokenDetails) => async (dispatch, getState) => {
  const { account } = getState().general;
  const response = await optimai.post(`/account/${account.id}/api-token`, tokenDetails);
  // Dispatch a success action with the new token
  const { token, api_key } = response.data;
  dispatch(slice.actions.apiTokenCreated(api_key));
  return Promise.resolve(token);
};

export const deleteAPIToken = (tokenId) => async (dispatch) => {
  const response = await optimai.delete(`/apikey/${tokenId}`);
  // Dispatch a success action with the token id
  dispatch(slice.actions.apiTokenDeleted(tokenId));
  return response.data;
};

export const fetchAPIToken = (tokenId) => async (dispatch) => {
  try {
    const response = await optimai.get(`/apikey/${tokenId}`);
    const { token } = response.data;
    return token;
  } catch (e) {
    console.error(`error: could not update info: ${e}`);
    dispatch(slice.actions.hasError(e.toString()));
    return Promise.reject(e.toString());
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

//  AGENTS -----------------------------------------------------------------------------------------

export const createAgent = (data) => async (dispatch, getState) => {
  const { account } = getState().general;
  try {
    const response = await optimai.post(`/account/${account.id}/agent`, data);
    const { agent } = response.data;
    dispatch(slice.actions.addAgent(agent));
    return agent;
  } catch (e) {
    console.error(`error: could not create agent: ${e}`);
    dispatch(slice.actions.hasError({ fileId: null, error: e.toString() }));
    return Promise.reject(e.toString());
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const updateAgent = (agentId, data) => async (dispatch) => {
  try {
    const response = await optimai.patch(`/agent/${agentId}`, data);
    const { agent } = response.data;
    dispatch(slice.actions.patchAgent(agent));
    return Promise.resolve(agent);
  } catch (e) {
    if (e.response && e.response.data && e.response.data.detail) {
      return Promise.reject(e.response.data.detail);
    } else {
      return Promise.reject(e.message);
    }
  }
};

//  forms -----------------------------------------------------------------------------------------

export const createForm = (data) => async (dispatch, getState) => {
  try {
    const { account } = getState().general;
    const response = await optimai.post(`/account/${account.id}/form`, data);
    const { form } = response.data;
    return form;
  } catch (e) {
    if (e.response && e.response.data && e.response.data.detail) {
      return Promise.reject(e.response.data.detail);
    } else {
      return Promise.reject(e.message);
    }
  }
};

export const updateForm = (formId, data) => async () => {
  try {
    const response = await optimai.patch(`/form/${formId}`, data);
    const { field } = response.data;
    return Promise.resolve(field);
  } catch (e) {
    if (e.response && e.response.data && e.response.data.detail) {
      return Promise.reject(e.response.data.detail);
    } else {
      return Promise.reject(e.message);
    }
  }
};

export const fetchFormResponses = (formId) => async (dispatch) => {
  try {
    const response = await optimai.get(`/form/${formId}/responses`);
    const { form_responses } = response.data;
    dispatch(slice.actions.addFormResponses({ formId: formId, responses: form_responses }));
    return Promise.resolve(form_responses);
  } catch (e) {
    console.error(`error: could not update info: ${e}`);
    dispatch(slice.actions.hasError(e.toString()));
    return Promise.reject(e.toString());
  } finally {
  }
};

//  webhooks -----------------------------------------------------------------------------------------

export const createWebhook = (data) => async (dispatch, getState) => {
  const accountId = selectAccountId(getState());
  try {
    const response = await optimai.post(`/account/${accountId}/hook`, data);
    const { hook } = response.data;
    return Promise.resolve(hook);
  } catch (e) {
    if (e.response && e.response.data && e.response.data.detail) {
      return Promise.reject(e.response.data.detail);
    } else {
      return Promise.reject(e.message);
    }
  }
};

export const fetchWebhookEvents = (webhookId) => async (dispatch, getState) => {
  try {
    const { account } = getState().general;
    const response = await optimai.post(`/account/${account.id}/gq`, {
      '@fields': ['id'],
      webhooks: {
        '@fields': ['id'],
        '@filter': { id: { _eq: webhookId } },
        events: {
          '@fields': '@all',
        },
      },
    });

    const webhook = response.data.webhooks.items[0];
    if (webhook && webhook.events) {
      dispatch(setWebhookEvents({ webhookId, events: webhook.events.items }));
    }

    return Promise.resolve(webhook?.events?.items || []);
  } catch (e) {
    +console.error(`error: could not fetch webhook events: ${e}`);
    return Promise.reject(e.toString());
  }
};

//  marketplace -----------------------------------------------------------------------------------------

export const publishAgent = (data) => async () => {
  try {
    const response = await optimai.post('/templates/agent', data);
    const { template } = response.data;
    return Promise.resolve(template);
  } catch (e) {
    if (e.response && e.response.data && e.response.data.detail) {
      return Promise.reject(e.response.data.detail);
    } else {
      return Promise.reject(e.message);
    }
  }
};

export const cloneTemplate =
  (templateId, data, timeout = 0) =>
  async () => {
    try {
      const response = await optimai.post(`/clone/${templateId}?timeout=${timeout}`, data);
      const { clone } = response.data;
      // console.log(clone);
      return clone.id;
    } catch (e) {
      return Promise.reject(e);
    }
  };

//  TEMPLATES -----------------------------------------------------------------------------------------

export const createTemplate = (data) => async () => {
  // console.log("@createTemplate", data)
  if (!data?.entity_type) {
    return Promise.reject('invalid entity type or id');
  }
  if (!data?.id) {
    return Promise.reject(`invalid ${data.entity_type} id`);
  }
  try {
    const response = await optimai.post('/templates/', data);
    const { template } = response.data;
    return Promise.resolve(template);
  } catch (e) {
    console.error(`error: could not create ${data.entity_type} template: ${e.message}`);
    return Promise.reject(e);
  }
};

export const createTemplateVersion = (templateId, data) => async (dispatch) => {
  if (!data?.version?.version_type) {
    return Promise.reject('select a version type (patch, minor, major or prerelease)');
  }
  if (data.version.version_type === 'prerelease' && !data.version.prerelease) {
    return Promise.reject('select a valid prerelease identifier');
  }
  if (!templateId) {
    return Promise.reject('invalid template to push version');
  }
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai.post(`/templates/${templateId}/version`, data);
    const { template_version } = response.data;
    return Promise.resolve(template_version);
  } catch (e) {
    console.error(`error: could not publish template version: ${e.message}`);
    dispatch(slice.actions.hasError(e.message));
    return Promise.reject(e);
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const markTemplateVersionAsSelected = (templateId, templateVersionId) => async () => {
  if (!templateVersionId || !templateId) {
    return Promise.reject(`invalid template version to delete: ${templateVersionId}`);
  }
  try {
    await optimai.patch(`/templates/${templateId}/versions/${templateVersionId}/appoint`);
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not delete template version: ${e.message}`);
    return Promise.reject(e);
  }
};

export const deleteTemplateVersion = (templateVersionId) => async () => {
  if (!templateVersionId) {
    return Promise.reject(`invalid template version to delete: ${templateVersionId}`);
  }
  try {
    await optimai.delete(`/templates/versions/${templateVersionId}`);
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not delete template version: ${e.message}`);
    return Promise.reject(e);
  }
};

export const updateTemplate = (templateId, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await optimai.patch(`/templates/${templateId}`, data);
    return Promise.resolve(response);
  } catch (e) {
    console.error(`error: could not create altaner template: ${e.message}`);
    dispatch(slice.actions.hasError(e.message));
    throw e;
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const createCustomApp = (payload) => async (dispatch, getState) => {
  try {
    const { account } = getState().general;

    const response = await optimai_integration.post(`/account/${account.id}/custom-app`, payload);
    const { app } = response.data;

    dispatch(slice.actions.addApp(app));

    return Promise.resolve(response);
  } catch (e) {
    console.error(`error: could not create custom app: ${e}`);
    return Promise.reject(e);
  }
};

export const removeApp = (appId) => async (dispatch) => {
  try {
    const response = await optimai_integration.delete(`/app/${appId}`);
    dispatch(slice.actions.deleteApp(appId));
    return Promise.resolve(response);
  } catch (e) {
    console.error(`error: could not create custom app: ${e}`);
    return Promise.reject(e);
  }
};

export const updateConnectionType = (connectionTypeId, payload) => async (dispatch) => {
  try {
    const response = await optimai_integration.patch(
      `/connection-type/${connectionTypeId}`,
      payload,
    );
    const { connection_type } = response.data;
    dispatch(updateConnectionTypeSuccess({ connectionTypeId, connectionType: connection_type }));
    return Promise.resolve(response);
  } catch (e) {
    console.error(`error: could not update connection type: ${e}`);
    return Promise.reject(e);
  }
};

export const createActionType = (payload) => async (dispatch) => {
  try {
    const response = await optimai_integration.post('/action/', payload);
    const { action_type } = response.data;

    // Dispatch the action to add the new action type to the state
    dispatch(
      slice.actions.addActionType({
        action_type, // Pass the entire action_type object
      }),
    );

    return Promise.resolve(response);
  } catch (e) {
    console.error(`error: could not create action type: ${e}`);
    return Promise.reject(e);
  }
};

export const patchActionType = (id, payload) => async (dispatch) => {
  try {
    const response = await optimai_integration.patch(`/action/${id}`, payload);
    const { action_type } = response.data;

    // Dispatch the action to update the action type in the state
    dispatch(
      slice.actions.updateActionType({
        id,
        action_type, // Pass the entire action_type object
      }),
    );

    return Promise.resolve(response);
  } catch (e) {
    console.error(`error: could not patch action type: ${e}`);
    return Promise.reject(e);
  }
};

export const removeActionType = (id, connectionTypeId) => async (dispatch) => {
  try {
    await optimai_integration.delete(`/action/${id}`);

    // Dispatch the action to remove the action type from the state
    dispatch(
      slice.actions.deleteActionType({ connection_type_id: connectionTypeId, actionTypeId: id }),
    );

    return Promise.resolve();
  } catch (e) {
    console.error(`error: could not delete action type: ${e}`);
    return Promise.reject(e);
  }
};

export const createResourceType = (payload) => async (dispatch) => {
  try {
    const response = await optimai_integration.post('/resource-type/', payload);
    const { resource_type } = response.data;

    // Dispatch the action to add the new resource type to the state
    dispatch(
      slice.actions.addResourceType({
        resource_type, // Pass the entire resource_type object
      }),
    );

    return Promise.resolve(response);
  } catch (e) {
    console.error(`error: could not create resource type: ${e}`);
    return Promise.reject(e);
  }
};

export const patchResourceType = (id, payload) => async (dispatch) => {
  try {
    const response = await optimai_integration.patch(`/resource-type/${id}`, payload);
    const { resource_type } = response.data;

    // Dispatch the action to update the action type in the state
    dispatch(
      slice.actions.updateResourceType({
        id,
        resource_type,
      }),
    );

    return Promise.resolve(response);
  } catch (e) {
    console.error(`error: could not patch resource type: ${e}`);
    return Promise.reject(e);
  }
};

export const removeResourceType = (id, connectionTypeId) => async (dispatch) => {
  try {
    await optimai_integration.delete(`/resource-type/${id}`);

    // Dispatch the action to remove the action type from the state
    dispatch(
      slice.actions.deleteResourceType({
        connection_type_id: connectionTypeId,
        resourceTypeId: id,
      }),
    );

    return Promise.resolve();
  } catch (e) {
    console.error(`error: could not delete action type: ${e}`);
    return Promise.reject(e);
  }
};

//  Interfaces -----------------------------------------------------------------------------------------

export const createInterface = (data) => async (dispatch, getState) => {
  try {
    const { account } = getState().general;
    const res = await optimai.post(`/account/${account.id}/interface`, data);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const updateInterfaceById = (interfaceId, data) => async () => {
  try {
    const res = await optimai.patch(`/interfaces/${interfaceId}`, data);
    return Promise.resolve(res);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const deleteInterfaceById = (interfaceId) => async () => {
  try {
    const res = await optimai.delete(`/interfaces/${interfaceId}`);
    return Promise.resolve(res);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getInterfaceById = (interfaceId) => async (dispatch, getState) => {
  const state = getState();
  const interfaces = state.general.account?.interfaces || [];

  // Check if interface already exists in store
  const existingInterface = interfaces.find(i => i.id === interfaceId);
  if (existingInterface) {
    return Promise.resolve(existingInterface);
  }

  try {
    const response = await optimai.get(`/interfaces/${interfaceId}`);
    const interfaceData = response.data.interface;

    // Add interface to Redux store
    dispatch(slice.actions.addInterface(interfaceData));

    return Promise.resolve(interfaceData);
  } catch (e) {
    console.error(`error: could not get interface ${interfaceId}: ${e}`);
    return Promise.reject(e);
  }
};

//  -----------------------------------------------------------------------------------------

export const createRoom = (data) => async (dispatch, getState) => {
  try {
    const { account } = getState().general;
    const response = await optimai.post(`/account/${account.id}/room`, data);
    const { room } = response.data;
    return room;
  } catch (e) {
    if (e.response && e.response.data && e.response.data.detail) {
      return Promise.reject(e.response.data.detail);
    } else {
      return Promise.reject(e.message);
    }
  }
};

//  -----------------------------------------------------------------------------------------

export const clearAccountState = () => async (dispatch) =>
  batch(() => {
    dispatch(clearGeneralState());
    dispatch(clearConnectionsState());
    dispatch(clearMediaState());
    dispatch(clearNotificationsState());
    dispatch(clearFlowState());
    dispatch(clearGateState());
    dispatch(clearAltanerState());
    dispatch(clearAgentsUsage());
    dispatch(clearSpacesState());
  });

export const switchAccount =
  ({ accountId }) =>
  async (dispatch, getState) => {
    const accounts = selectAccounts(getState());
    const account = accounts.find((a) => a.id === accountId);
    if (account) {
      batch(() => {
        dispatch(clearAccountState());
        dispatch(setAccount(account));
      });
      localStorage.setItem('OAIPTACC', accountId);
      return Promise.resolve('success');
    }
    return Promise.reject('user has no access to account');
  };

export const updateAgentsUsage = (usageData) => (dispatch) => {
  dispatch(slice.actions.updateAgentsWithUsage(usageData));
};
