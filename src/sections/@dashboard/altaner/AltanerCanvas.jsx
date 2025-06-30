import React, { memo, useCallback, useState, useRef, useMemo } from 'react';
import ReactFlow, {
  // MiniMap,
  Controls,
  // Background,
  SelectionMode,
} from 'reactflow';
import { useShallow } from 'zustand/react/shallow';

import AssemblingWorkflow from './AssemblingWorkflow';
import ContextMenu from './ContextMenu';
import useLayoutNodes from './hooks/useLayoutNodes';
import useStore from './store';
import 'reactflow/dist/style.css';
import './overview.css';
import CirclesConnection from '../../../components/flows/canvas/connections/CirclesConnection';
import CircleEdge from '../../../components/flows/canvas/edges/CircleEdge';
import ModuleNode from '../../../components/flows/canvas/nodes/ModuleNode';
import { onNewModuleClick, setModuleInMenu } from '../../../redux/slices/flows';
import { dispatch } from '../../../redux/store';

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

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const AltanerCanvas = () => {
  // const { sendCommand } = useWebSocket();
  // const connectingNode = useRef(null);
  const ref = useRef(null);
  const [initializedFlow, setInitializedFlow] = useState(false);
  // const [dragging, setDragging] = useState(false);
  const [menu, setMenu] = useState(null);
  // const { screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    edges,
    // setEdges,
    onNodesChange,
    onEdgesChange,
    // onConnect: onConnectStore
  } = useStore(useShallow(selector));

  const onInit = useCallback(() => setInitializedFlow(true), []);
  const isMobile = useMemo(() => {
    const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  }, []);

  const { setAutoAlignCount } = useLayoutNodes();

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  // const onSelectionChange = useCallback(({ nodes, edges }) => {
  //   setSelectedNodes(nodes ?? []);
  //   setSelectedEdges(edges ?? []);
  // }, [setSelectedNodes, setSelectedEdges]);

  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom: event.clientY >= pane.height - 200 && pane.height - event.clientY,
      });
    },
    [setMenu],
  );

  const onNodeDoubleClick = useCallback((e, node) => {
    dispatch(
      node.data.status === 'new'
        ? onNewModuleClick({ anchorEl: e.currentTarget, node })
        : setModuleInMenu({ anchorEl: e.currentTarget, module: { id: node.id, after: null } }),
    );
  }, []);

  // const throttledUpdatePositions = useCallback(throttle((nodes, persist = false) => {
  //   dispatch(updateModuleCanvasPositions(sendCommand, nodes, persist));
  // }, 500), [sendCommand]);

  // const onNodeDragStop = useCallback((event, node, nodes) => {
  //   if (!dragging) {
  //     return;
  //   }
  //   if (!!throttledUpdatePositions) {
  //     throttledUpdatePositions(nodes, true)
  //   }
  //   setDragging(false);
  // }, [dragging, throttledUpdatePositions]);

  // const onNodeDrag = useCallback((event, node, nodes) => {
  //   setDragging(true);
  //   if (!!throttledUpdatePositions) {
  //     throttledUpdatePositions(nodes)
  //   }
  //   // setDragging(false);
  // }, [throttledUpdatePositions]);

  return (
    <>
      <AssemblingWorkflow
        open={!initializedFlow}
        message="Assembling altaner workflows... Please wait..."
        icon="flow"
      />
      <ReactFlow
        ref={ref}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        panOnDrag={true}
        panOnScroll={!isMobile}
        selectionOnDrag={false}
        proOptions={{
          hideAttribution: true,
        }}
        minZoom={0.01}
        connectionLineComponent={CirclesConnection}
        selectionMode={SelectionMode.Partial}
        // onNodeDrag={onNodeDrag}
        // onNodeDragStop={onNodeDragStop}
        // onSelectionChange={onSelectionChange}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        deleteKeyCode={[]}
        // onNodeDrag={onNodeDrag}
        // onNodeDragStop={onNodeDragStop}
      >
        {/* <MiniMap style={minimapStyle} zoomable pannable /> */}
        <Controls onFitView={() => setAutoAlignCount((prev) => prev + 1)} />
        {/* <Background color="#777" gap={16} /> */}
        {menu && (
          <ContextMenu
            onClick={onPaneClick}
            {...menu}
          />
        )}
      </ReactFlow>
    </>
  );
};

export default memo(AltanerCanvas);

// const getClosestEdge = useCallback((node) => {
//   const closestNode = nodes.reduce(
//     (res, n) => {
//       if (n.id !== node.id) {
//         const dx = n.positionAbsolute.x - node.positionAbsolute.x;
//         const dy = n.positionAbsolute.y - node.positionAbsolute.y;
//         const d = Math.sqrt(dx * dx + dy * dy);

//         if (d < res.distance && d < MIN_DISTANCE) {
//           res.distance = d;
//           res.node = n;
//         }
//       }

//       return res;
//     },
//     {
//       distance: Number.MAX_VALUE,
//       node: null,
//     },
//   );

//   if (!closestNode.node) {
//     return null;
//   }

//   const closeNodeIsSource =
//     closestNode.node.positionAbsolute.x < node.positionAbsolute.x;

//   return {
//     id: closeNodeIsSource
//       ? `${closestNode.node.id}-${node.id}`
//       : `${node.id}-${closestNode.node.id}`,
//     source: closeNodeIsSource ? closestNode.node.id : node.id,
//     target: closeNodeIsSource ? node.id : closestNode.node.id,
//     type: 'circles',
//     data: {
//       sourceNodeColor: closeNodeIsSource ? closestNode.node.data.color : node.data.color,
//       targetNodeColor: closeNodeIsSource ? node.data.color : closestNode.node.data.color,
//     }
//   };
// }, [nodes]);

// const onNodeDrag = useCallback(
//   (_, node) => {
//     const closeEdge = getClosestEdge(node);
//     const nextEdges = edges.filter((e) => e.className !== 'temp');
//     if (
//       closeEdge &&
//       !nextEdges.find(
//         (ne) =>
//           ne.source === closeEdge.source && ne.target === closeEdge.target,
//       )
//     ) {
//       closeEdge.className = 'temp';
//       nextEdges.push(closeEdge);
//     }
//     setEdges(nextEdges);
//   },
//   [getClosestEdge, edges, setEdges],
// );

// const onNodeDragStop = useCallback(
//   (_, node) => {
//     const closeEdge = getClosestEdge(node);
//     const nextEdges = edges.filter((e) => e.className !== 'temp');

//     if (
//       closeEdge &&
//       !nextEdges.find(
//         (ne) =>
//           ne.source === closeEdge.source && ne.target === closeEdge.target,
//       )
//     ) {
//       nextEdges.push(closeEdge);
//     }

//     setEdges(nextEdges);
//   },
//   [getClosestEdge, setEdges, edges],
// );
