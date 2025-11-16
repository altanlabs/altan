// import { createSelector } from '@reduxjs/toolkit';
// import { Position } from 'reactflow';

// import { moduleTypes as moduleTypeSchema } from '../../components/flows/schemas/modulePanelSections';
// // import { checkArraysEqualsProperties, checkObjectsEqual } from '../../redux/helpers/memoize.ts';
// import {
//   selectModulesTypes,
//   selectNewModules,
//   selectRouterConditions,
//   selectNextModuleMappingModules,
//   selectNextModuleMappingConditions,
// } from '../../redux/slices/flows';

// // const getCoordinates = (module) => {
// //   const x = module.meta_data?.position?.x ?? 0;// Math.random() * 600;
// //   const y = module.meta_data?.position?.y ?? 0;//Math.random() * 500;
// //   return {
// //     position: { x, y }
// //   }
// // }

// export const moduleNodeDefaults = {
//   sourcePosition: Position.Right,
//   targetPosition: Position.Left,
//   style: {
//     borderRadius: '100%',
//     width: 100,
//     height: 100,
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// };

// export const selectFlowGraph = createSelector(
//   [
//     selectModulesTypes,
//     selectNewModules,
//     selectNextModuleMappingModules,
//     selectNextModuleMappingConditions,
//     selectRouterConditions,
//   ],
//   (
//     moduleTypes,
//     newModules,
//     nextMappingsModules,
//     nextMappingsConditions,
//     routerConditions,
//   ) => createGraph({
//     moduleTypes,
//     newModules,
//     nextMappings: {
//       modules: nextMappingsModules,
//       conditions: nextMappingsConditions,
//     },
//     routerConditions,
//   }),
//   // {
//   //   memoizeOptions: {
//   //     resultEqualityCheck: (prev, next) => checkArraysEqualsProperties("id")(prev.nodes, next.nodes) && checkObjectsEqual(prev.edges, next.edges)
//   //   }
//   // }
// );

// export const selectFlowNodes = createSelector(
//   [selectFlowGraph],
//   (graph) => graph.nodes,
// );

// export const selectFlowEdges = createSelector(
//   [selectFlowGraph],
//   (graph) => graph.edges,
// );

// const extractNewModules = (newModules, parentKey = null) => {
//   const modules = {};
//   Object.entries(newModules || {}).forEach(([key, nm]) => {
//     const moduleKey = parentKey ? `${parentKey}-${key}` : `new-${key}`;
//     if (nm.id !== undefined) {
//       modules[moduleKey] = nm;
//     } else if (!!nm) {
//       Object.assign(modules, extractNewModules(nm, moduleKey));
//     }
//   });
//   return modules;
// };

// const createGraph = ({ moduleTypes, newModules, nextMappings, routerConditions }) => {
//   const nodes = [];
//   const edges = [];
//   const nodeIds = [];
//   const newModulesIdsMapping = extractNewModules(newModules);

//   const processModules = (currentModuleId, lastModuleId = null, condition = null) => {
//     const edgeIds = edges.map(e => e.id);
//     let currentConditionId = condition;
//     // let currentPriority = condition?.priority;
//     while (currentModuleId) {
//       const isNew = currentModuleId.startsWith('new-');
//       const nodeId = !isNew ? currentModuleId : newModulesIdsMapping[currentModuleId]?.id;
//       const isLastNew = !!lastModuleId && lastModuleId.startsWith('new-');
//       const conditionId = currentConditionId;// ?? "default";
//       const moduleType = !isNew ? moduleTypes[currentModuleId] : newModulesIdsMapping[currentModuleId]?.type;
//       const lastModuleType = !!lastModuleId && (!isLastNew ? moduleTypes[lastModuleId] : newModulesIdsMapping[lastModuleId]?.type);

//       if (lastModuleId) {
//         const edgeId = !!conditionId ? `edge:${lastModuleId}:${conditionId}:${currentModuleId}` : `edge:${lastModuleId}:${currentModuleId}`;
//         if (!edgeIds.includes(edgeId)) {
//           edges.push({
//             id: edgeId,
//             source: lastModuleId,
//             target: nodeId,
//             type: 'circles',
//             targetHandle: `t-${nodeId}`,
//             sourceHandle: !!conditionId ? `${lastModuleId}-s:${conditionId}` : `${lastModuleId}-s`,
//             data: {
//               selectIndex: 0,
//               sourceNodeColor: moduleTypeSchema[lastModuleType]?.color,
//               targetNodeColor: moduleTypeSchema[moduleType]?.color || '#000',
//               // priority: currentPriority,
//               targetId: nodeId,
//               sourceId: lastModuleId,
//               // filter: condition?.condition_logic ?? currentModule.meta_data?.["_filter_spec"] ?? null,
//               // condition,
//               condition: conditionId,
//               isRouteCondition: lastModuleType === 'router' && !!conditionId, // !== null,
//               isDefault: lastModuleType === 'router' && !conditionId, // === null,
//               ...isNew && {
//                 after: newModulesIdsMapping[currentModuleId]?.after,
//               },
//             },
//           });
//         }
//       }
//       if (!nodeIds.includes(currentModuleId)) {
//         const node = {
//           id: nodeId,
//           type: 'module',
//           data: {
//             status: !isNew ? 'existing' : 'new',
//             module: {
//               id: nodeId,
//               after: newModulesIdsMapping[currentModuleId]?.after,
//               // position: module.position,
//               type: moduleType,
//             },
//             targetHandles: [],
//             color: moduleTypes[moduleType]?.color || '#aaa',
//             previousId: lastModuleId,
//             nextId: !isNew ? nextMappings.modules[currentModuleId] : newModulesIdsMapping[currentModuleId]?.next_module_id,
//           },
//           // ...getCoordinates(module),
//           ...moduleNodeDefaults,
//         };
//         if (moduleType !== 'trigger') {
//           node.data.targetHandles.push({ id: `t-${currentModuleId}` });
//         }
//         if (moduleType === 'router') {
//           const conditions = routerConditions[currentModuleId] ?? [];
//           for (const rcId of conditions) {
//             const nextModuleId = nextMappings.conditions[rcId] || (newModulesIdsMapping[`new-${currentModuleId}-${rcId}`] && `new-${currentModuleId}-${rcId}`);
//             if (nextModuleId) {
//               processModules(
//                 nextModuleId,
//                 currentModuleId,
//                 rcId,
//               );
//             }
//           }
//         }
//         nodes.push(node);
//         nodeIds.push(node.id);
//       } else if (!!lastModuleId) {
//         const existingNode = nodes.find(n => n.id === nodeId);
//         const previousId = existingNode.data.previousId;
//         const previousIsArray = !!previousId && Array.isArray(previousId);
//         if ((!previousIsArray && !!previousId && lastModuleId !== previousId) || (previousIsArray && !previousId.includes(lastModuleId))) {
//           if (!previousIsArray) {
//             existingNode.data.previousId = [previousId];
//           }
//           existingNode.data.previousId.push(lastModuleId);
//         } else if (!previousId) {
//           existingNode.data.previousId = lastModuleId;
//         }
//       }
//       currentConditionId = null;
//       lastModuleId = currentModuleId;
//       currentModuleId = nextMappings.modules[lastModuleId] || (moduleType === 'router' ? (!!newModulesIdsMapping[`new-${lastModuleId}-default`] && `new-${lastModuleId}-default`) : (!!newModulesIdsMapping[`new-${lastModuleId}`] && `new-${lastModuleId}`));
//     }
//   };

//   const triggers = Object.keys(moduleTypes).filter(id => moduleTypes[id] === 'trigger');
//   if (!triggers.length) {
//     triggers.push('new-trigger');
//   }
//   triggers.forEach(processModules);

//   Object.entries(moduleTypes).filter(([key]) => !nodeIds.includes(key)).forEach(([id, type]) => {
//     if (nextMappings.modules[id] || type === 'router' || !nodeIds.includes(id)) {
//       processModules(id);
//     }
//     // else if (!nodeIds.includes(id)) {
//     //   nodes.push({
//     //     id,
//     //     type: 'module',
//     //     data: {
//     //       status: 'existing',
//     //       module: {
//     //         id,
//     //         type
//     //       },
//     //       targetHandles: [{ id: `t-${id}` }],
//     //       color: moduleTypes[type]?.color || "#aaa",
//     //       previousId: null,
//     //       nextId: nextMappings.modules[id]
//     //     },
//     //     // ...getCoordinates(module),
//     //     ...moduleNodeDefaults
//     //   });
//     // }
//   });

//   return { nodes, edges };
// };

// // let currentModuleId = flow?.entry_module_id;
// // if (!currentModuleId && newModules.trigger) {
// //   nodes.push({
// //     id: newModules.trigger.id,
// //     status: 'new',
// //     type: 'module',
// //     data: {
// //       label: `New Trigger`,
// //       sourceHandles: [],
// //       targetHandles: []
// //     },
// //     ...getCoordinates(newModules.trigger),
// //     ...nodeDefaults
// //   });
// // }
// // let lastModuleId = null;
// // while (currentModuleId) {
// //   const module = flowModules[currentModuleId];
// //   if (!module) {
// //     break ;
// //   }
// //   if (lastModuleId) {
// //     edges.push({
// //       id: `edge:${lastModuleId}:${currentModuleId}`,
// //       source: lastModuleId,
// //       target: currentModuleId,
// //       type: 'smoothstep',
// //       sourceHandle: `${lastModuleId}-t-${currentModuleId}`,
// //       targetHandle: `${lastModuleId}-s-${currentModuleId}`,
// //       data: {
// //         selectIndex: 0,
// //       },
// //       markerEnd: {
// //         type: MarkerType.ArrowClosed,
// //       },
// //     });
// //   }
// //   nodes.push({
// //     id: module.id,
// //     status: 'existing',
// //     type: 'module',
// //     data: {
// //       label: `${module.type.toUpperCase()} [${module.position}]`,
// //       sourceHandles: [{ id: `${lastModuleId}-s-${currentModuleId}`}],
// //       targetHandles: [{ id: `${currentModuleId}-t-${module.next_module_id}`}]
// //     },
// //     ...getCoordinates(module),
// //     ...nodeDefaults
// //   });
// //   let newModule = null;
// //   if (module.type === 'router' && selectedConditions[module.id]) {
// //     const selectedConditionId = selectedConditions[module.id];
// //     newModule = newModules[currentModuleId]?.[selectedConditionId];
// //     const selectedCondition = module.route_conditions.find(condition => condition.id === selectedConditionId);
// //     currentModuleId = selectedCondition ? selectedCondition.next_module_id : (selectedConditionId === "default" ? module.next_module_id : null);
// //   } else {
// //     newModule = newModules[currentModuleId];
// //     if (!!newModule && module.type === 'router') {
// //       newModule = newModule["default"];
// //     }
// //     currentModuleId = module.next_module_id;
// //   }
// //   // if (newModule) {
// //   //   nodes.push({
// //   //     id: newModule.id,
// //   //     status: 'new',
// //   //     type: 'module',
// //   //     data: {
// //   //       label: 'New Module',
// //   //     },
// //   //     module: newModule,
// //   //     ...getCoordinates(newModule),
// //   //     ...nodeDefaults
// //   //   });
// //   // }
// //   lastModuleId = currentModuleId;
// // }
// // return {
// //   nodes, edges
// // }
