import { Capacitor } from '@capacitor/core';
import { AnimatePresence } from 'framer-motion';
import { throttle } from 'lodash';
import React, { memo, useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { batch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import ReactFlow, {
  useReactFlow,
  // MiniMap,
  // Background,
  SelectionMode,
  useKeyPress,
} from 'reactflow';
import { validate as isValidUUID } from 'uuid';
import { useShallow } from 'zustand/react/shallow';

import FlowContextMenu from './FlowContextMenu.jsx';
import FlowLayoutedNodes from './FlowLayoutedNodes.jsx';
import FlowTutorial from './FlowTutorial.jsx';
import ModulesPanel from './ModulesPanel.jsx';
import useStore from './store/index.ts';
import 'reactflow/dist/style.css';
import './overview.css';
import DeleteDialog from '../../../components/dialogs/DeleteDialog.jsx';
import CirclesConnection from '../../../components/flows/canvas/connections/CirclesConnection.jsx';
import CircleEdge from '../../../components/flows/canvas/edges/CircleEdge.jsx';
import ModuleNode from '../../../components/flows/canvas/nodes/ModuleNode.jsx';
import RenameModuleDialog from '../../../components/flows/canvas/nodes/RenameModuleDialog.jsx';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import useKeyShortcutListener from '../../../hooks/useKeyShortcutListener.ts';
import { selectFlowEdges, selectFlowNodes } from '../../../providers/flows/utils';
import { useHermesWebSocket } from '../../../providers/websocket/HermesWebSocketProvider.jsx';
import {
  addNewModule,
  deleteFlowModule,
  deleteNewModule,
  onNewModuleClick,
  setModuleInMenu,
  setNewModuleInDrawer,
  updateEdge,
  updateModuleCanvasPositions,
  selectModulePositions,
  selectNextModuleMapping,
  selectSourceHandles,
  selectInitializedNodes,
} from '../../../redux/slices/flows';
import { dispatch } from '../../../redux/store';

// Better mobile detection using Capacitor
const isCapacitorMobile = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

const getMenuCoordinates = (event, pane) => ({
  top: event.clientY < pane.height - 250 ? event.clientY : null,
  left: event.clientX < pane.width - 250 ? event.clientX : null,
  right: event.clientX >= pane.width - 250 ? pane.width - 250 : null,
  bottom: event.clientY >= pane.height - 250 ? pane.height - 250 : null,
});

const sortModulesByDependency = (modules) => {
  // Create a map to quickly find a node by its id
  const moduleMap = new Map(modules.map((m) => [m.id, m]));

  // Find the starting node(s) which don't have any other module pointing to them as next_module_id
  const startingNodes = modules.filter(
    (m) => !modules.some((other) => other.next_module_id === m.id),
  );

  const sortedModules = [];
  const visited = new Set();

  const visit = (module) => {
    if (visited.has(module.id)) return;
    visited.add(module.id);
    sortedModules.push(module);
    if (module.next_module_id && moduleMap.has(module.next_module_id)) {
      visit(moduleMap.get(module.next_module_id));
    }
  };

  startingNodes.forEach(visit);

  return sortedModules;
};

const nodeTypes = {
  module: ModuleNode,
};

const edgeTypes = {
  circles: CircleEdge,
};

// const minimapStyle = {
//   height: 120,
// };

// const MIN_DISTANCE = 100;

const propOptions = {
  hideAttribution: true,
};

const deleteKeyCode = [];

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  addConnection: state.addConnection,
  deleteModules: state.deleteModules,
});

const selectNodeSelector = (state) => state.selectNode;
const selectEdgeSelector = (state) => state.selectEdge;
const clearSelectionsSelector = (state) => state.clearSelections;
const setSelectionSelector = (state) => state.setSelection;
const selectedNodesSelector = (state) => state.selectedNodes;
const selectedEdgesSelector = (state) => state.selectedEdges;

const onEdgesDelete = (edges) => {
  edges.forEach((edge) => {
    if (isValidUUID(edge.target)) {
      dispatch(updateEdge(edge.source, edge.data.condition));
    }
  });
};

const FlowCanvas = (
  {
    // altanerId = null,
    // altanerComponentId = null,
    // altanerComponentType = null,
  },
) => {
  const ws = useHermesWebSocket();
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const location = useLocation();
  const history = useHistory();
  const [fromTemplate, setFromTemplate] = useState(false);

  // Parse search params manually for React Router v5
  const searchParams = new URLSearchParams(location.search);
  const setSearchParams = (newParams) => {
    history.replace({
      pathname: location.pathname,
      search: newParams.toString(),
    });
  };
  // const [selectionOnDrag, setSelectionOnDrag] = useState(false);
  const selectionOnDrag = useKeyPress(['Meta', 'Ctrl']);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const sendCommand = ws?.sendCommand;

  const connectingNode = useRef(null);
  const ref = useRef(null);
  // const [initializedFlow, setInitializedFlow] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [mustClearMenu, setMustClearMenu] = useState(false);
  const [nodesToDelete, setNodesToDelete] = useState([]);
  // const [selectedNodes, setSelectedNodes] = useState([]);
  // const [selectedEdges, setSelectedEdges] = useState([]);
  const [menu, setMenu] = useState(null);
  const { screenToFlowPosition, project } = useReactFlow();
  const {
    nodes,
    edges,
    setEdges,
    setNodes,
    onNodesChange,
    onEdgesChange,
    addConnection,
    deleteModules,
  } = useStore(useShallow(selector));
  const selectNode = useStore(selectNodeSelector);
  const selectEdge = useStore(selectEdgeSelector);
  const clearSelections = useStore(clearSelectionsSelector);
  const selectedNodes = useStore(selectedNodesSelector);
  const selectedEdges = useStore(selectedEdgesSelector);
  const setSelection = useStore(setSelectionSelector);

  useEffect(() => {
    return () => {
      setNodes([]);
      setEdges([]);
    };
  }, []);

  useEffect(() => {
    if (!fromTemplate) {
      const id = searchParams.get('fromtemplate');
      setFromTemplate(id);
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('fromtemplate');
      setSearchParams(newSearchParams);
    }
  }, [location.search]);

  // const onInit = useCallback(() => setInitializedFlow(true), []);
  const isMobile = useMemo(() => {
    if (isCapacitorMobile()) {
      return true;
    }

    // Fallback to user agent detection
    const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  }, []);

  // Mobile-specific optimizations
  const mobileOptimizations = useMemo(() => {
    if (!isMobile) return {};

    return {
      // Reduce update frequency on mobile for better performance
      nodesDraggable: true,
      nodesConnectable: true,
      elementsSelectable: true,
      // Increase touch target size
      nodeExtent: undefined,
      // Optimize for touch interactions
      fitViewOptions: {
        padding: 0.1,
        includeHiddenNodes: false,
      },
    };
  }, [isMobile]);

  const deleteConfirmationMessage = useMemo(
    () =>
      `Are you sure you want to delete ${nodesToDelete.length === 1 ? `this ${nodesToDelete[0].data?.module?.type ?? 'module'}` : `these ${nodesToDelete.length} modules (${nodesToDelete.map((n) => n.data.module.type).join(', ')})`}`,
    [nodesToDelete],
  );

  // we are using a bit of a shortcut here to adjust the edge type
  // this could also be done with a custom edge for example
  // const edgesWithUpdatedTypes = edges.map((edge) => {
  //   if (edge.sourceHandle) {
  //     const edgeType = nodes.find((node) => node.type === 'custom')?.data.selects[edge.sourceHandle];
  //     if (edgeType) {
  //       edge.type = edgeType;
  //     }
  //   }

  //   return edge;
  // });

  /**
   * TODO: if edge is deleted with target new module,
   * we should update the after id to null,
   * however, we should still reder it in the canvas
   */
  const onConnect = useCallback(
    (params) => {
      setFromTemplate(false);
      connectingNode.current = null;
      /**
       * TODO: if edge is added with target new module,
       * we should update the after id to the source,
       * however, we should still render it in the canvas
       */
      addConnection(params);
    },
    [addConnection],
  );

  const onConnectStart = useCallback(
    (_, { handleId, nodeId }) => {
      setFromTemplate(false);
      const node = nodes.find((n) => n.id === nodeId);
      connectingNode.current = {
        node,
        handleId,
        conditionId: node.data.sourceHandles.find((h) => h.id === handleId)?.conditionId ?? null,
      };
    },
    [nodes],
  );

  const onConnectEnd = useCallback(
    (event) => {
      if (!connectingNode.current) return;

      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane) {
        // we need to remove the wrapper bounds, in order to get the correct position
        // const id = uniqueId();

        // const newNode = {
        //   id,
        //   status: 'new',
        //   type: 'module',
        //   data: {
        //     module: {
        //       position: nodes.length
        //     },
        //     targetHandles: [{ id: `t-${id}` }],
        //     sourceHandles: [],
        //     color: "#ccc"
        //   },
        //   position: screenToFlowPosition({
        //     x: event.clientX,
        //     y: event.clientY,
        //   }),
        //   ...moduleNodeDefaults,
        // };

        // const newEdge = {
        //   id: `edge:${connectingNode.current?.node.id}:${id}`,
        //   source: connectingNode.current?.node.id,
        //   sourceHandle: connectingNode.current?.handleId,
        //   target: id,
        //   targetHandle: `t-${id}`,
        //   type: 'circles',
        //   data: {
        //     selectIndex: 0,
        //     sourceNodeColor: connectingNode.current?.node.data.color,
        //     targetNodeColor: '#000'
        //   }
        // };

        // setNodes(nodes.concat(newNode));
        // setEdges(edges.concat(newEdge));

        const sourceNode = connectingNode.current;

        if (!sourceNode) {
          return;
        }

        const connectingNodePosition = sourceNode.node.position;
        const newModule = {
          id: sourceNode.node.id,
          type: sourceNode.node.data.module.type,
          condition:
            sourceNode.node.data.module.type === 'router'
              ? (sourceNode.conditionId ?? 'default')
              : null,
          isExcept: sourceNode.handleId.endsWith('-e'),
        };

        let newPosition = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        if (connectingNodePosition) {
          const deltaX = newPosition.x - connectingNodePosition.x;
          const deltaY = newPosition.y - connectingNodePosition.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance < 150) {
            newPosition = {
              x: connectingNodePosition.x + 150,
              y: connectingNodePosition.y,
            };
          }
        }

        batch(() => {
          dispatch(
            addNewModule({
              after: newModule,
              position: newPosition,
            }),
          );
          dispatch(setNewModuleInDrawer(newModule));
        });

        connectingNode.current = null;
      }
    },
    [screenToFlowPosition],
  );

  useEffect(() => {
    if (!mustClearMenu) {
      return;
    }
    setMustClearMenu(false);
    if (!menu) {
      clearSelections();
    }
    setMenu(null);
  }, [mustClearMenu]);

  const onPaneClick = useCallback(() => setMustClearMenu(true), []);

  const onDeleteNewModules = useCallback(
    (modules) => {
      setFromTemplate(false);
      deleteModules(modules);
      batch(() =>
        modules.forEach((node) => dispatch(deleteNewModule(node.data.module?.after ?? null))),
      );
    },
    [deleteModules],
  );

  const onNodesDeleteConfirm = useCallback(async () => {
    const existingModules = nodesToDelete.filter((n) => n.data.status === 'existing');
    const existingModuleIds = existingModules.map((n) => n.id);
    const newModules = nodesToDelete.filter((n) => n.data.status === 'new');
    if (newModules?.length) {
      onDeleteNewModules(newModules);
    }
    if (existingModules?.length) {
      // TODO: in order to delete in parallel we should ensure that not sequential modules are bein deleted
      // const deletePromises = existingModules.map(async (mId) => dispatchWithFeedback(
      //   deleteFlowModule(mId), {
      //     successMessage: `Module deleted successfully`,
      //     errorMessage: "There was a problem deleting the module...",
      //     useSnackbar: {
      //       error: true
      //     }
      //   }
      // ));
      // await Promise.all(deletePromises);
      const moduleToDelete = sortModulesByDependency(existingModules);
      // if (selectedEdges.length) {
      //   const selectedEdgesIds = selectedEdges.map(e => e.id);
      //   setEdges(edges.filter(edge => !selectedEdgesIds.includes(edge.id)));
      // }
      for (const mId of moduleToDelete.map((n) => n.id)) {
        await dispatchWithFeedback(deleteFlowModule(mId), {
          successMessage: 'Module deleted successfully',
          errorMessage: 'There was a problem deleting the module...',
          useSnackbar: {
            error: true,
          },
        });
      }
    }
    if (selectedEdges.length) {
      onEdgesDelete(
        !!existingModules?.length
          ? selectedEdges.filter((edge) => !existingModuleIds.includes(edge.target))
          : selectedEdges,
      );
    }
    clearSelections();
    setNodesToDelete([]);
  }, [nodesToDelete, selectedEdges, clearSelections, onDeleteNewModules, dispatchWithFeedback]);

  const onNodesDeleteCancel = useCallback(() => setNodesToDelete([]), []);

  // const onNodesDelete = useCallback(
  //   (deleted) => {
  //     setEdges(
  //       deleted.reduce((acc, node) => {
  //         const incomers = getIncomers(node, nodes, edges);
  //         const outgoers = getOutgoers(node, nodes, edges);
  //         const connectedEdges = getConnectedEdges([node], edges);

  //         const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));

  //         const createdEdges = incomers.flatMap(({ id: source }) =>
  //           outgoers.map(({ id: target }) => ({ id: `${source}->${target}`, source, target }))
  //         );

  //         return [...remainingEdges, ...createdEdges];
  //       }, edges)
  //     );
  //   },
  //   [nodes, edges]
  // );

  const onSelectionChange = useCallback(
    ({ nodes: newSelNodes, edges: newSelEdges }) => setSelection(newSelNodes, newSelEdges),
    [],
  );

  const onNodeContextMenu = useCallback(
    (event, node) => {
      setFromTemplate(false);
      // Prevent native context menu from showing
      event.preventDefault();
      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      selectNode(node.id);
      const pane = ref.current.getBoundingClientRect();
      setMenu({
        mode: 'module',
        ...getMenuCoordinates(event, pane),
      });
    },
    [selectNode],
  );

  const onPaneContextMenu = useCallback(
    (event) => {
      setFromTemplate(false);
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect();
      const position = project({
        x: event.clientX - pane.left,
        y: event.clientY - pane.top,
      });
      // console.log("position", position);
      setMenu({
        mode: 'bg',
        ...getMenuCoordinates(event, pane),
        ...position,
      });
    },
    [project],
  );

  // const onEdgeContextMenu = useCallback(
  //   (event, edge) => {
  //     setFromTemplate(false);
  //     // Prevent native context menu from showing
  //     event.preventDefault();

  //     // Calculate position of the context menu. We want to make sure it
  //     // doesn't get positioned off-screen.
  //     const pane = ref.current.getBoundingClientRect();
  //     if (!selectedEdges.find(e => e.source === edge.source && e.target === edge.target)) {
  //       onEdgesChange(edges.map((e) => ({ id: e.id, type: 'select', selected: e.source === edge.source && e.target === edge.target })));
  //     }
  //     onNodesChange(nodes.map((n) => ({ id: n.id, type: 'select', selected: false })));
  //     setMenu({
  //       mode: 'edge',
  //       ...getMenuCoordinates(event, pane),
  //     });
  //   },
  //   [edges, nodes, onEdgesChange, onNodesChange, selectedEdges],
  // );

  const onEdgeContextMenu = useCallback(
    (event, edge) => {
      event.preventDefault();
      if (!!edge.data?.after) {
        return;
      }
      setFromTemplate(false);
      selectEdge(edge.source, edge.target);

      const pane = ref.current.getBoundingClientRect();
      setMenu({
        mode: 'edge',
        ...getMenuCoordinates(event, pane),
      });
    },
    [selectEdge],
  );

  const onNodeClick = useCallback((e, node) => {
    setFromTemplate(false);
    dispatch(
      node.data.status === 'new'
        ? onNewModuleClick({ anchorEl: e.currentTarget, node })
        : setModuleInMenu({
            anchorEl: e.currentTarget,
            module: { id: node.id, after: null },
          }),
    );
  }, []);

  const throttledUpdatePositions = useMemo(
    () =>
      throttle((nodes, persist = false) => {
        dispatch(updateModuleCanvasPositions(sendCommand, nodes, persist));
      }, 500),
    [sendCommand],
  );

  const onNodeDragStop = useCallback(
    (event, node, nodes) => {
      // console.log("onDragStop", dragging);
      if (!dragging) {
        return;
      }
      setFromTemplate(false);
      dispatch(updateModuleCanvasPositions(sendCommand, nodes, true));
      setDragging(false);
    },
    [dragging, sendCommand],
  );

  const onNodeDrag = useCallback(
    (event, node, nodes) => {
      setFromTemplate(false);
      setDragging(true);
      if (!!throttledUpdatePositions) {
        throttledUpdatePositions(nodes);
      }
      // setDragging(false);
    },
    [throttledUpdatePositions],
  );

  // const deletePressed = useKeyPress(['Delete', 'Backspace']);

  const handleMultipleDelete = useCallback(() => {
    if (selectedNodes.length) {
      const separatedNodesToDelete = selectedNodes.reduce(
        (ctx, n) => {
          if (n.data.status === 'new' && !n.data.module?.type) {
            ctx.pure.push(n);
          } else {
            ctx.needConfirm.push(n);
          }
          return ctx;
        },
        { pure: [], needConfirm: [] },
      );
      onDeleteNewModules(separatedNodesToDelete.pure);
      if (!separatedNodesToDelete.needConfirm && selectedEdges.length) {
        onEdgesDelete(selectedEdges);
      }
      setNodesToDelete(separatedNodesToDelete.needConfirm);
    } else if (selectedEdges.length) {
      onEdgesDelete(selectedEdges);
    }
  }, [onDeleteNewModules, selectedEdges, selectedNodes]);

  // const enableDragSelection = useCallback(() => {
  //   console.log("enabling drag selection");
  //   setSelectionOnDrag(true)
  // }, []);
  // const disableDragSelection = useCallback(() => setSelectionOnDrag(false), []);

  const onHelpOpen = useCallback(() => {
    // console.log('help clicked');
    setHelpOpen(true);
  }, []);

  const eventMappings = useMemo(
    () => [
      {
        // Condition for delete (e.g., Ctrl/Meta + Backspace/Delete)
        type: 'down',
        condition: (event) => (event.metaKey || event.ctrlKey) && [8, 46].includes(event.keyCode),
        handler: handleMultipleDelete,
      },
    ],
    [handleMultipleDelete],
  );

  useKeyShortcutListener({
    eventsMapping: eventMappings,
    debounceTime: 300,
    stopPropagation: true,
  });

  const selectedInContext = useMemo(() => {
    if (!menu?.mode) {
      return null;
    }
    if (menu.mode === 'module' && !!selectedNodes?.length) {
      return selectedNodes.map((node) => ({
        id: node.id,
        data: node.data.module,
        status: node.data.status,
      }));
    }
    if (menu.mode === 'edge' && !!selectedEdges?.length) {
      return selectedEdges;
    }
    return null;
  }, [menu?.mode, selectedEdges, selectedNodes]);

  return (
    <>
      <ModulesPanel />
      <AnimatePresence>
        <ReactFlow
          ref={ref}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          // onInit={onInit}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodeDragThreshold={1}
          panOnDrag={!selectionOnDrag}
          panOnScroll={!isMobile}
          selectionOnDrag={selectionOnDrag}
          // selectionOnDrag={false}
          proOptions={propOptions}
          minZoom={0.01}
          connectionLineComponent={CirclesConnection}
          selectionMode={SelectionMode.Partial}
          deleteKeyCode={deleteKeyCode}
          // onMouseUp={() => setSelectionOnDrag(false)}
          // onNodeDrag={onNodeDrag}
          // onNodeDragStop={onNodeDragStop}
          onSelectionChange={onSelectionChange}
          // selectionKeyCode={[]}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          onPaneClick={onPaneClick}
          onEdgesDelete={onEdgesDelete}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          {...mobileOptimizations}
        >
          {/* <MiniMap style={minimapStyle} zoomable pannable /> */}
          <FlowLayoutedNodes
            fromTemplate={fromTemplate}
            nodesSelector={selectFlowNodes}
            edgesSelector={selectFlowEdges}
            sourceHandlesSelector={selectSourceHandles}
            modulePositionsSelector={selectModulePositions}
            nextModuleMappingsSelector={selectNextModuleMapping}
            updateModulePosition={updateModuleCanvasPositions}
            initializedNodesSelector={selectInitializedNodes}
            extraControlButtons={[
              {
                title: 'Help',
                icon: 'material-symbols:help',
                onClick: onHelpOpen,
              },
            ]}
          />
        </ReactFlow>
      </AnimatePresence>
      <FlowTutorial
        open={isHelpOpen}
        setOpen={setHelpOpen}
      />

      <FlowContextMenu
        onSelect={onPaneClick}
        open={!!menu}
        {...(menu ?? {})}
        selected={selectedInContext}
      />
      <DeleteDialog
        openDeleteDialog={!!nodesToDelete.length}
        handleCloseDeleteDialog={onNodesDeleteCancel}
        confirmDelete={onNodesDeleteConfirm}
        isSubmitting={isSubmitting}
        message={deleteConfirmationMessage}
      />
      <RenameModuleDialog />
    </>
  );
};

export default memo(FlowCanvas);