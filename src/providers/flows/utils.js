import { createSelector } from '@reduxjs/toolkit';
import { Position } from 'reactflow';

import { moduleTypes as moduleTypeSchema } from '../../components/flows/schemas/modulePanelSections.jsx';
// import { checkArraysEqualsProperties, checkObjectsEqual } from '../../redux/helpers/memoize';
import { checkObjectsEqual } from '../../redux/helpers/memoize.js';
import {
  selectModulesTypes,
  selectNewModules,
  selectRouterConditions,
  // selectNextModuleMappingModules,
  // selectNextModuleMappingConditions,
  selectNextModuleMapping,
} from '../../redux/slices/flows';

// const getCoordinates = (module) => {
//   const x = module.meta_data?.position?.x ?? 0;// Math.random() * 600;
//   const y = module.meta_data?.position?.y ?? 0;//Math.random() * 500;
//   return {
//     position: { x, y }
//   }
// }

const hasTryExceptAvailable = (mType) => {
  if (['action', 'search'].includes(mType)) {
    return true;
  }
  return ['internal:code', 'internal:aigent', 'internal:invoke'].includes(mType);
};

export const moduleNodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  style: {
    borderRadius: '100%',
    width: 100,
    height: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

class GraphExtractor {
  constructor(moduleTypes, newModules, nextMappings, routerConditions) {
    // this.nodeIds = new Map();
    // this.nodes = [];
    // this.edges = [];
    this.nodes = new Map();
    this.edges = new Map();
    this.moduleTypes = moduleTypes;
    this.newModules = newModules;
    this.nextMappings = nextMappings;
    this.routerConditions = routerConditions;
  }

  craftNode = (nodeId, isNew, currentModuleId, moduleType, lastModuleId) => {
    const node = {
      id: nodeId,
      type: 'module',
      data: {
        status: !isNew ? 'existing' : 'new',
        module: {
          id: nodeId,
          after: this.newModules.get(currentModuleId)?.after,
          // position: module.position,
          type: moduleType,
        },
        targetHandles: [],
        exceptHandles: [],
        color:
          ((moduleType ?? '').includes('internal')
            ? moduleTypeSchema.internal
            : moduleTypeSchema[moduleType]
          )?.color || '#aaa',
        previousId: lastModuleId,
        nextId: !isNew
          ? this.nextMappings.modules[currentModuleId]
          : this.newModules.get(currentModuleId)?.next_module_id,
      },
      // ...getCoordinates(module),
      ...moduleNodeDefaults,
    };
    if (moduleType !== 'trigger') {
      node.data.targetHandles.push({ id: `t-${currentModuleId}` });
    }
    if (hasTryExceptAvailable(moduleType) && !isNew) {
      node.data.exceptHandles.push({ id: `${currentModuleId}-e` });
      // console.log('this.newModules', this.newModules);
      const exceptModuleId =
        this.nextMappings.excepts[currentModuleId] ||
        (this.newModules.get(`new-e-${currentModuleId}`) ? `new-e-${currentModuleId}` : null);
      // Safety check: Only process except module if it actually exists
      if (exceptModuleId) {
        const exceptModuleExists =
          exceptModuleId.startsWith('new-') || this.moduleTypes[exceptModuleId] !== undefined;

        if (exceptModuleExists) {
          this.processModules(exceptModuleId, currentModuleId, null, true);
        }
      }
    }
    if (moduleType === 'router') {
      const conditions = this.routerConditions[currentModuleId] ?? [];
      for (const rcId of conditions) {
        const nextModuleId =
          this.nextMappings.conditions[rcId] ||
          (this.newModules.get(`new-${currentModuleId}-${rcId}`)
            ? `new-${currentModuleId}-${rcId}`
            : null);
        if (nextModuleId) {
          //  && !this.nodeIds.has(nextModuleId)
          this.processModules(nextModuleId, currentModuleId, rcId);
        }
      }
    }
    return node;
  };

  craftEdge = (
    edgeId,
    lastModuleId,
    nodeId,
    conditionId,
    lastModuleType,
    currentModuleId,
    isNew,
    moduleType,
    isExcept = false,
  ) => {
    const after = this.newModules.get(currentModuleId)?.after;
    const isExceptSrc = after?.isExcept || isExcept;
    // console.log('craftedge.after', after);
    return {
      id: edgeId,
      source: lastModuleId,
      target: nodeId,
      type: 'circles',
      targetHandle: `t-${nodeId}`,
      sourceHandle: !!conditionId
        ? `${lastModuleId}-s:${conditionId}`
        : !isExceptSrc
          ? `${lastModuleId}-s`
          : `${lastModuleId}-e`,
      data: {
        selectIndex: 0,
        sourceNodeColor: isExceptSrc
          ? '#ff3333'
          : ((lastModuleType ?? '').includes('internal')
              ? moduleTypeSchema.internal
              : moduleTypeSchema[lastModuleType]
            )?.color,
        targetNodeColor:
          ((moduleType ?? '').includes('internal')
            ? moduleTypeSchema.internal
            : moduleTypeSchema[moduleType]
          )?.color || '#000',
        targetId: nodeId,
        sourceId: lastModuleId,
        condition: conditionId,
        isRouteCondition: lastModuleType === 'router' && !!conditionId, // !== null,
        isDefault: lastModuleType === 'router' && !conditionId, // === null,
        isConditionDisabled: isExcept || lastModuleType === 'iterator',
        isExcept,
        ...(isNew && { after }),
      },
    };
  };

  processModules = (currentModuleId, lastModuleId = null, condition = null, isExcept = false) => {
    let currentConditionId = condition;
    let current = currentModuleId;
    let last = lastModuleId;
    let currentExcept = isExcept;
    // let currentPriority = condition?.priority;
    while (current) {
      const isNew = current.startsWith('new-');
      // const isNew = current.startsWith('new-');
      const nodeId = !isNew ? current : this.newModules.get(current)?.id;
      const isLastNew = !!last && last.toString().startsWith('new-');
      // const isNewExcept = current.startsWith('new-e-');
      const conditionId = currentConditionId; // ?? "default";
      const moduleType = !isNew ? this.moduleTypes[current] : this.newModules.get(current)?.type;
      const lastModuleType =
        !!last && (!isLastNew ? this.moduleTypes[last] : this.newModules.get(last)?.type);

      if (last) {
        const edgeId = !!conditionId
          ? `edge:${last}:${conditionId}:${current}`
          : `edge:${last}:${current}`;
        if (!this.edges.has(edgeId)) {
          const edge = this.craftEdge(
            edgeId,
            last,
            nodeId,
            conditionId,
            lastModuleType,
            current,
            isNew,
            moduleType,
            currentExcept,
          );
          // console.log('edge', edge);
          this.edges.set(edgeId, edge);
        }
      }
      if (!this.nodes.has(current)) {
        const node = this.craftNode(nodeId, isNew, current, moduleType, last);
        // console.log('node', node);
        this.nodes.set(nodeId, node);
      } else if (!!last) {
        const existingNode = this.nodes.get(nodeId);
        const previousId = existingNode.data.previousId;
        const previousIsArray = !!previousId && Array.isArray(previousId);
        if (
          (!previousIsArray && !!previousId && last !== previousId) ||
          (previousIsArray && !previousId.includes(last))
        ) {
          if (!previousIsArray) {
            existingNode.data.previousId = [previousId];
          }
          existingNode.data.previousId.push(last);
        } else if (!previousId) {
          existingNode.data.previousId = last;
        }
      }
      currentConditionId = null;
      last = current;
      // prettier-ignore
      current =
        this.nextMappings.modules[last] ||
        (moduleType === 'router'
          ? !!this.newModules.get(`new-${last}-default`)
              ? `new-${last}-default`
              : null
          : !!this.newModules.get(`new-${last}`)
              ? `new-${last}`
              : null);
      if (this.nodes.has(current)) {
        const edgeId = !!conditionId
          ? `edge:${last}:${conditionId}:${current}`
          : `edge:${last}:${current}`;
        if (!!conditionId || this.edges.has(edgeId)) {
          current = null;
        }
      }
      currentExcept = false;
    }
  };

  createGraph = () => {
    const triggers = Object.keys(this.moduleTypes).filter(
      (id) => this.moduleTypes[id] === 'trigger',
    );
    if (!triggers.length) {
      triggers.push('new-trigger');
    }
    triggers.forEach(this.processModules);
    Object.entries(this.moduleTypes)
      .filter(
        ([key, type]) =>
          !this.nodes.has(key) &&
          (this.nextMappings.modules[key] || type === 'router' || !this.nodes.has(key)),
      )
      .forEach(([id]) => this.processModules(id));
    return { nodes: this.nodes, edges: this.edges }; // uniqBy(this.edges, 'id') };
  };
}

// const extractNewModules = (newModules, parentKey = null) => {
//   const modules = new Map();

//   Object.entries(newModules || {}).forEach(([key, nm]) => {
//     const moduleKey = parentKey ? `${parentKey}-${key}` : `new-${key}`;
//     if (nm.id !== undefined) {
//       modules.set(moduleKey, nm);
//     } else if (nm && typeof nm === 'object') {
//       const childModules = extractNewModules(nm, moduleKey);
//       childModules.forEach((value, childKey) => {
//         modules.set(childKey, value);
//       });
//     }
//   });

//   return modules;
// };

const extractNewModules = (newModules, parentKey = null) => {
  const modules = new Map();

  const traverseModules = (currentModules, currentParentKey) => {
    for (const [key, value] of Object.entries(currentModules || {})) {
      const moduleKey = currentParentKey ? `${currentParentKey}-${key}` : `new-${key}`;

      if (value?.id !== undefined) {
        const { meta_data, ...restModule } = value;
        const { position, ...restMetadata } = meta_data ?? {};
        modules.set(moduleKey, { ...restModule, meta_data: restMetadata });
      } else if (value && typeof value === 'object') {
        traverseModules(value, moduleKey);
      }
    }
  };

  traverseModules(newModules, parentKey);
  return modules;
};

const checkMapsEqual = (prev, next) => {
  // If both are falsy (null or undefined), they are equal
  if (!prev && !next) {
    return true;
  }

  // If only one is falsy, they are not equal
  if ((!prev && next) || (prev && !next)) {
    return false;
  }

  // If sizes are different, they are not equal
  if (prev.size !== next.size) {
    return false;
  }

  for (const [key, value] of prev.entries()) {
    if (!next.has(key) || !checkObjectsEqual(value, next.get(key))) {
      return false;
    }
  }

  return true;
};

const selectNewModulesIdsMapping = createSelector(
  [selectNewModules],
  (newModules) => extractNewModules(newModules),
  {
    memoizeOptions: {
      resultEqualityCheck: checkMapsEqual,
    },
  },
);

export const selectFlowGraph = createSelector(
  [
    selectModulesTypes,
    selectNewModulesIdsMapping,
    // selectNextModuleMappingModules,
    // selectNextModuleMappingConditions,
    selectNextModuleMapping,
    selectRouterConditions,
  ],
  (
    moduleTypes,
    newModules,
    // nextMappingsModules,
    // nextMappingsConditions,
    nextMappings,
    routerConditions,
  ) => {
    const graphExtractor = new GraphExtractor(
      moduleTypes,
      newModules,
      nextMappings,
      // {
      //   modules: nextMappingsModules,
      //   conditions: nextMappingsConditions,
      // },
      routerConditions,
    );
    return graphExtractor.createGraph();
  },
  // {
  //   memoizeOptions: {
  //     resultEqualityCheck: (prev, next) => checkArraysEqualsProperties("id")(prev.nodes, next.nodes) && checkObjectsEqual(prev.edges, next.edges)
  //   }
  // }
);

export const selectFlowNodes = createSelector([selectFlowGraph], (graph) => graph.nodes);

export const selectFlowEdges = createSelector([selectFlowGraph], (graph) => graph.edges);

// let currentModuleId = flow?.entry_module_id;
// if (!currentModuleId && newModules.trigger) {
//   nodes.push({
//     id: newModules.trigger.id,
//     status: 'new',
//     type: 'module',
//     data: {
//       label: `New Trigger`,
//       sourceHandles: [],
//       targetHandles: []
//     },
//     ...getCoordinates(newModules.trigger),
//     ...nodeDefaults
//   });
// }
// let lastModuleId = null;
// while (currentModuleId) {
//   const module = flowModules[currentModuleId];
//   if (!module) {
//     break ;
//   }
//   if (lastModuleId) {
//     edges.push({
//       id: `edge:${lastModuleId}:${currentModuleId}`,
//       source: lastModuleId,
//       target: currentModuleId,
//       type: 'smoothstep',
//       sourceHandle: `${lastModuleId}-t-${currentModuleId}`,
//       targetHandle: `${lastModuleId}-s-${currentModuleId}`,
//       data: {
//         selectIndex: 0,
//       },
//       markerEnd: {
//         type: MarkerType.ArrowClosed,
//       },
//     });
//   }
//   nodes.push({
//     id: module.id,
//     status: 'existing',
//     type: 'module',
//     data: {
//       label: `${module.type.toUpperCase()} [${module.position}]`,
//       sourceHandles: [{ id: `${lastModuleId}-s-${currentModuleId}`}],
//       targetHandles: [{ id: `${currentModuleId}-t-${module.next_module_id}`}]
//     },
//     ...getCoordinates(module),
//     ...nodeDefaults
//   });
//   let newModule = null;
//   if (module.type === 'router' && selectedConditions[module.id]) {
//     const selectedConditionId = selectedConditions[module.id];
//     newModule = newModules[currentModuleId]?.[selectedConditionId];
//     const selectedCondition = module.route_conditions.find(condition => condition.id === selectedConditionId);
//     currentModuleId = selectedCondition ? selectedCondition.next_module_id : (selectedConditionId === "default" ? module.next_module_id : null);
//   } else {
//     newModule = newModules[currentModuleId];
//     if (!!newModule && module.type === 'router') {
//       newModule = newModule["default"];
//     }
//     currentModuleId = module.next_module_id;
//   }
//   // if (newModule) {
//   //   nodes.push({
//   //     id: newModule.id,
//   //     status: 'new',
//   //     type: 'module',
//   //     data: {
//   //       label: 'New Module',
//   //     },
//   //     module: newModule,
//   //     ...getCoordinates(newModule),
//   //     ...nodeDefaults
//   //   });
//   // }
//   lastModuleId = currentModuleId;
// }
// return {
//   nodes, edges
// }
