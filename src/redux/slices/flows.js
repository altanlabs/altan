import { createSelector, createSlice } from '@reduxjs/toolkit';
// utils
import { uniqueId } from 'lodash';
import { batch } from 'react-redux';
import { validate as isValidUUID } from 'uuid';

import { selectCurrentAltaner } from './altaners';
import { getConnections, selectConnections } from './connections';
import { switchAccount } from './general';
import { optimai, optimai_galaxia } from '../../utils/axios';
import { checkArraysEqualShallow, checkObjectsEqual } from '../helpers/memoize';

// ----------------------------------------------------------------------

const setUpModule = (state, m, update = false) => {
  const { next_module_id, route_conditions, ...moduleAttributes } = m;
  const module = { ...moduleAttributes };
  if (m.type === 'router') {
    if ('route_conditions' in m) {
      const routeConditionsIds = [];
      for (const rc of route_conditions) {
        const { next_module_id: rcNextModuleId, ...rcAttributes } = rc;
        state.route_conditions[rcAttributes.id] = rcAttributes;
        routeConditionsIds.push(rcAttributes.id);
        state.next_module_mappings.conditions[rcAttributes.id] = rcNextModuleId;
      }
      state.router_conditions[m.id] = routeConditionsIds;
    }
  }
  if ('meta_data' in module) {
    if ('position' in module.meta_data) {
      state.positions.existing[m.id] = { ...module.meta_data.position };
      try {
        delete module.meta_data.position;
      } catch (e) {
        // module.meta_data = Object.fromEntries(
        //   Object.entries(module.meta_data)
        //     .filter(([key]) => key !== "position")
        // );
        // console.warn("could not delete module.meta_data.position:", e)
      }
    }
  }
  if ('next_module_id' in m) {
    if (!m.next_module_id) {
      if (m.id in state.next_module_mappings.modules) {
        delete state.next_module_mappings.modules[m.id];
      }
    } else {
      state.next_module_mappings.modules[m.id] = next_module_id;
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
    if (m.type === 'internal') {
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

const singleFlowInitialState = {
  flow: null,
  newModules: {},
  modules: {},
  module_types: {},
  route_conditions: {}, // condition id and condition
  next_module_mappings: {
    modules: {},
    conditions: {},
    excepts: {},
  },
  router_conditions: {}, // router and its conditions
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

const initialState = {
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

const slice = createSlice({
  name: 'flows',
  initialState,
  reducers: {
    startLoading(state, action) {
      const mode = action.payload;
      state.isLoading[mode] = true;
    },
    stopLoading(state, action) {
      const mode = action.payload;
      state.isLoading[mode] = false;
    },
    setSelectedModule(state, action) {
      state.selectedModuleId = action.payload;
    },
    clearSelectedModule(state) {
      state.selectedModuleId = null;
    },
    setModuleExecInMenu(state, action) {
      state.moduleExecInMenu = action.payload;
    },
    clearModuleExecInMenu(state) {
      state.moduleExecInMenu = null;
    },
    // NEW MODULES
    addNewModule(state, action) {
      const { after, position } = action.payload;
      const newId = uniqueId();
      if (!after?.id) {
        state.newModules.trigger = { id: newId, type: 'trigger', position: 0 };
        state.menuModule = {
          module: { id: null, after: 'trigger' },
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
    deleteNewModule(state, action) {
      const after = action.payload;
      const menuModule = state.menuModule;
      if (!!menuModule.anchorEl && !menuModule.module.id) {
        if ((after?.id ?? null) === (menuModule.module.after?.id ?? null)) {
          Object.assign(state.menuModule, singleFlowInitialState.menuModule);
        }
      }
      if (!after) {
        return;
      }
      const previousModuleId = after.isExcept ? `e-${after.id}` : after.id; // ?? "trigger";
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
    setNewModuleType(state, action) {
      // only existing modules
      const { type, action: actionType, after: afterOverride, ...args } = action.payload;
      const after = afterOverride ?? state.drawerNewModule;
      const common = { type, ...(args || {}) };
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
      // dispatch(setModuleInMenu({ id: null, after }));
    },
    onNewModuleClick(state, action) {
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
    updateNewModulesPosition(state, action) {
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
    setIsFlowExecutionHistoryActive(state, action) {
      state.isFlowExecutionHistoryActive = action.payload;
    },
    setModuleInputActive(state, action) {
      state.moduleInputActive = action.payload;
    },
    toggleFlowHistoryActive(state) {
      state.isFlowExecutionHistoryActive = !state.isFlowExecutionHistoryActive;
    },
    setCurrentToolSchema(state, action) {
      const schema = action.payload;
      state.currentToolSchema = schema;
    },
    setModuleInMenu(state, action) {
      const { module, anchorEl } = action.payload;
      state.menuModule = {
        module,
        anchorEl,
      };
    },
    clearModuleInMenu(state) {
      Object.assign(state.menuModule, singleFlowInitialState.menuModule);
    },
    setNewModuleInDrawer(state, action) {
      const after = action.payload;
      state.drawerNewModule = after;
    },
    clearNewModuleInDrawer(state) {
      state.drawerNewModule = null;
    },
    hasError(state, action) {
      const { error, mode } = action.payload;
      state.error[mode] = error;
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
    setFlows(state, action) {
      state.flows = action.payload;
      state.initialized.flows = true;
    },
    addFlow(state, action) {
      const flow = action.payload;
      state.flows = [flow, ...state.flows];
    },
    setInitializedNodes(state) {
      state.initialized.nodes = true;
    },
    deleteFlow(state, action) {
      const flowId = action.payload;
      state.flows = state.flows.filter((flow) => flow.id !== flowId);
    },
    setFlow(state, action) {
      const { modules, ...flow } = action.payload;
      state.flow = flow;
      modules.forEach((m) => setUpModule(state, m));
      state.initialized.flow = true;
      state.initialized.executions = false;
    },
    setFlowExecutions(state, action) {
      const {
        // flowId,
        executions,
      } = action.payload;
      state.flow_executions = executions;
      // state.executions[flowId] = executions;
      state.initialized.executions = true;
    },
    setFlowExecution(state, action) {
      const { flowId, execution } = action.payload;
      state.executionsFromHistory[flowId] = true;
      state.executions[flowId] = execution;
      // state.initialized.nodes = false;
    },
    clearFlowExecution(state, action) {
      const { flowId } = action.payload;
      if (flowId in state.executionsFromHistory) {
        delete state.executionsFromHistory[flowId];
      }
      if (flowId in state.executions) {
        delete state.executions[flowId];
      }
    },
    updateFlow(state, action) {
      const { id, ...updatedProps } = action.payload;
      if (state.flow && state.flow.id === id) {
        state.flow = { ...state.flow, ...updatedProps };
      }
      const flowIndex = state.flows.findIndex((flow) => flow.id === id);
      state.flows[flowIndex] = { ...state.flows[flowIndex], ...updatedProps };
    },
    addWebhookSubscription(state, action) {
      if (!state.flow) {
        return;
      }
      const webhookSubscription = action.payload;
      const triggerId = webhookSubscription?.trigger_id;
      if (!triggerId || !(triggerId in state.modules)) {
        return;
      }
      // console.log("@addRouteCondition", attributes);
      if (!state.modules[triggerId].subscriptions) {
        state.modules[triggerId].subscriptions = [];
      }
      state.modules[triggerId].subscriptions.push(webhookSubscription);
    },
    deleteWebhookSubscription(state, action) {
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
            (s) => !ids.includes(s.id),
          );
        }
      }
    },
    addModule(state, action) {
      if (!state.flow) {
        return;
      }
      const module = action.payload;
      // if (module.type === 'trigger') {
      //   state.flow.entry_module_id = module.id;
      // }
      if ('trigger' in state.newModules) {
        delete state.newModules.trigger;
      }
      setUpModule(state, module);
    },
    deleteModules(state, action) {
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
    updateModule(state, action) {
      if (!state.flow) {
        return;
      }
      const { id, ...updatedProps } = action.payload;
      if (!(id in state.modules)) {
        return;
      }
      setUpModule(state, { id, ...updatedProps }, true);
    },
    updateTool(state, action) {
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
    updateRouteCondition(state, action) {
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
          state.next_module_mappings.conditions[id] = next_module_id;
        }
        Object.assign(state.route_conditions[id], updatedRC);
      }
    },
    deleteRouteCondition(state, action) {
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
            (rcId) => rcId !== id,
          );
        }
        delete state.route_conditions[id];
        if (id in state.next_module_mappings.conditions) {
          delete state.next_module_mappings.conditions[id];
        }
      }
    },
    updateModulesPosition(state, action) {
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
    addRouteCondition(state, action) {
      if (!state.flow) {
        return;
      }
      const condition = action.payload;
      const routerId = condition?.router_id;
      if (!routerId || !(routerId in state.modules)) {
        return;
      }
      // console.log("@addRouteCondition", attributes);
      if (!(routerId in state.router_conditions)) {
        state.router_conditions[routerId] = [];
      }
      state.router_conditions[routerId].push(condition.id);
      state.route_conditions[condition.id] = condition;
    },
    clearCurrentFlow(state) {
      // state.flow = null;
      // state.flow_executions = [];
      // state.modules = {};
      // state.route_conditions = {};
      // state.router_conditions = {};
      // state.next_module_mappings = {
      //   modules: {},
      //   conditions: {}
      // };
      // state.positions = {
      //   existing: {},
      //   new: {}
      // };
      // state.module_types = {};
      state.initialized.flow = false;
      state.initialized.nodes = false;
      state.initialized.executions = false;
      state.isLoading.flow = false;
      state.isLoading.executions = false;
      state.error.flow = false;
      for (const [k, v] of Object.entries(singleFlowInitialState)) {
        state[k] = v;
      }
    },
    addTemplate(state, action) {
      if (!state.flow) {
        return;
      }
      const { flow_id, attributes } = action.payload;
      if (state.flow.id !== flow_id) {
        return;
      }
      state.flow.template = attributes;
    },
    updateTemplate(state, action) {
      if (!state.flow) {
        return;
      }
      const { flow_id, ids, changes } = action.payload;
      if (state.flow.id !== flow_id || state.flow.template?.id !== ids[0]) {
        return;
      }
      state.flow.template = { ...(state.flow.template || {}), ...changes };
    },
    deleteTemplate(state, action) {
      if (!state.flow) {
        return;
      }
      const { flow_id, ids } = action.payload;
      if (state.flow.id !== flow_id || state.flow.template?.id !== ids[0]) {
        return;
      }
      delete state.flow.template;
    },
    addTemplateVersion(state, action) {
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
    updateTemplateVersion(state, action) {
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
    deleteTemplateVersion(state, action) {
      if (!state.flow?.template?.versions) {
        return;
      }
      const { flow_id, ids } = action.payload;
      if (state.flow.id !== flow_id || !ids.length) {
        return;
      }
      state.flow.template.versions = state.flow.template.versions.filter(
        (v) => !ids.includes(v.id),
      );
    },
    addOrUpdateModuleExecution(state, action) {
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
        moduleExecutions[id] = moduleExecution;
      }
    },
    addFlowExecution(state, action) {
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
      // TODO: add to current flow execs
      // const currentFlowId = state.flow?.id;
      // if (!!currentFlowId && currentFlowId === flow_id) {
      //   state.flow_executions.push()
      // }
    },
    updateFlowExecution(state, action) {
      const { id, ...updatedProps } = action.payload;
      let flow_id = null;
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
    // executions: {
    //   "@fields": ["id", "date_creation"],
    // },
  },
};

// SELECTORS

const selectFlowState = (state) => state.flows;

export const selectFlow = (state) => selectFlowState(state).flow;

export const selectFlowStateInitialized = (mode) => (state) =>
  selectFlowState(state).initialized[mode];

export const selectFlowStateLoading = (mode) => (state) => selectFlowState(state).isLoading[mode];

export const selectInitializedFlow = (state) => selectFlowStateInitialized('flow')(state);

export const selectIsLoadingFlow = (state) => selectFlowStateLoading('flow')(state);

export const selectFlowStatus = (state) => selectFlowState(state).flow?.is_active;

export const selectCurrentFlowExecutions = (state) => selectFlowState(state).flow_executions;

export const selectInitializedNodes = (state) => selectFlowStateInitialized('nodes')(state);

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
  },
);

export const selectFlowTemplate = (state) => selectFlow(state)?.template;

export const selectFlowExecutions = (state) => selectFlowState(state).flow_executions;

export const selectFlowId = (state) => selectFlow(state)?.id;

export const selectFlowMetadata = (state) => selectFlow(state)?.meta_data;

export const selectNewModules = (state) => selectFlowState(state).newModules;

export const selectFlowModules = (state) => selectFlowState(state).modules;

export const selectSelectedModuleId = (state) => selectFlowState(state).selectedModuleId;

export const selectSelectedModule = (state) =>
  selectFlowModules(state)?.[selectSelectedModuleId(state)];

export const selectModulesOrderPositions = createSelector(
  [selectFlowModules],
  (modules) =>
    Object.values(modules).reduce((acc, m) => {
      acc[parseInt(m.position, 10)] = m.id;
      return acc;
    }, {}),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

export const selectModulesTypes = (state) => selectFlowState(state).module_types;

export const selectRouteConditions = (state) => selectFlowState(state).route_conditions;

export const selectRouterConditions = (state) => selectFlowState(state).router_conditions;

export const selectNextModuleMapping = (state) => selectFlowState(state).next_module_mappings;

export const selectNextModuleMappingModules = (state) => selectNextModuleMapping(state).modules;

export const selectNextModuleMappingConditions = (state) =>
  selectNextModuleMapping(state).conditions;

export const selectModuleInMenu = (state) => selectFlowState(state).menuModule.module;

export const selectIteratorModules = createSelector(
  [selectFlowModules],
  (modules) =>
    Object.fromEntries(Object.entries(modules).filter(([, module]) => module.type === 'iterator')),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

// const getAllNextModules = (modules) => {
//   const allNextModules = [];
//   const conditionIds = [];
//   Object.values(modules).forEach((mod) => {
//     if (mod.type === "router" && !!mod.route_conditions) {
//       mod.route_conditions.forEach((c) => {
//         allNextModules.push(c.next_module_id);
//         conditionIds.push(c.id);
//       });
//     }
//     allNextModules.push(mod.next_module_id);
//   });
//   return {
//     next: allNextModules,
//     conditions: conditionIds
//   };
// }

export const selectFlowModulesPositions = (state) => selectFlowState(state).positions.existing;

export const selectSourceHandles = createSelector(
  [selectFlowModules, selectRouterConditions],
  (modules, router_conditions) =>
    Object.values(modules).reduce((acc, m) => {
      const sourceHandles = [];
      if (m.type === 'router') {
        const routerModuleId = m.id;
        const conditions = router_conditions[routerModuleId] ?? [];
        for (const rcId of conditions) {
          sourceHandles.push({
            id: `${routerModuleId}-s:${rcId}`,
            // priority: condition.priority,
            conditionId: rcId,
          });
        }
      }
      if (m.type !== 'internal' || m.internal_type !== 'response') {
        sourceHandles.push({ id: `${m.id}-s`, default: m.type === 'router' });
      }
      acc[m.id] = sourceHandles;
      return acc;
    }, {}),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

export const selectExistingModules = createSelector(
  [selectFlowModules],
  (modules) => Object.keys(modules),
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualShallow,
    },
  },
);

export const selectExistingTriggers = createSelector(
  [selectFlowModules],
  (modules) => Object.keys(modules).filter((mId) => modules[mId].type === 'trigger'),
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualShallow,
    },
  },
);

export const selectTotalFlowModules = createSelector(
  [selectExistingModules],
  (modulesIds) => modulesIds.length,
);

export const currentToolSchemaSelector = (state) => selectFlowState(state).currentToolSchema;

const extractNewModules = (newModules) => {
  const modules = [];
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
    ...extractNewModules(newModules).reduce((acc, m) => {
      acc[m.id] = m.meta_data?.position ?? {};
      return acc;
    }, {}),
  }),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

export const selectMustCreateTrigger = createSelector(
  [selectFlowId, selectExistingTriggers, selectExistingModules, selectNewModules],
  (flowId, existingTriggers, existingModules, newModules) =>
    !!flowId && !existingTriggers.length && !existingModules.length && !newModules.trigger,
);

export const selectMustCreateModuleAfterTriggers = createSelector(
  [selectFlowId, selectExistingTriggers, selectExistingModules, selectNewModules],
  (flowId, existingTriggers, existingModules, newModules) =>
    !!flowId &&
    !!existingTriggers.length &&
    existingModules.length === existingTriggers.length &&
    !Object.keys(newModules).length,
);

export const selectPanelNew = (state) => selectFlowState(state).drawerNewModule;

export const selectModuleInPanelNew = (state) => {
  const after = selectPanelNew(state);
  if (!after) {
    return null;
  }
  const newModules = selectNewModules(state);
  const previousModuleId = after?.isExcept ? `e-${after?.id}` : (after?.id ?? 'trigger');
  const previousConditionId = after?.condition;
  // console.log(`getModuleInPanel (${after})`);
  return previousConditionId !== null
    ? newModules[previousModuleId]?.[previousConditionId]
    : newModules[previousModuleId];
};

// export const selectFullModule = (moduleId = null, after = null) => (state) => {
//   if (!!moduleId && isValidUUID(moduleId) && !after) {
//     return selectFlowModules(state)[moduleId];
//   }
//   const newModules = selectNewModules(state);
//   const previousModuleId = after?.id ?? "trigger";
//   const previousConditionId = after?.condition;
//   return !!previousConditionId ? newModules[previousModuleId]?.[previousConditionId] : newModules[previousModuleId];
// };

function generateJsonSchema(fields) {
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
    }, {}),
    required: fields
      .filter((field) => field.value === null)
      .map((field) => `$${field.module_position}%_${field.name}`),
  };
}

export const selectFlowSchema = createSelector([selectFlowModules], (flowModules) =>
  generateJsonSchema(
    Object.values(flowModules)
      .filter((m) => m.type === 'internal' && m.internal_type === 'vars')
      .flatMap((module) =>
        module.logic.variables
          .filter((v) => v.expose)
          .map(({ expose, is_template, altaner_variable, ...rest }) => ({
            module_position: module.position,
            ...rest,
          })),
      ),
  ),
);

export const makeSelectModule = () =>
  createSelector(
    [
      selectFlowModules,
      selectNewModules,
      (state, moduleId = null) => moduleId,
      (state, moduleId, after = null) => after,
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
    },
  );

export const makeSelectFullModule = () =>
  createSelector(
    [
      selectFlowModules,
      selectNewModules,
      selectRouterConditions,
      (state, moduleId = null) => moduleId,
      (state, moduleId, after = null) => after,
    ],
    (flowModules, newModules, routeConditions, moduleId, after) => {
      if (!!moduleId && isValidUUID(moduleId) && !after) {
        const module = { ...flowModules[moduleId] };
        if (module.type === 'router') {
          module.route_conditions = (routeConditions[moduleId] ?? []).map(
            (rcId) => routeConditions[rcId],
          );
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
    },
  );

const selectNewModulePosition = (state) => selectModuleInPanelNew(state)?.meta_data?.position;

export const makeSelectModuleFilter = () =>
  createSelector(
    [
      (state, sourceId, moduleId, after = null) => makeSelectModule()(state, moduleId, after),
      (state, sourceId) => sourceId,
    ],
    (module, sourceId) => {
      const res = {};
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
    },
  );

export const makeSelectConditionFilter = () =>
  createSelector(
    [
      makeSelectModule(),
      selectRouteConditions,
      (state, moduleId = null) => moduleId,
      (state, moduleId, after, conditionId = null) => conditionId,
    ],
    (module, routeConditions, moduleId, conditionId) => {
      const condition = moduleId
        ? routeConditions[conditionId]
        : module.route_conditions.find((c) => c.id === conditionId);
      return {
        initialFilter: condition?.condition_logic,
        initialDescription: condition?.meta_data?.['_edge_description'],
      };
    },
  );

export const makeSelectEdgeDescription = () =>
  createSelector([makeSelectModuleFilter()], (filter) => filter.initialDescription);

export const makeSelectConditionDescription = () =>
  createSelector([makeSelectConditionFilter()], (filter) => filter.initialDescription);

export const makeSelectHasModuleFilter = () =>
  createSelector(
    [makeSelectModuleFilter()],
    (filter) => !!Object.keys(filter.initialFilter ?? {}).length,
  );

export const makeSelectHasConditionFilter = () =>
  createSelector(
    [makeSelectConditionFilter()],
    (filter) => !!Object.keys(filter.initialFilter ?? {}).length,
  );

// export const selectModule =
//   (moduleId = null, after = null) =>
//   (state) => {
//     if (!!moduleId && isValidUUID(moduleId) && !after) {
//       return selectFlowModules(state)[moduleId];
//     }
//     const previousModuleId = after?.id ?? 'trigger';
//     const previousConditionId = after?.condition;
//     const newModules = selectNewModules(state);
//     return !!previousConditionId
//       ? newModules[previousModuleId]?.[previousConditionId]
//       : newModules[previousModuleId];
//   };

// export const selectFullModule = (moduleId = null, after = null) =>
//   createSelector(
//     [(state) => state],
//     (state) => {
//       if (!!moduleId && isValidUUID(moduleId) && !after) {
//         const module = { ...selectFlowModules(state)[moduleId] };
//         if (module.type === 'router') {
//           module.route_conditions = (selectRouterConditions(state)[moduleId] ?? []).map(
//             (rcId) => selectRouteConditions(state)[rcId],
//           );
//         }
//         return module;
//       }
//       const previousModuleId = after?.id ?? 'trigger';
//       const previousConditionId = after?.condition;
//       const newModules = selectNewModules(state);
//       return !!previousConditionId
//         ? newModules[previousModuleId]?.[previousConditionId]
//         : newModules[previousModuleId];
//     },
//     {
//       memoizeOptions: {
//         resultEqualityCheck: checkObjectsEqual,
//       },
//     },
//   );

// const selectNewModulePosition = (state) => selectModuleInPanelNew(state)?.meta_data?.position;

// export const selectModuleFilter = (sourceId, moduleId = null, after = null) =>
//   createSelector([selectModule(moduleId, after)], (module) => {
//     const res = {};
//     const filterSpec = module?.meta_data?.['_filter_spec'];
//     const edgeDescription = module?.meta_data?.['_edge_description'];
//     if (!!filterSpec) {
//       res.initialFilter = filterSpec;
//     }
//     if (!!edgeDescription) {
//       res.initialDescription = edgeDescription;
//     }
//     if (module?.type === 'internal' && module?.internal_type === 'octopus') {
//       if (!!filterSpec && typeof filterSpec === 'object') {
//         res.initialFilter = filterSpec[sourceId];
//       }
//       if (!!edgeDescription && typeof edgeDescription === 'object') {
//         res.initialDescription = edgeDescription[sourceId];
//       }
//     } else {
//       res.initialFilterMode = module?.meta_data?.['_filter_mode'];
//     }
//     return res;
//   });

// export const selectConditionFilter = (moduleId = null, after = null, conditionId = null) =>
//   createSelector([(state) => state], (state) => {
//     console.log('rerender selectConditionFilter');

//     const condition = moduleId
//       ? selectRouteConditions(state)[conditionId]
//       : selectModule(moduleId, after)(state).route_conditions.find((c) => c.id === conditionId);
//     return {
//       initialFilter: condition?.condition_logic,
//       initialDescription: condition?.meta_data?.['_edge_description'],
//     };
//   });

// export const selectEdgeDescription = (sourceId, moduleId = null, after = null) =>
//   createSelector(
//     [selectModuleFilter(sourceId, moduleId, after)],
//     (filter) => filter.initialDescription,
//   );

// export const selectConditionDescription = (moduleId = null, after = null, conditionId = null) =>
//   createSelector(
//     [selectConditionFilter(moduleId, after, conditionId)],
//     (filter) => filter.initialDescription,
//   );

// export const selectHasModuleFilter = (sourceId, moduleId = null, after = null) =>
//   createSelector(
//     [selectModuleFilter(sourceId, moduleId, after)],
//     (filter) => !!Object.keys(filter.initialFilter ?? {}).length,
//   );

// export const selectHasConditionFilter = (moduleId = null, after = null, conditionId = null) =>
//   createSelector(
//     [selectConditionFilter(moduleId, after, conditionId)],
//     (filter) => !!Object.keys(filter.initialFilter ?? {}).length,
//   );

export const selectCurrentExecution = createSelector(
  [selectFlowState, selectFlow],
  (flowState, flow) => (!!flow?.id ? flowState.executions[flow.id] : null),
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
        return dateB - dateA; // Sort in descending order (most recent first)
      },
    );

    return sortedExecs
      .map(([, e]) => ({
        id: e.details?.flow_execution_id,
        status: e.details?.status,
        date_creation: e.details?.date_creation,
      }))
      .filter((e) => e.status === 'running');
  },
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
      .filter((ex) => !!ex?.event?.id) // Ensure event and event ID exist
      .forEach((ex) => {
        // Use the event ID as the key to deduplicate
        const eventId = ex.event.id;
        if (!uniqueEventsMap.has(eventId)) {
          uniqueEventsMap.set(eventId, ex);
        } else {
          // Optionally, decide whether to keep the current or the existing event
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
      return dateB - dateA; // Sort in descending order (most recent first)
    });
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

export const selectTotalExecutionsEventsHistory = createSelector(
  [selectExecutionsEventsHistory],
  (eventHistory) => eventHistory?.length,
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
        return dateB - dateA; // Sort in descending order (most recent first)
      },
    );

    const [, { modules }] = sortedExecs[0];
    return modules;
  },
);

export const selectCurrentExecutionByModule = (moduleId, withVars = false) =>
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

      const details = {};
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
    },
  );

export const selectModuleExecInMenu = (state) => selectFlowState(state).moduleExecInMenu;

export const selectCurrentExecutionModuleInMenu = (state) => {
  const moduleId = selectModuleExecInMenu(state);
  if (!moduleId) {
    return null;
  }
  return selectCurrentExecutionByModule(moduleId, true)(state);
};

export const selectCurrentExecutionFromHistory = createSelector(
  [selectFlowState, selectFlow],
  (flowState, flow) => (!!flow?.id ? flowState.executionsFromHistory[flow.id] : false),
);

export const selectAvailableFlowConnections = createSelector(
  [selectConnections, selectFlowDetails],
  (connections, flow) => !!flow?.id && connections[flow.account_id],
);

// ----------------------------------------------------------------------

// ACTIONS

export const getFlows = (accountId) => async (dispatch, getState) => {
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
  } catch (e) {
    console.error(`error: could not get flows: ${e.message}`);
    dispatch(slice.actions.hasError({ mode: 'flows', error: e.message }));
    return Promise.reject(e);
  } finally {
    dispatch(slice.actions.stopLoading('flows'));
  }
};

export const getFlow = (flowId) => async (dispatch, getState) => {
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
      dispatch(switchAccount({ accountId: flow.account_id })).catch(() => {
        error = true;
      });
      if (error) {
        return Promise.reject('flow does not belong to current account');
      }
    }
    dispatch(slice.actions.setFlow(flow));
    dispatch(getConnections(flow.account_id));
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not get flow: ${e.message}`);
    dispatch(slice.actions.hasError({ mode: 'flow', error: e.message }));
    return Promise.reject(e);
  } finally {
    dispatch(slice.actions.stopLoading('flow'));
  }
};

export const getFlowExecutions = (flowId) => async (dispatch) => {
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
      }),
    );
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not get flow executions: ${e.message}`);
    dispatch(slice.actions.hasError({ mode: 'executions', error: e.message }));
    // Set initialized to true even on error to prevent loops
    dispatch(
      slice.actions.setFlowExecutions({
        flowId,
        executions: [],
      }),
    );
    return Promise.reject(e);
  } finally {
    dispatch(slice.actions.stopLoading('executions'));
  }
};

export const activateFlow =
  (flowId = null, flowArgs = null) =>
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
          },
        );
      } else {
        response = await optimai_galaxia.get(`/flow/${flowId || currentFlowId}/activate`, {
          params: { from_altaner: currentAltanerId },
        });
      }
      return Promise.resolve(response);
    } catch (e) {
      console.error(`error: could not get flow: ${e.message}`);
      return Promise.reject(e);
    }
  };

export const retriggerExecutionEvent = (executionId) => async (dispatch, getState) => {
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

export const stopExecution = (executionId) => async () => {
  try {
    await optimai_galaxia.patch(`/execution/${executionId}/stop`);
    return Promise.resolve('success');
  } catch (e) {
    return Promise.reject(e);
  }
};

export const patchFlow = (flowId, data) => async () => {
  // console.log("flowId", flowId)
  // console.log("data", data)
  try {
    await optimai.patch(`/flow/${flowId}`, data);
    return Promise.resolve('success');
  } catch (e) {
    return Promise.reject(e);
  }
};

export const createModule =
  ({ flowId, data, after, getPosition = false }) =>
  async (dispatch, getState) => {
    try {
      const position = selectNewModulePosition(getState());
      const moduleData = { ...data };
      if (!!after) {
        if (after.isExcept) {
          moduleData.is_except = true;
        }
        if (after.type === 'router') {
          const selectedCondition = after.condition;
          if (selectedCondition === 'default') {
            moduleData.after_module = after.id;
          } else {
            // const conditions = (!!getModule ? getModule(after.id) : null)?.route_conditions;
            // moduleData.after_route_condition = conditions?.find(c => c.priority === selectedCondition)?.id;
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

export const deleteFlowModules = (moduleIds) => async (dispatch, getState) => {
  try {
    const currentFlowId = getState().flows.flow?.id;
    const idsQueryParam = moduleIds.join(',');
    await optimai.delete(`/flow/${currentFlowId}/delete-modules?ids=${idsQueryParam}`);
    return Promise.resolve('success');
  } catch (e) {
    return Promise.reject(e);
  }
};

export const cloneModules = (moduleIds) => async (dispatch, getState) => {
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

export const pasteModules = (ids, initial_coordinates) => async (dispatch, getState) => {
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
  ({ id, data }) =>
  async () => {
    try {
      await optimai.patch(`/module/${id}`, data);
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const deleteFlowModule = (moduleId) => async () => {
  try {
    await optimai.delete(`/module/${moduleId}`);
    return Promise.resolve('success');
  } catch (e) {
    return Promise.reject(e);
  }
};

export const duplicateWorkflow = (flowId, componentId) => async () => {
  try {
    const response = await optimai.post(
      `/flow/${flowId}/duplicate?altaner_component_id=${componentId}`,
    );
    return response.flow;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const deleteWorkflow = (flowId) => async () => {
  try {
    await optimai.delete(`/flow/${flowId}`);
    return Promise.resolve('success');
  } catch (e) {
    return Promise.reject(e);
  }
};

export const addRouterCondition =
  (routerId, condition_logic = null) =>
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
  (routerId, conditionId, filter = null, description = null) =>
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

export const updateModuleCanvasPosition = (moduleId, position) => async () => {
  try {
    await optimai.patch(`/module/${moduleId}/canvas-position`, {
      position,
    });
    return Promise.resolve('success');
  } catch (e) {
    return Promise.reject(e);
  }
};

export const renameFlowModule = (moduleId, name) => async (dispatch) => {
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
  (sendCommandWs, modules, persist = false) =>
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
          },
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
        },
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
          existing,
        );
      }
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const updateEdgeFilter =
  (sourceId, targetId, filter = null, description = null, filter_mode = null) =>
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
  (source_module_id, condition_id, target_module_id = null, is_except = false) =>
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

const extractModules = (modules, execution) => {
  for (const [moduleExecutionId, moduleExecution] of Object.entries(execution.modules)) {
    const moduleId = moduleExecution.module.id;
    if (!modules[moduleId]) {
      modules[moduleId] = {};
    }
    modules[moduleId][moduleExecutionId] = moduleExecution;
  }
  for (const [, flowExecution] of Object.entries(execution.executions)) {
    extractModules(modules, flowExecution);
  }
};

const transformExecution = (execution) => {
  const modules = {};
  extractModules(modules, execution);
  return modules;
};

/**
 * Safely parses a JSON response that may include problematic tokens.
 *
 * @param {Response} response - The fetch response object.
 * @param {Object} [replacements] - A mapping of problematic tokens to their valid JSON replacements.
 *                                  Default replacements are: { "Infinity": "null", "-Infinity": "null", "NaN": "null" }.
 * @returns {Promise<Object>} - The parsed JSON object.
 * @throws {Error} - Throws a detailed error if parsing fails even after cleaning.
 */
async function safeJsonParse(
  response,
  replacements = { Infinity: 'null', '-Infinity': 'null', NaN: 'null' },
) {
  // Clone the response to safely read the body more than once.
  const responseClone = response.clone();
  try {
    // First attempt: use the native parser.
    return await response.json();
  } catch (jsonError) {
    // Fallback: Get the raw text.
    let rawText = await responseClone.text();

    // Remove a potential Byte Order Mark (BOM) that can cause issues.
    rawText = rawText.replace(/^\ufeff/, '');

    // Dynamically replace any tokens defined in the replacements mapping.
    for (const token in replacements) {
      if (Object.prototype.hasOwnProperty.call(replacements, token)) {
        // The regex ensures we only target unquoted tokens.
        const regex = new RegExp(`\\b${token}\\b`, 'g');
        rawText = rawText.replace(regex, replacements[token]);
      }
    }

    // Attempt to parse the cleaned text.
    try {
      return JSON.parse(rawText);
    } catch (cleanError) {
      // Throw a detailed error including both the initial and cleaned parsing errors.
      throw new Error(`JSON parsing failed.
Original error: ${jsonError.message}
Error after cleaning: ${cleanError.message}`);
    }
  }
}

export const getFlowExecutionDetails =
  (selectedExecutionId = null, flowId = null, extra = null) =>
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
            new Date(next.finished_at || next.date_creation) -
            new Date(prev.finished_at || prev.date_creation),
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
        flowId,
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
    } catch (e) {
      console.error(`Error fetching execution data for ID ${executionId}: ${e.message}`);
      return Promise.reject(e.message);
    }
  };

export const createModulesAfterTriggers = () => async (dispatch, getState) => {
  const state = getState();
  const existingTriggers = selectExistingTriggers(state);
  const flowModules = selectFlowModulesPositions(state);
  batch(() => {
    for (const trigger of existingTriggers) {
      const after = {
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
        }),
      );
    }
  });
};
