import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
// utils
import { uniqueId } from 'lodash';
import { batch } from 'react-redux';
import { validate as isValidUUID } from 'uuid';

import { selectCurrentAltaner } from './altaners';
import { getConnections, selectConnections } from './connections';
import { switchAccount } from './general';
import { optimai, optimai_galaxia } from '../../utils/axios';
import { checkArraysEqualShallow, checkObjectsEqual } from '../helpers/memoize';
import { AppThunk, RootState } from '../store';

// ----------------------------------------------------------------------

// Types
interface Position {
  x: number;
  y: number;
}

interface MetaData {
  position?: Position;
  _filter_spec?: any;
  _edge_description?: string;
  _filter_mode?: string;
  [key: string]: any;
}

interface RouteCondition {
  id: string;
  router_id: string;
  next_module_id: string | null;
  condition_logic?: any;
  meta_data?: MetaData;
  [key: string]: any;
}

interface WebhookSubscription {
  id: string;
  trigger_id: string;
  [key: string]: any;
}

interface Tool {
  id: string;
  action_type_id?: string;
  action_type?: any;
  [key: string]: any;
}

interface Module {
  id: string;
  type: string;
  position?: string | number;
  meta_data?: MetaData;
  next_module_id?: string | null;
  except_module_id?: string | null;
  internal_type?: string;
  trigger_type?: string;
  logic?: any;
  tool?: Tool;
  subscriptions?: WebhookSubscription[];
  [key: string]: any;
}

interface ModuleWithRouteConditions extends Module {
  route_conditions?: RouteCondition[];
}

interface Flow {
  id: string;
  name?: string;
  account_id?: string;
  room_id?: string;
  entry_module_id?: string;
  is_active?: boolean;
  meta_data?: MetaData;
  template?: FlowTemplate;
  [key: string]: any;
}

interface FlowTemplate {
  id: string;
  versions?: TemplateVersion[];
  template_id?: string;
  [key: string]: any;
}

interface TemplateVersion {
  id: string;
  template_id?: string;
  [key: string]: any;
}

interface FlowExecution {
  id: string;
  workflow_id: string;
  status?: string;
  date_creation?: string;
  finished_at?: string;
  triggered_by?: any;
  [key: string]: any;
}

interface ModuleExecution {
  id: string;
  flow_id: string;
  module_id: string;
  execution_id: string;
  status?: string;
  content?: any;
  error?: any;
  global_vars?: Record<string, any>;
  credits?: number;
  llm_credits?: number;
  api_credits?: number;
  elapsed_time?: number;
  payload_size?: number;
  start_time?: string;
  end_time?: string;
  timestamp?: string;
  [key: string]: any;
}

interface ExecutionDetails {
  id: string;
  workflow_id: string;
  flow_execution_id?: string;
  status?: string;
  date_creation?: string;
  [key: string]: any;
}

interface Execution {
  details: ExecutionDetails;
  modules: Record<string, Record<string, ModuleExecution>>;
  executions?: Record<string, Execution>;
}

interface NewModule {
  id: string;
  type?: string;
  position?: string | number;
  after?: AfterReference;
  meta_data?: MetaData;
  tool?: Tool;
  [key: string]: any;
}

interface AfterReference {
  id: string;
  type: string;
  condition?: string | null;
  isExcept?: boolean;
}

interface MenuModule {
  id: string | null;
  after?: AfterReference | string | null;
}

interface SingleFlowState {
  flow: Flow | null;
  newModules: Record<string, any>;
  modules: Record<string, Module>;
  module_types: Record<string, string>;
  route_conditions: Record<string, RouteCondition>;
  next_module_mappings: {
    modules: Record<string, string | null>;
    conditions: Record<string, string | null>;
    excepts: Record<string, string | null>;
  };
  router_conditions: Record<string, string[]>;
  positions: {
    existing: Record<string, Position>;
    new: Record<string, Position>;
  };
  executions: Record<string, Record<string, Execution>>;
  flow_executions: FlowExecution[] | null;
  accountId: string | null;
  menuModule: {
    module: MenuModule;
    anchorEl: any;
  };
  drawerNewModule: AfterReference | null;
  currentToolSchema: any;
  isFlowExecutionHistoryActive: boolean;
  moduleInputActive: boolean;
  executionsFromHistory: Record<string, boolean>;
  selectedModuleId: string | null;
  moduleExecInMenu: string | null;
}

interface FlowsState extends SingleFlowState {
  flows: Flow[];
  initialized: {
    flows: boolean;
    flow: boolean;
    executions: boolean;
    nodes: boolean;
  };
  isLoading: {
    flows: boolean;
    flow: boolean;
    executions: boolean;
  };
  error: {
    flows: boolean | string;
    flow: boolean | string;
  };
}

const singleFlowInitialState: SingleFlowState = {
  flow: null,
  newModules: {},
  modules: {},
  module_types: {},
  route_conditions: {},
  next_module_mappings: {
    modules: {},
    conditions: {},
    excepts: {},
  },
  router_conditions: {},
  positions: {
    existing: {},
    new: {},
  },
  executions: {},
  flow_executions: null,
  accountId: null,
  menuModule: {
    module: {
      id: null,
      after: null,
    },
    anchorEl: null,
  },
  drawerNewModule: null,
  currentToolSchema: null,
  isFlowExecutionHistoryActive: false,
  moduleInputActive: false,
  executionsFromHistory: {},
  selectedModuleId: null,
  moduleExecInMenu: null,
};

const initialState: FlowsState = {
  flows: [],
  initialized: {
    flows: false,
    flow: false,
    executions: false,
    nodes: false,
  },
  isLoading: {
    flows: false,
    flow: false,
    executions: false,
  },
  error: {
    flows: false,
    flow: false,
  },
  ...singleFlowInitialState,
};

// ----------------------------------------------------------------------

const setUpModule = (state: FlowsState, m: ModuleWithRouteConditions, update = false): void => {
  const { next_module_id, route_conditions, ...moduleAttributes } = m;
  const module: Module = { ...moduleAttributes };
  
  if (m.type === 'router') {
    if ('route_conditions' in m && route_conditions) {
      const routeConditionsIds: string[] = [];
      for (const rc of route_conditions) {
        const { next_module_id: rcNextModuleId, ...rcAttributes } = rc;
        state.route_conditions[rcAttributes.id] = rcAttributes;
        routeConditionsIds.push(rcAttributes.id);
        state.next_module_mappings.conditions[rcAttributes.id] = rcNextModuleId;
      }
      state.router_conditions[m.id] = routeConditionsIds;
    }
  }
  
  if ('meta_data' in module && module.meta_data) {
    if ('position' in module.meta_data) {
      state.positions.existing[m.id] = { ...module.meta_data.position };
      try {
        delete module.meta_data.position;
      } catch (e) {
        // silently fail
      }
    }
  }
  
  if ('next_module_id' in m) {
    if (!m.next_module_id) {
      if (m.id in state.next_module_mappings.modules) {
        delete state.next_module_mappings.modules[m.id];
      }
    } else {
      state.next_module_mappings.modules[m.id] = next_module_id || null;
    }
  }
  
  if ('except_module_id' in m) {
    if (!m.except_module_id) {
      if (m.id in state.next_module_mappings.excepts) {
        delete state.next_module_mappings.excepts[m.id];
      }
    } else {
      state.next_module_mappings.excepts[m.id] = m.except_module_id;
    }
  }
  
  if ('type' in m) {
    if (m.type === 'internal' && m.internal_type) {
      state.module_types[m.id] = `${m.type}:${m.internal_type}`;
    } else {
      state.module_types[m.id] = m.type;
    }
  }
  
  if (update) {
    Object.assign(state.modules[m.id], module);
  } else {
    state.modules[m.id] = module;
  }
};

const slice = createSlice({
  name: 'flows',
  initialState,
  reducers: {
    startLoading(state, action: PayloadAction<'flows' | 'flow' | 'executions'>) {
      const mode = action.payload;
      state.isLoading[mode] = true;
    },
    stopLoading(state, action: PayloadAction<'flows' | 'flow' | 'executions'>) {
      const mode = action.payload;
      state.isLoading[mode] = false;
    },
    setSelectedModule(state, action: PayloadAction<string>) {
      state.selectedModuleId = action.payload;
    },
    clearSelectedModule(state) {
      state.selectedModuleId = null;
    },
    setModuleExecInMenu(state, action: PayloadAction<string>) {
      state.moduleExecInMenu = action.payload;
    },
    clearModuleExecInMenu(state) {
      state.moduleExecInMenu = null;
    },
    // NEW MODULES
    addNewModule(state, action: PayloadAction<{ after: AfterReference | null; position: Position }>) {
      const { after, position } = action.payload;
      const newId = uniqueId();
      if (!after?.id) {
        state.newModules.trigger = { id: newId, type: 'trigger', position: 0 };
        state.menuModule = {
          module: { id: null, after: 'trigger' },
          anchorEl: null,
        };
        return;
      }
      const previousModuleId = after.id;
      const previousModuleType = after.type;
      const previousConditionId = after.condition;
      state.newModules[after.isExcept ? `e-${previousModuleId}` : previousModuleId] =
        !previousConditionId
          ? {
              id: newId,
              after: {
                type: previousModuleType,
                id: previousModuleId,
                isExcept: after.isExcept,
              },
              position: 'TBD',
              meta_data: {
                position,
              },
            }
          : {
              ...(state.newModules[previousModuleId] || {}),
              [previousConditionId]: {
                id: newId,
                after: {
                  type: 'router',
                  id: previousModuleId,
                  condition: previousConditionId,
                },
                position: 'TBD',
                meta_data: {
                  position,
                },
              },
            };
    },
    deleteNewModule(state, action: PayloadAction<AfterReference | null>) {
      const after = action.payload;
      const menuModule = state.menuModule;
      if (!!menuModule.anchorEl && !menuModule.module.id) {
        if (after?.id === (menuModule.module.after as any)?.id) {
          Object.assign(state.menuModule, singleFlowInitialState.menuModule);
        }
      }
      if (!after) {
        return;
      }
      const previousModuleId = after.isExcept ? `e-${after.id}` : after.id;
      const previousConditionId = after.condition;
      if (!previousConditionId) {
        if (previousModuleId in state.newModules) {
          delete state.newModules[previousModuleId];
        }
        return;
      }
      if (
        previousConditionId &&
        state.newModules[previousModuleId] &&
        state.newModules[previousModuleId][previousConditionId]
      ) {
        delete state.newModules[previousModuleId][previousConditionId];
        if (Object.keys(state.newModules[previousModuleId]).length === 0) {
          delete state.newModules[previousModuleId];
        }
      }
    },
    setNewModuleType(
      state,
      action: PayloadAction<{
        type: string;
        action?: any;
        after?: AfterReference;
        [key: string]: any;
      }>
    ) {
      const { type, action: actionType, after: afterOverride, ...args } = action.payload;
      const after = afterOverride ?? state.drawerNewModule;
      const common: any = { type, ...(args || {}) };
      if (actionType) {
        common.tool = {
          action_type_id: actionType.id,
          action_type: {
            ...actionType,
            icon: actionType.connection_type.icon,
          },
        };
      }
      const isExcept = after?.isExcept;
      const previousModuleId = isExcept ? `e-${after?.id}` : (after?.id ?? 'trigger');
      const previousConditionId = after?.condition;
      state.newModules[previousModuleId] = !previousConditionId
        ? {
            ...state.newModules[previousModuleId],
            ...common,
          }
        : {
            ...(state.newModules[previousModuleId] || {}),
            [previousConditionId]: {
              ...(state.newModules[previousModuleId][previousConditionId] || {}),
              ...common,
            },
          };
      state.drawerNewModule = null;
    },
    onNewModuleClick(state, action: PayloadAction<{ node: any; anchorEl: any }>) {
      const { node, anchorEl } = action.payload;

      const after = node.data.module.after;

      const previousModuleId = after?.isExcept ? `e-${after?.id}` : (after?.id ?? 'trigger');
      const previousConditionId = after?.condition;

      const module = !previousConditionId
        ? state.newModules[previousModuleId]
        : state.newModules[previousModuleId][previousConditionId];

      if (!module.type) {
        state.drawerNewModule = after;
      } else {
        state.menuModule = {
          module: { id: null, after: after ?? 'trigger' },
          anchorEl,
        };
      }
    },
    updateNewModulesPosition(
      state,
      action: PayloadAction<Array<{ after: AfterReference; position: Position }>>
    ) {
      const modules = action.payload;

      for (const { after, position } of modules) {
        const previousModuleId = after?.isExcept ? `e-${after?.id}` : (after?.id ?? 'trigger');
        const previousConditionId = after?.condition;

        if (!(previousModuleId in state.newModules)) {
          continue;
        }

        if (!previousConditionId) {
          state.newModules[previousModuleId].meta_data = {
            ...(state.newModules[previousModuleId]?.meta_data || {}),
            position,
          };
        } else {
          state.newModules[previousModuleId][previousConditionId].meta_data = {
            ...(state.newModules[previousModuleId][previousConditionId]?.meta_data || {}),
            position,
          };
        }
      }
    },
    // OTHER
    setIsFlowExecutionHistoryActive(state, action: PayloadAction<boolean>) {
      state.isFlowExecutionHistoryActive = action.payload;
    },
    setModuleInputActive(state, action: PayloadAction<boolean>) {
      state.moduleInputActive = action.payload;
    },
    toggleFlowHistoryActive(state) {
      state.isFlowExecutionHistoryActive = !state.isFlowExecutionHistoryActive;
    },
    setCurrentToolSchema(state, action: PayloadAction<any>) {
      const schema = action.payload;
      state.currentToolSchema = schema;
    },
    setModuleInMenu(state, action: PayloadAction<{ module: MenuModule; anchorEl: any }>) {
      const { module, anchorEl } = action.payload;
      state.menuModule = {
        module,
        anchorEl,
      };
    },
    clearModuleInMenu(state) {
      Object.assign(state.menuModule, singleFlowInitialState.menuModule);
    },
    setNewModuleInDrawer(state, action: PayloadAction<AfterReference>) {
      const after = action.payload;
      state.drawerNewModule = after;
    },
    clearNewModuleInDrawer(state) {
      state.drawerNewModule = null;
    },
    hasError(state, action: PayloadAction<{ error: string; mode: 'flows' | 'flow' }>) {
      const { error, mode } = action.payload;
      state.error[mode] = error;
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
    setFlows(state, action: PayloadAction<Flow[]>) {
      state.flows = action.payload;
      state.initialized.flows = true;
    },
    addFlow(state, action: PayloadAction<Flow>) {
      const flow = action.payload;
      state.flows = [flow, ...state.flows];
    },
    setInitializedNodes(state) {
      state.initialized.nodes = true;
    },
    deleteFlow(state, action: PayloadAction<string>) {
      const flowId = action.payload;
      state.flows = state.flows.filter((flow) => flow.id !== flowId);
    },
    setFlow(state, action: PayloadAction<Flow & { modules: ModuleWithRouteConditions[] }>) {
      const { modules, ...flow } = action.payload;
      state.flow = flow;
      modules.forEach((m) => setUpModule(state, m));
      state.initialized.flow = true;
      state.initialized.executions = false;
    },
    setFlowExecutions(
      state,
      action: PayloadAction<{
        flowId?: string;
        executions: FlowExecution[];
      }>
    ) {
      const { executions } = action.payload;
      state.flow_executions = executions;
      state.initialized.executions = true;
    },
    setFlowExecution(
      state,
      action: PayloadAction<{ flowId: string; execution: Record<string, Execution> }>
    ) {
      const { flowId, execution } = action.payload;
      state.executionsFromHistory[flowId] = true;
      state.executions[flowId] = execution;
    },
    clearFlowExecution(state, action: PayloadAction<{ flowId: string }>) {
      const { flowId } = action.payload;
      if (flowId in state.executionsFromHistory) {
        delete state.executionsFromHistory[flowId];
      }
      if (flowId in state.executions) {
        delete state.executions[flowId];
      }
    },
    updateFlow(state, action: PayloadAction<Partial<Flow> & { id: string }>) {
      const { id, ...updatedProps } = action.payload;
      if (state.flow && state.flow.id === id) {
        state.flow = { ...state.flow, ...updatedProps };
      }
      const flowIndex = state.flows.findIndex((flow) => flow.id === id);
      if (flowIndex !== -1) {
        state.flows[flowIndex] = { ...state.flows[flowIndex], ...updatedProps };
      }
    },
    addWebhookSubscription(state, action: PayloadAction<WebhookSubscription>) {
      if (!state.flow) {
        return;
      }
      const webhookSubscription = action.payload;
      const triggerId = webhookSubscription?.trigger_id;
      if (!triggerId || !(triggerId in state.modules)) {
        return;
      }
      if (!state.modules[triggerId].subscriptions) {
        state.modules[triggerId].subscriptions = [];
      }
      state.modules[triggerId].subscriptions.push(webhookSubscription);
    },
    deleteWebhookSubscription(state, action: PayloadAction<{ ids: string[] }>) {
      const { ids } = action.payload;
      if (!ids || !state.flow) {
        return;
      }
      for (const moduleId in state.modules) {
        const module = state.modules[moduleId];
        if (
          module.type === 'trigger' &&
          module.trigger_type === 'instant' &&
          module.subscriptions?.find((s) => ids.includes(s.id))
        ) {
          state.modules[moduleId].subscriptions = module.subscriptions.filter(
            (s) => !ids.includes(s.id)
          );
        }
      }
    },
    addModule(state, action: PayloadAction<ModuleWithRouteConditions>) {
      if (!state.flow) {
        return;
      }
      const module = action.payload;
      if ('trigger' in state.newModules) {
        delete state.newModules.trigger;
      }
      setUpModule(state, module);
    },
    deleteModules(state, action: PayloadAction<{ ids: string[] }>) {
      if (!state.flow) {
        return;
      }
      const { ids } = action.payload;
      if (!ids || !state.flow) {
        return;
      }
      ids.forEach((moduleId) => {
        if (moduleId in state.modules) {
          delete state.modules[moduleId];
        }
        if (moduleId in state.module_types) {
          delete state.module_types[moduleId];
        }
        if (moduleId in state.next_module_mappings.modules) {
          delete state.next_module_mappings.modules[moduleId];
        }
        if (moduleId in state.router_conditions) {
          delete state.router_conditions[moduleId];
        }
        if (moduleId in state.positions.existing) {
          delete state.positions.existing[moduleId];
        }
        if (moduleId === state.menuModule.module?.id) {
          Object.assign(state.menuModule, singleFlowInitialState.menuModule);
        }
      });
    },
    updateModule(state, action: PayloadAction<Partial<Module> & { id: string }>) {
      if (!state.flow) {
        return;
      }
      const { id, ...updatedProps } = action.payload;
      if (!(id in state.modules)) {
        return;
      }
      setUpModule(state, { id, ...updatedProps } as ModuleWithRouteConditions, true);
    },
    updateTool(state, action: PayloadAction<Partial<Tool> & { id: string }>) {
      if (!state.flow) {
        return;
      }
      const { id, ...updatedProps } = action.payload;
      for (const moduleId of Object.keys(state.modules)) {
        if (state.modules[moduleId].tool?.id === id) {
          Object.assign(state.modules[moduleId].tool, updatedProps);
          break;
        }
      }
    },
    updateRouteCondition(
      state,
      action: PayloadAction<{ ids: string[]; changes: Partial<RouteCondition> }>
    ) {
      if (!state.flow) {
        return;
      }
      const { ids, changes } = action.payload;
      const { next_module_id, ...updatedRC } = changes;
      for (const id of ids) {
        if (!(id in state.route_conditions)) {
          continue;
        }
        if ('next_module_id' in changes) {
          state.next_module_mappings.conditions[id] = next_module_id || null;
        }
        Object.assign(state.route_conditions[id], updatedRC);
      }
    },
    deleteRouteCondition(state, action: PayloadAction<{ ids: string[] }>) {
      if (!state.flow) {
        return;
      }
      const { ids } = action.payload;
      for (const id of ids) {
        if (!(id in state.route_conditions)) {
          continue;
        }
        const router_id = state.route_conditions[id].router_id;
        if (router_id in state.router_conditions) {
          state.router_conditions[router_id] = state.router_conditions[router_id].filter(
            (rcId) => rcId !== id
          );
        }
        delete state.route_conditions[id];
        if (id in state.next_module_mappings.conditions) {
          delete state.next_module_mappings.conditions[id];
        }
      }
    },
    updateModulesPosition(state, action: PayloadAction<Array<{ id: string; position: Position }>>) {
      if (!state.flow) {
        return;
      }
      const modules = action.payload;
      for (const { id, position } of modules) {
        const module = state.modules[id];
        if (!module) {
          continue;
        }
        if (!module.meta_data) {
          module.meta_data = {};
        }
        module.meta_data.position = position;
      }
    },
    addRouteCondition(state, action: PayloadAction<RouteCondition>) {
      if (!state.flow) {
        return;
      }
      const condition = action.payload;
      const routerId = condition?.router_id;
      if (!routerId || !(routerId in state.modules)) {
        return;
      }
      if (!(routerId in state.router_conditions)) {
        state.router_conditions[routerId] = [];
      }
      state.router_conditions[routerId].push(condition.id);
      state.route_conditions[condition.id] = condition;
    },
    clearCurrentFlow(state) {
      state.initialized.flow = false;
      state.initialized.nodes = false;
      state.initialized.executions = false;
      state.isLoading.flow = false;
      state.isLoading.executions = false;
      state.error.flow = false;
      for (const [k, v] of Object.entries(singleFlowInitialState)) {
        (state as any)[k] = v;
      }
    },
    addTemplate(state, action: PayloadAction<{ flow_id: string; attributes: FlowTemplate }>) {
      if (!state.flow) {
        return;
      }
      const { flow_id, attributes } = action.payload;
      if (state.flow.id !== flow_id) {
        return;
      }
      state.flow.template = attributes;
    },
    updateTemplate(
      state,
      action: PayloadAction<{ flow_id: string; ids: string[]; changes: Partial<FlowTemplate> }>
    ) {
      if (!state.flow) {
        return;
      }
      const { flow_id, ids, changes } = action.payload;
      if (state.flow.id !== flow_id || state.flow.template?.id !== ids[0]) {
        return;
      }
      state.flow.template = { ...(state.flow.template || {}), ...changes };
    },
    deleteTemplate(state, action: PayloadAction<{ flow_id: string; ids: string[] }>) {
      if (!state.flow) {
        return;
      }
      const { flow_id, ids } = action.payload;
      if (state.flow.id !== flow_id || state.flow.template?.id !== ids[0]) {
        return;
      }
      delete state.flow.template;
    },
    addTemplateVersion(
      state,
      action: PayloadAction<{ flow_id: string; attributes: TemplateVersion }>
    ) {
      if (!state.flow?.template) {
        return;
      }
      const { flow_id, attributes } = action.payload;
      if (state.flow.id !== flow_id || state.flow.template?.id !== attributes?.template_id) {
        return;
      }
      if (!state.flow.template.versions) {
        state.flow.template.versions = [];
      }
      state.flow.template.versions.push(attributes);
    },
    updateTemplateVersion(
      state,
      action: PayloadAction<{ flow_id: string; ids: string[]; changes: Partial<TemplateVersion> }>
    ) {
      if (!state.flow?.template?.versions) {
        return;
      }
      const { flow_id, ids, changes } = action.payload;
      let numIds = ids.length;
      if (state.flow.id !== flow_id || !numIds) {
        return;
      }
      for (const i in state.flow.template.versions) {
        const id = state.flow.template.versions[i].id;
        if (ids.includes(id)) {
          state.flow.template.versions[i] = {
            ...state.flow.template.versions[i],
            ...changes,
          };
          numIds -= 1;
        }
        if (!numIds) {
          break;
        }
      }
    },
    deleteTemplateVersion(state, action: PayloadAction<{ flow_id: string; ids: string[] }>) {
      if (!state.flow?.template?.versions) {
        return;
      }
      const { flow_id, ids } = action.payload;
      if (state.flow.id !== flow_id || !ids.length) {
        return;
      }
      state.flow.template.versions = state.flow.template.versions.filter((v) => !ids.includes(v.id));
    },
    addOrUpdateModuleExecution(state, action: PayloadAction<ModuleExecution>) {
      const { id, flow_id, module_id, execution_id, ...moduleExecution } = action.payload;

      if (!(flow_id in state.executions)) {
        state.executions[flow_id] = {};
      }
      if (!(execution_id in state.executions[flow_id])) {
        state.executions[flow_id][execution_id] = {
          details: {
            id: execution_id,
            workflow_id: flow_id,
          },
          modules: {},
        };
      }
      if (!(module_id in state.executions[flow_id][execution_id].modules)) {
        state.executions[flow_id][execution_id].modules[module_id] = {};
      }
      const moduleExecutions = state.executions[flow_id][execution_id].modules[module_id];
      if (id in moduleExecutions) {
        moduleExecutions[id] = { ...moduleExecutions[id], ...moduleExecution };
      } else {
        moduleExecutions[id] = moduleExecution as any;
      }
    },
    addFlowExecution(state, action: PayloadAction<FlowExecution>) {
      const execution = action.payload;
      const execution_id = execution.id;
      const flow_id = execution.workflow_id;
      if (!(flow_id in state.executions)) {
        state.executions[flow_id] = {};
      }
      state.executions[flow_id][execution_id] = {
        details: {
          ...execution,
          flow_execution_id: execution_id,
        },
        modules: {},
      };
    },
    updateFlowExecution(state, action: PayloadAction<Partial<ExecutionDetails> & { id: string }>) {
      const { id, ...updatedProps } = action.payload;
      let flow_id: string | null = null;
      for (const [flowId, executions] of Object.entries(state.executions)) {
        if (executions[id]) {
          flow_id = flowId;
          break;
        }
      }
      if (!flow_id) {
        return;
      }
      state.executions[flow_id][id].details = {
        ...state.executions[flow_id][id].details,
        ...updatedProps,
      };
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  setSelectedModule,
  clearSelectedModule,
  // MODULES NEW
  addNewModule,
  deleteNewModule,
  setNewModuleType,
  onNewModuleClick,
  // OTHERS
  addModule,
  updateModule,
  updateModulesPosition,
  updateNewModulesPosition,
  deleteModules,
  addRouteCondition,
  addFlow,
  setInitializedNodes,
  deleteFlow,
  setFlows,
  updateFlow,
  setFlowExecution,
  clearFlowExecution,
  addOrUpdateModuleExecution,
  addFlowExecution,
  updateFlowExecution,
  updateRouteCondition,
  deleteRouteCondition,
  clearModuleInMenu,
  setModuleInMenu,
  setNewModuleInDrawer,
  setCurrentToolSchema,
  clearNewModuleInDrawer,
  setModuleInputActive,
  updateTool,
  setIsFlowExecutionHistoryActive,
  toggleFlowHistoryActive,
  addWebhookSubscription,
  deleteWebhookSubscription,
  clearState: clearFlowState,
  clearCurrentFlow,
  setModuleExecInMenu,
  clearModuleExecInMenu,
  // TEMPLATES
  addTemplate: addFlowTemplate,
  updateTemplate: updateFlowTemplate,
  deleteTemplate: deleteFlowTemplate,
  addTemplateVersion: addFlowTemplateVersion,
  updateTemplateVersion: updateFlowTemplateVersion,
  deleteTemplateVersion: deleteFlowTemplateVersion,
} = slice.actions;

// ----------------------------------------------------------------------

const TARGETED_GQ = {
  '@fields': ['id'],
  workflows: {
    '@fields': '@all',
  },
};

// SELECTORS

const selectFlowState = (state: RootState): FlowsState => state.flows;

export const selectFlow = (state: RootState): Flow | null => selectFlowState(state).flow;

export const selectFlowStateInitialized =
  (mode: keyof FlowsState['initialized']) => (state: RootState) =>
    selectFlowState(state).initialized[mode];

export const selectFlowStateLoading =
  (mode: keyof FlowsState['isLoading']) => (state: RootState) =>
    selectFlowState(state).isLoading[mode];

export const selectInitializedFlow = (state: RootState): boolean =>
  selectFlowStateInitialized('flow')(state);

export const selectIsLoadingFlow = (state: RootState): boolean => selectFlowStateLoading('flow')(state);

export const selectFlowStatus = (state: RootState): boolean | undefined =>
  selectFlowState(state).flow?.is_active;

export const selectCurrentFlowExecutions = (state: RootState): FlowExecution[] | null =>
  selectFlowState(state).flow_executions;

export const selectInitializedNodes = (state: RootState): boolean =>
  selectFlowStateInitialized('nodes')(state);

export const selectFlowDetails = createSelector(
  [selectFlow],
  (flow) => ({
    id: flow?.id,
    name: flow?.name,
    account_id: flow?.account_id,
    room_id: flow?.room_id,
    entry_module_id: flow?.entry_module_id,
  }),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  }
);

export const selectFlowTemplate = (state: RootState): FlowTemplate | undefined =>
  selectFlow(state)?.template;

export const selectFlowExecutions = (state: RootState): FlowExecution[] | null =>
  selectFlowState(state).flow_executions;

export const selectFlowId = (state: RootState): string | undefined => selectFlow(state)?.id;

export const selectFlowMetadata = (state: RootState): MetaData | undefined => selectFlow(state)?.meta_data;

export const selectNewModules = (state: RootState): Record<string, any> =>
  selectFlowState(state).newModules;

export const selectFlowModules = (state: RootState): Record<string, Module> =>
  selectFlowState(state).modules;

export const selectSelectedModuleId = (state: RootState): string | null =>
  selectFlowState(state).selectedModuleId;

export const selectSelectedModule = (state: RootState): Module | undefined =>
  selectFlowModules(state)?.[selectSelectedModuleId(state)!];

export const selectModulesOrderPositions = createSelector(
  [selectFlowModules],
  (modules) =>
    Object.values(modules).reduce(
      (acc, m) => {
        acc[parseInt(String(m.position), 10)] = m.id;
        return acc;
      },
      {} as Record<number, string>
    ),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  }
);

export const selectModulesTypes = (state: RootState): Record<string, string> =>
  selectFlowState(state).module_types;

export const selectRouteConditions = (state: RootState): Record<string, RouteCondition> =>
  selectFlowState(state).route_conditions;

export const selectRouterConditions = (state: RootState): Record<string, string[]> =>
  selectFlowState(state).router_conditions;

export const selectNextModuleMapping = (state: RootState) =>
  selectFlowState(state).next_module_mappings;

export const selectNextModuleMappingModules = (state: RootState): Record<string, string | null> =>
  selectNextModuleMapping(state).modules;

export const selectNextModuleMappingConditions = (state: RootState): Record<string, string | null> =>
  selectNextModuleMapping(state).conditions;

export const selectModuleInMenu = (state: RootState): MenuModule =>
  selectFlowState(state).menuModule.module;

export const selectIteratorModules = createSelector(
  [selectFlowModules],
  (modules) =>
    Object.fromEntries(Object.entries(modules).filter(([, module]) => module.type === 'iterator')),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  }
);

export const selectFlowModulesPositions = (state: RootState): Record<string, Position> =>
  selectFlowState(state).positions.existing;

export const selectSourceHandles = createSelector(
  [selectFlowModules, selectRouterConditions],
  (modules, router_conditions) =>
    Object.values(modules).reduce(
      (acc, m) => {
        const sourceHandles: any[] = [];
        if (m.type === 'router') {
          const routerModuleId = m.id;
          const conditions = router_conditions[routerModuleId] ?? [];
          for (const rcId of conditions) {
            sourceHandles.push({
              id: `${routerModuleId}-s:${rcId}`,
              conditionId: rcId,
            });
          }
        }
        if (m.type !== 'internal' || m.internal_type !== 'response') {
          sourceHandles.push({ id: `${m.id}-s`, default: m.type === 'router' });
        }
        acc[m.id] = sourceHandles;
        return acc;
      },
      {} as Record<string, any[]>
    ),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  }
);

export const selectExistingModules = createSelector(
  [selectFlowModules],
  (modules) => Object.keys(modules),
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualShallow,
    },
  }
);

export const selectExistingTriggers = createSelector(
  [selectFlowModules],
  (modules) => Object.keys(modules).filter((mId) => modules[mId].type === 'trigger'),
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualShallow,
    },
  }
);

export const selectTotalFlowModules = createSelector(
  [selectExistingModules],
  (modulesIds) => modulesIds.length
);

export const currentToolSchemaSelector = (state: RootState): any =>
  selectFlowState(state).currentToolSchema;

const extractNewModules = (newModules: Record<string, any>): NewModule[] => {
  const modules: NewModule[] = [];
  Object.values(newModules || {}).forEach((nm) => {
    if (nm.id !== undefined) {
      modules.push(nm);
    } else if (!!nm) {
      extractNewModules(nm).forEach((m) => modules.push(m));
    }
  });
  return modules;
};

export const selectModulePositions = createSelector(
  [selectFlowModulesPositions, selectNewModules],
  (positions, newModules) => ({
    ...positions,
    ...extractNewModules(newModules).reduce(
      (acc, m) => {
        acc[m.id] = m.meta_data?.position ?? {};
        return acc;
      },
      {} as Record<string, Position>
    ),
  }),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  }
);

export const selectMustCreateTrigger = createSelector(
  [selectFlowId, selectExistingTriggers, selectExistingModules, selectNewModules],
  (flowId, existingTriggers, existingModules, newModules) =>
    !!flowId && !existingTriggers.length && !existingModules.length && !newModules.trigger
);

export const selectMustCreateModuleAfterTriggers = createSelector(
  [selectFlowId, selectExistingTriggers, selectExistingModules, selectNewModules],
  (flowId, existingTriggers, existingModules, newModules) =>
    !!flowId &&
    !!existingTriggers.length &&
    existingModules.length === existingTriggers.length &&
    !Object.keys(newModules).length
);

export const selectPanelNew = (state: RootState): AfterReference | null =>
  selectFlowState(state).drawerNewModule;

export const selectModuleInPanelNew = (state: RootState): NewModule | null => {
  const after = selectPanelNew(state);
  if (!after) {
    return null;
  }
  const newModules = selectNewModules(state);
  const previousModuleId = after?.isExcept ? `e-${after?.id}` : (after?.id ?? 'trigger');
  const previousConditionId = after?.condition;
  return previousConditionId !== null
    ? newModules[previousModuleId]?.[previousConditionId]
    : newModules[previousModuleId];
};

function generateJsonSchema(fields: any[] | undefined): any {
  if (!fields?.length) {
    return null;
  }
  return {
    type: 'object',
    properties: fields.reduce((acc, field) => {
      acc[`$${field.module_position}%_${field.name}`] = {
        title: field.name,
        type: field.type,
        ...(field.template_description && { description: field.template_description }),
        ...(field.template_enum && Array.isArray(field.template_enum)
          ? { enum: field.template_enum }
          : {}),
        ...(field.value !== null ? { default: field.value } : {}),
      };
      return acc;
    }, {} as Record<string, any>),
    required: fields
      .filter((field) => field.value === null)
      .map((field) => `$${field.module_position}%_${field.name}`),
  };
}

export const selectFlowSchema = createSelector([selectFlowModules], (flowModules) =>
  generateJsonSchema(
    Object.values(flowModules)
      .filter((m) => m.type === 'internal' && m.internal_type === 'vars')
      .flatMap((module: any) =>
        module.logic.variables
          .filter((v: any) => v.expose)
          .map(({ expose, is_template, altaner_variable, ...rest }: any) => ({
            module_position: module.position,
            ...rest,
          }))
      )
  )
);

export const makeSelectModule = () =>
  createSelector(
    [
      selectFlowModules,
      selectNewModules,
      (_state: RootState, moduleId: string | null = null) => moduleId,
      (_state: RootState, _moduleId: string | null, after: AfterReference | null = null) => after,
    ],
    (flowModules, newModules, moduleId, after) => {
      if (!!moduleId && isValidUUID(moduleId) && !after) {
        return flowModules[moduleId];
      }
      const previousModuleId = after?.isExcept ? `e-${after?.id}` : (after?.id ?? 'trigger');
      const previousConditionId = after?.condition;
      return !!previousConditionId
        ? newModules[previousModuleId]?.[previousConditionId]
        : newModules[previousModuleId];
    }
  );

export const makeSelectFullModule = () =>
  createSelector(
    [
      selectFlowModules,
      selectNewModules,
      selectRouterConditions,
      (_state: RootState, moduleId: string | null = null) => moduleId,
      (_state: RootState, _moduleId: string | null, after: AfterReference | null = null) => after,
    ],
    (flowModules, newModules, routeConditions, moduleId, after) => {
      if (!!moduleId && isValidUUID(moduleId) && !after) {
        const module = { ...flowModules[moduleId] } as any;
        if (module.type === 'router') {
          module.route_conditions = (routeConditions[moduleId] ?? []).map((rcId) => routeConditions[rcId]);
        }
        return module;
      }
      const previousModuleId = after?.isExcept ? `e-${after?.id}` : (after?.id ?? 'trigger');
      const previousConditionId = after?.condition;
      return !!previousConditionId
        ? newModules[previousModuleId]?.[previousConditionId]
        : newModules[previousModuleId];
    },
    {
      memoizeOptions: {
        resultEqualityCheck: checkObjectsEqual,
      },
    }
  );

export const makeSelectModuleFilter = () =>
  createSelector(
    [
      (state: RootState, sourceId: string, moduleId: string | null, after: AfterReference | null = null) =>
        makeSelectModule()(state, moduleId, after),
      (_state: RootState, sourceId: string) => sourceId,
    ],
    (module: any, sourceId) => {
      const res: any = {};
      const filterSpec = module?.meta_data?.['_filter_spec'];
      const edgeDescription = module?.meta_data?.['_edge_description'];
      if (!!filterSpec) {
        res.initialFilter = filterSpec;
      }
      if (!!edgeDescription) {
        res.initialDescription = edgeDescription;
      }
      if (module?.type === 'internal' && module?.internal_type === 'octopus') {
        if (!!filterSpec && typeof filterSpec === 'object') {
          res.initialFilter = filterSpec[sourceId];
        }
        if (!!edgeDescription && typeof edgeDescription === 'object') {
          res.initialDescription = edgeDescription[sourceId];
        }
      } else {
        res.initialFilterMode = module?.meta_data?.['_filter_mode'];
      }
      return res;
    }
  );

export const makeSelectConditionFilter = () =>
  createSelector(
    [
      makeSelectModule(),
      selectRouteConditions,
      (_state: RootState, moduleId: string | null = null) => moduleId,
      (
        _state: RootState,
        _moduleId: string | null,
        _after: AfterReference | null,
        conditionId: string | null = null
      ) => conditionId,
    ],
    (module: any, routeConditions, moduleId, conditionId) => {
      const condition = moduleId
        ? routeConditions[conditionId!]
        : module?.route_conditions?.find((c: any) => c.id === conditionId);
      return {
        initialFilter: condition?.condition_logic,
        initialDescription: condition?.meta_data?.['_edge_description'],
      };
    }
  );

export const makeSelectEdgeDescription = () =>
  createSelector([makeSelectModuleFilter()], (filter) => filter.initialDescription);

export const makeSelectConditionDescription = () =>
  createSelector([makeSelectConditionFilter()], (filter) => filter.initialDescription);

export const makeSelectHasModuleFilter = () =>
  createSelector(
    [makeSelectModuleFilter()],
    (filter) => !!Object.keys(filter.initialFilter ?? {}).length
  );

export const makeSelectHasConditionFilter = () =>
  createSelector(
    [makeSelectConditionFilter()],
    (filter) => !!Object.keys(filter.initialFilter ?? {}).length
  );

export const selectCurrentExecution = createSelector(
  [selectFlowState, selectFlow],
  (flowState, flow) => (!!flow?.id ? flowState.executions[flow.id] : null)
);

export const selectCurrentRunningExecutions = createSelector(
  [selectCurrentExecution],
  (currentExecutions) => {
    if (!currentExecutions || !Object.keys(currentExecutions).length) {
      return null;
    }
    const sortedExecs = Object.entries(currentExecutions).sort(
      ([, { details: aDetails }], [, { details: bDetails }]) => {
        const dateA = new Date(aDetails.date_creation || 0);
        const dateB = new Date(bDetails.date_creation || 0);
        return dateB.getTime() - dateA.getTime();
      }
    );

    return sortedExecs
      .map(([, e]) => ({
        id: e.details?.flow_execution_id,
        status: e.details?.status,
        date_creation: e.details?.date_creation,
      }))
      .filter((e) => e.status === 'running');
  }
);

export const selectExecutionsEventsHistory = createSelector(
  [selectFlowExecutions, selectCurrentExecution],
  (flowExecutions, currentExecutions) => {
    const allExecutions = [
      ...(flowExecutions ?? []),
      ...Object.values(currentExecutions ?? {}).map((e) => e.details),
    ];

    const uniqueEventsMap = new Map();

    allExecutions
      .map((execution) => ({
        event: execution?.triggered_by,
        flowId: execution?.workflow_id,
        executionId: execution?.id,
        date_creation: execution?.date_creation,
      }))
      .filter((ex) => !!ex?.event?.id)
      .forEach((ex) => {
        const eventId = ex.event.id;
        if (!uniqueEventsMap.has(eventId)) {
          uniqueEventsMap.set(eventId, ex);
        } else {
          const existing = uniqueEventsMap.get(eventId);
          if (new Date(ex.date_creation) > new Date(existing.date_creation)) {
            uniqueEventsMap.set(eventId, ex);
          }
        }
      });

    return Array.from(uniqueEventsMap.values()).sort((a, b) => {
      let rawA = a.event.date_creation;
      let rawB = b.event.date_creation;
      if (rawA === rawB) {
        rawA = a.date_creation;
        rawB = b.date_creation;
      }
      const dateA = new Date(rawA || 0);
      const dateB = new Date(rawB || 0);
      return dateB.getTime() - dateA.getTime();
    });
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  }
);

export const selectTotalExecutionsEventsHistory = createSelector(
  [selectExecutionsEventsHistory],
  (eventHistory) => eventHistory?.length
);

export const selectCurrentExecutionModules = createSelector(
  [selectCurrentExecution],
  (currentExecutions) => {
    if (!currentExecutions || !Object.keys(currentExecutions).length) {
      return null;
    }
    const sortedExecs = Object.entries(currentExecutions).sort(
      ([, { details: aDetails }], [, { details: bDetails }]) => {
        const dateA = new Date(aDetails.date_creation || 0);
        const dateB = new Date(bDetails.date_creation || 0);
        return dateB.getTime() - dateA.getTime();
      }
    );

    const [, { modules }] = sortedExecs[0];
    return modules;
  }
);

export const selectCurrentExecutionByModule = (moduleId: string, withVars = false) =>
  createSelector(
    [selectCurrentExecutionModules],
    (modules) => {
      if (!modules) {
        return null;
      }
      const execs = modules[moduleId] || {};
      const total = Object.keys(execs).length;
      let credits = 0;
      let llm_credits = 0;
      let api_credits = 0;
      let elapsedTime = 0;
      let payloadSize = 0;
      let moduleStatus = 'success';

      if (total === 0) return null;

      const details: Record<string, any> = {};
      Object.entries(execs).forEach(([moduleExecId, moduleExec]) => {
        credits += moduleExec.credits ?? 0;
        llm_credits += moduleExec.llm_credits ?? 0;
        api_credits += moduleExec.api_credits ?? 0;
        elapsedTime += moduleExec.elapsed_time ?? 0;
        payloadSize += moduleExec.payload_size ?? 0;
        details[moduleExecId] = {
          status:
            moduleExec.status ||
            (moduleExec.error ? 'error' : moduleExec.end_time ? 'success' : 'start'),
          ...(withVars
            ? {
                content: moduleExec.content || moduleExec.error,
                global_vars: moduleExec.global_vars || {},
              }
            : {}),
          timestamp:
            moduleExec.timestamp ||
            new Date(moduleExec.end_time || moduleExec.start_time).toISOString(),
        };
        if (details[moduleExecId].status === 'error') moduleStatus = 'error';
        else if (details[moduleExecId].status === 'start') moduleStatus = 'start';
      });

      return {
        details,
        total,
        status: moduleStatus,
        credits,
        llm_credits,
        api_credits,
        payloadSize,
        elapsedTime,
      };
    },
    {
      memoizeOptions: {
        resultEqualityCheck: checkObjectsEqual,
      },
    }
  );

export const selectModuleExecInMenu = (state: RootState): string | null =>
  selectFlowState(state).moduleExecInMenu;

export const selectCurrentExecutionModuleInMenu = (state: RootState) => {
  const moduleId = selectModuleExecInMenu(state);
  if (!moduleId) {
    return null;
  }
  return selectCurrentExecutionByModule(moduleId, true)(state);
};

export const selectCurrentExecutionFromHistory = createSelector(
  [selectFlowState, selectFlow],
  (flowState, flow) => (!!flow?.id ? flowState.executionsFromHistory[flow.id] : false)
);

export const selectAvailableFlowConnections = createSelector(
  [selectConnections, selectFlowDetails],
  (connections, flow) => !!flow?.id && connections[flow.account_id!]
);

// ----------------------------------------------------------------------

// ACTIONS

export const getFlows =
  (accountId: string): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const flowsInitialized = selectFlowStateInitialized('flows')(state);
    const flowsLoading = selectFlowStateLoading('flows')(state);
    if (flowsInitialized || flowsLoading) {
      return;
    }
    try {
      dispatch(slice.actions.startLoading('flows'));
      const response = await optimai.post(`/account/${accountId}/gq`, TARGETED_GQ);
      const accountBody = response.data;
      if (accountBody.id !== accountId) {
        throw Error('invalid account!');
      }
      dispatch(slice.actions.setFlows(accountBody.workflows.items));
      return Promise.resolve('success');
    } catch (e: any) {
      console.error(`error: could not get flows: ${e.message}`);
      dispatch(slice.actions.hasError({ mode: 'flows', error: e.message }));
      return Promise.reject(e);
    } finally {
      dispatch(slice.actions.stopLoading('flows'));
    }
  };

export const getFlow =
  (flowId: string): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const initialized = selectInitializedFlow(state);
    const isLoading = selectIsLoadingFlow(state);
    const accountId = state.general.account?.id;

    try {
      if (!flowId || !!initialized || !!isLoading || !accountId) {
        return;
      }
      dispatch(slice.actions.startLoading('flow'));
      const response = await optimai.get(`/flow/${flowId}?q=executions,template,modules`);
      const { flow } = response.data;
      if (flow.account_id !== accountId) {
        let error = false;
        dispatch(switchAccount({ accountId: flow.account_id }) as any).catch(() => {
          error = true;
        });
        if (error) {
          return Promise.reject('flow does not belong to current account');
        }
      }
      dispatch(slice.actions.setFlow(flow));
      dispatch(getConnections(flow.account_id) as any);
      return Promise.resolve('success');
    } catch (e: any) {
      console.error(`error: could not get flow: ${e.message}`);
      dispatch(slice.actions.hasError({ mode: 'flow', error: e.message }));
      return Promise.reject(e);
    } finally {
      dispatch(slice.actions.stopLoading('flow'));
    }
  };

export const getFlowExecutions =
  (flowId: string): AppThunk =>
  async (dispatch) => {
    try {
      if (!flowId) {
        return;
      }
      dispatch(slice.actions.startLoading('executions'));
      const response = await optimai.post(`/flow/${flowId}/executions`);
      dispatch(
        slice.actions.setFlowExecutions({
          flowId,
          executions: response.data.executions.items,
        })
      );
      return Promise.resolve('success');
    } catch (e: any) {
      console.error(`error: could not get flow executions: ${e.message}`);
      dispatch(slice.actions.hasError({ mode: 'executions' as any, error: e.message }));
      dispatch(
        slice.actions.setFlowExecutions({
          flowId,
          executions: [],
        })
      );
      return Promise.reject(e);
    } finally {
      dispatch(slice.actions.stopLoading('executions'));
    }
  };

export const activateFlow =
  (flowId: string | null = null, flowArgs: any = null): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const currentFlowId = selectFlowId(state);
    const currentAltanerId = selectCurrentAltaner(state)?.id;
    if (!(currentFlowId || flowId)) {
      return Promise.reject('no valid flow to execute');
    }
    try {
      let response;
      if (flowArgs) {
        response = await optimai_galaxia.post(
          `/flow/${flowId || currentFlowId}/internal-activate`,
          flowArgs,
          {
            params: { from_altaner: currentAltanerId },
          }
        );
      } else {
        response = await optimai_galaxia.get(`/flow/${flowId || currentFlowId}/activate`, {
          params: { from_altaner: currentAltanerId },
        });
      }
      return Promise.resolve(response);
    } catch (e: any) {
      console.error(`error: could not get flow: ${e.message}`);
      return Promise.reject(e);
    }
  };

export const retriggerExecutionEvent =
  (executionId: string): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const currentAltanerId = selectCurrentAltaner(state)?.id;
    try {
      await optimai_galaxia.get(`/execution/${executionId}/retrigger`, {
        params: { from_altaner: currentAltanerId },
      });
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const stopExecution =
  (executionId: string): AppThunk =>
  async () => {
    try {
      await optimai_galaxia.patch(`/execution/${executionId}/stop`);
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const patchFlow =
  (flowId: string, data: any): AppThunk =>
  async () => {
    try {
      await optimai.patch(`/flow/${flowId}`, data);
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const createModule =
  ({
    flowId,
    data,
    after,
    getPosition = false,
  }: {
    flowId: string;
    data: any;
    after?: AfterReference;
    getPosition?: boolean;
  }): AppThunk =>
  async (dispatch, getState) => {
    try {
      const position = selectModuleInPanelNew(getState())?.meta_data?.position;
      const moduleData: any = { ...data };
      if (!!after) {
        if (after.isExcept) {
          moduleData.is_except = true;
        }
        if (after.type === 'router') {
          const selectedCondition = after.condition;
          if (selectedCondition === 'default') {
            moduleData.after_module = after.id;
          } else {
            moduleData.after_route_condition = selectedCondition;
          }
        } else {
          moduleData.after_module = after.id;
        }
      }
      if (getPosition) {
        moduleData.module.canvas_position = position;
      }
      const response = await optimai.post(`/flow/${flowId}/module`, moduleData);
      batch(() => {
        dispatch(deleteNewModule(after ?? null));
        dispatch(clearModuleInMenu());
      });
      const { module } = response.data;
      return Promise.resolve(module.id);
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const deleteFlowModules =
  (moduleIds: string[]): AppThunk =>
  async (dispatch, getState) => {
    try {
      const currentFlowId = getState().flows.flow?.id;
      const idsQueryParam = moduleIds.join(',');
      await optimai.delete(`/flow/${currentFlowId}/delete-modules?ids=${idsQueryParam}`);
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const cloneModules =
  (moduleIds: string[]): AppThunk =>
  async (dispatch, getState) => {
    try {
      const currentFlowId = getState().flows.flow?.id;
      await optimai.post(`/flow/${currentFlowId}/clone-modules`, {
        ids: moduleIds,
      });
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const pasteModules =
  (ids: string[], initial_coordinates: any): AppThunk =>
  async (dispatch, getState) => {
    try {
      const currentFlowId = getState().flows.flow?.id;
      await optimai.post(`/flow/${currentFlowId}/paste-modules`, {
        ids,
        initial_coordinates,
      });
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const editModule =
  ({ id, data }: { id: string; data: any }): AppThunk =>
  async () => {
    try {
      await optimai.patch(`/module/${id}`, data);
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const deleteFlowModule =
  (moduleId: string): AppThunk =>
  async () => {
    try {
      await optimai.delete(`/module/${moduleId}`);
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const duplicateWorkflow =
  (flowId: string, componentId: string): AppThunk =>
  async () => {
    try {
      const response = await optimai.post(
        `/flow/${flowId}/duplicate?altaner_component_id=${componentId}`
      );
      return response.flow;
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const deleteWorkflow =
  (flowId: string): AppThunk =>
  async () => {
    try {
      await optimai.delete(`/flow/${flowId}`);
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const addRouterCondition =
  (routerId: string, condition_logic: any = null): AppThunk =>
  async () => {
    try {
      await optimai.post(`/module/${routerId}/condition`, {
        condition_logic,
      });
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const updateRouterConditionFilter =
  (routerId: string, conditionId: string, filter: any = null, description: string | null = null): AppThunk =>
  async () => {
    try {
      await optimai.patch(`/module/${routerId}/condition/${conditionId}/filter`, {
        filter_spec: filter,
        edge_description: description,
      });
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const updateModuleCanvasPosition =
  (moduleId: string, position: Position): AppThunk =>
  async () => {
    try {
      await optimai.patch(`/module/${moduleId}/canvas-position`, {
        position,
      });
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const renameFlowModule =
  (moduleId: string, name: string): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(slice.actions.clearSelectedModule());
      await optimai.patch(`/module/${moduleId}/rename`, {
        name: name,
      });
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const updateModuleCanvasPositions =
  (sendCommandWs: any, modules: any[], persist = false): AppThunk =>
  async (dispatch, getState) => {
    try {
      const state = getState();
      const existingModules = selectExistingModules(state);
      const workflow_id = selectFlowId(state);

      const { existing, temp } = modules.reduce(
        (
          acc,
          {
            data: {
              module: { id, after },
            },
            position,
          }
        ) => {
          if (existingModules.includes(id)) {
            acc.existing.push({ id, position, workflow_id });
          } else {
            acc.temp.push({ position, after });
          }
          return acc;
        },
        {
          existing: [],
          temp: [],
        } as any
      );
      if (!!existing?.length) {
        dispatch(updateModulesPosition(existing));
      }
      if (!!temp?.length) {
        dispatch(updateNewModulesPosition(temp));
      }
      if (!!existing?.length) {
        sendCommandWs(
          persist ? 'u_module_canvas_position' : 'u_module_canvas_position_temp',
          existing
        );
      }
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const updateEdgeFilter =
  (
    sourceId: string,
    targetId: string,
    filter: any = null,
    description: string | null = null,
    filter_mode: string | null = null
  ): AppThunk =>
  async () => {
    try {
      await optimai.patch(`/module/${targetId}/in-edge-filter`, {
        source_module_id: sourceId,
        filter_spec: filter,
        filter_mode,
        edge_description: description,
      });
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const updateEdge =
  (
    source_module_id: string,
    condition_id: string | null,
    target_module_id: string | null = null,
    is_except = false
  ): AppThunk =>
  async (dispatch, getState) => {
    const flowId = getState().flows.flow?.id;
    try {
      await optimai.patch(`/flow/${flowId}/update-edge`, {
        source_module_id,
        condition_id,
        target_module_id,
        is_except,
      });
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

const extractModules = (modules: Record<string, Record<string, any>>, execution: any): void => {
  for (const [moduleExecutionId, moduleExecution] of Object.entries(execution.modules)) {
    const moduleId = (moduleExecution as any).module.id;
    if (!modules[moduleId]) {
      modules[moduleId] = {};
    }
    modules[moduleId][moduleExecutionId] = moduleExecution;
  }
  for (const [, flowExecution] of Object.entries(execution.executions || {})) {
    extractModules(modules, flowExecution);
  }
};

const transformExecution = (execution: any): Record<string, Record<string, any>> => {
  const modules: Record<string, Record<string, any>> = {};
  extractModules(modules, execution);
  return modules;
};

async function safeJsonParse(
  response: Response,
  replacements: Record<string, string> = { Infinity: 'null', '-Infinity': 'null', NaN: 'null' }
): Promise<any> {
  const responseClone = response.clone();
  try {
    return await response.json();
  } catch (jsonError: any) {
    let rawText = await responseClone.text();
    rawText = rawText.replace(/^\ufeff/, '');

    for (const token in replacements) {
      if (Object.prototype.hasOwnProperty.call(replacements, token)) {
        const regex = new RegExp(`\\b${token}\\b`, 'g');
        rawText = rawText.replace(regex, replacements[token]);
      }
    }

    try {
      return JSON.parse(rawText);
    } catch (cleanError: any) {
      throw new Error(`JSON parsing failed.
Original error: ${jsonError.message}
Error after cleaning: ${cleanError.message}`);
    }
  }
}

export const getFlowExecutionDetails =
  (selectedExecutionId: string | null = null, flowId: string | null = null, extra: any = null): AppThunk =>
  async (dispatch, getState) => {
    let executionId = selectedExecutionId;
    let executionExtra = extra;
    try {
      if (!executionId) {
        const executions = selectCurrentFlowExecutions(getState());
        if (!executions?.length) {
          return Promise.reject('no executions available');
        }
        const sortedExecutions = [...executions].sort(
          (prev, next) =>
            new Date(next.finished_at || next.date_creation).getTime() -
            new Date(prev.finished_at || prev.date_creation).getTime()
        );
        executionExtra = sortedExecutions[0];
        executionId = executionExtra.id;
      }
      const response = await optimai.get(`/executions/${executionId}/signed-url`);
      const signedUrl = response.data.execution.signed_url;
      const jsonResponse = await fetch(signedUrl);
      if (!jsonResponse.ok) {
        throw new Error(`Failed to fetch JSON from signed URL: ${jsonResponse.statusText}`);
      }
      const jsonData = await safeJsonParse(jsonResponse);
      const { modules, ...detailsWithoutModules } = jsonData;
      const allModules = transformExecution(jsonData);
      const dataToDispatch = {
        flowId: flowId!,
        execution: {
          [executionId]: {
            details: { ...detailsWithoutModules, ...(executionExtra || {}) },
            modules: allModules,
          },
        },
      };
      dispatch(setFlowExecution(dataToDispatch));
      dispatch(setIsFlowExecutionHistoryActive(false));
      return Promise.resolve(true);
    } catch (e: any) {
      console.error(`Error fetching execution data for ID ${executionId}: ${e.message}`);
      return Promise.reject(e.message);
    }
  };

export const createModulesAfterTriggers = (): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const existingTriggers = selectExistingTriggers(state);
  const flowModules = selectFlowModulesPositions(state);
  batch(() => {
    for (const trigger of existingTriggers) {
      const after: AfterReference = {
        type: 'trigger',
        id: trigger,
      };

      const prevPosition = flowModules[trigger];
      dispatch(
        addNewModule({
          after,
          position: {
            x: (prevPosition?.x ?? 0) + 250,
            y: (prevPosition?.y ?? 0) + 25,
          },
        })
      );
    }
  });
};

