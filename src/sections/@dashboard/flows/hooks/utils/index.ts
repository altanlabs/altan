// src/layout/getLayoutedGraph.ts
import type {
  ElkNode as ElkJSNode,
  ElkExtendedEdge,
  LayoutOptions as ElkLayoutOptions,
  ElkPort,
} from 'elkjs/lib/elk.bundled.js';

// Lazy load ELK only when needed (1.4MB library!)
let elkInstance: any = null;
const getElk = async () => {
  if (!elkInstance) {
    const ELK = await import('elkjs/lib/elk.bundled.js');
    elkInstance = new ELK.default();
  }
  return elkInstance;
};

/**
 * Replace `FlowNode` with your actual node interface.
 * This is just a sample shape.
 */
export interface Handle {
  id: string;
}

export interface FlowNodeData {
  targetHandles: Handle[];
  sourceHandles: Handle[];
  exceptHandles: Handle[];
  noSource?: boolean;
}

export interface FlowNode {
  id: string;
  width?: number;
  height?: number;
  data: FlowNodeData;
}

/**
 * After layout, we want nodes to have x,y coordinates,
 * so we define an extended interface.
 */
export interface LayoutedNode extends FlowNode {
  x: number;
  y: number;
}

/**
 * We return both layouted nodes and edges.
 * Note: ElkExtendedEdge includes edge route points, labels, etc.
 */
export interface LayoutedGraph {
  nodes: LayoutedNode[];
  edges: ElkExtendedEdge[];
}

/**
 * Default ELK layout options — you can override these by passing
 * custom options to `getLayoutedGraph`.
 */
// const defaultLayoutOptions: ElkLayoutOptions = {
//   'elk.algorithm': 'disco',
//   'elk.direction': 'RIGHT',
//   'elk.layered.spacing.edgeNodeBetweenLayers': '40',
//   'elk.spacing.nodeNode': '40',
//   'elk.padding': '[16, 16, 16, 16]', // Padding around the graph
//   'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
//   'elk.layered.mergeEdges': 'false', // Helps reduce clutter with multiple edges
//   'elk.separateConnectedComponents': 'false', // Layout disconnected graphs
// };

const defaultLayoutOptions: ElkLayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.layered.spacing.edgeNodeBetweenLayers': '50',
  'elk.layered.spacing.nodeNodeBetweenLayers': '75',
  'elk.layered.spacing.edgeEdge': '40',
  // 'elk.separateConnectedComponents': 'false',
  'elk.layered.spacing.nodeNode': '100',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
}


/**
 * Helper function to create ELK-compatible ports for a node.
 * @param handles  The collection of node handles (source or target).
 * @param side     The side of the node on which the ports appear (NORTH, WEST or EAST).
 */
function createPorts(handles: Handle[], side: 'WEST' | 'EAST' | 'NORTH'): ElkJSNode['ports'] {
  return handles.map((handle) => ({
    id: handle.id,
    properties: {
      side,
    },
  }));
}

/**
 * Convert our FlowNode array into ELK-compatible children array.
 * @param nodes  Array of FlowNodes.
 */
function mapNodesToElkChildren(nodes: FlowNode): ElkJSNode {
  // console.log("nodes.data", nodes.data);
  const targetPorts = createPorts(nodes.data.targetHandles, 'WEST') as ElkPort[];
  const exceptPorts = createPorts(nodes.data.exceptHandles, 'NORTH') as ElkPort[];
  const sourcePorts = createPorts(nodes.data.sourceHandles, 'EAST') as ElkPort[];

  return {
    id: nodes.id,
    width: (nodes.width ?? 100) + 5,
    height: (nodes.height ?? 100) + (nodes.data.noSource ? 50 : 10),
    layoutOptions: {
      // Fix the port order to reduce edge crossings
      'org.eclipse.elk.portConstraints': 'FIXED_ORDER',
    },
    /**
     * For ELK, we only need the ports. They will be connected via edges.
     * If you need more advanced port naming or ordering, add logic here.
     */
    ports: [...targetPorts, ...sourcePorts, ...exceptPorts],
  }
}

/**
 * Build ELK-compatible edges from the FlowNodes.
 * This example demonstrates how to create edges from node handles.
 *
 * @param nodes  Array of FlowNodes.
 */
// function mapEdgesToElkEdges(nodes: FlowNode[]): ElkJSEdge[] {
//   const edges: ElkJSEdge[] = [];

//   nodes.forEach((node) => {
//     const { sourceHandles, targetHandles } = node.data;

//     // For each source handle, connect it to each target handle of the same node.
//     // Adjust logic here if your graph edges are defined differently.
//     sourceHandles.forEach((source) => {
//       targetHandles.forEach((target) => {
//         edges.push({
//           id: `${source.id}-${target.id}`,
//           sources: [source.id],
//           targets: [target.id],
//         });
//       });
//     });
//   });

//   return edges;
// }


type Positions = Record<string, { x: number; y: number }>;

/**
 * Offloads force-directed refinement to a web worker.
 */
const computeForceDirectedPositions = async (
  positions: Positions,
  edges: ElkExtendedEdge[]
): Promise<Positions> => new Promise((resolve, reject) => {
  const worker = new Worker(new URL('./layoutWorker.js', import.meta.url), { type: "module" });

  worker.postMessage({ positions, edges });

  worker.onmessage = (event: MessageEvent<{ refinedPositions: Positions }>) => {
    const { refinedPositions } = event.data;
    resolve(refinedPositions);
    worker.terminate();
  };  

  worker.onerror = (error: ErrorEvent) => {
    reject(new Error(error.message || "Unknown worker error"));
    worker.terminate();
  };  
});

const getSizeRouter = (numConditions: number | null): { width: number, height: number } => {
  const desiredSize = 100 + ((numConditions ?? 3) - 3) * 15;
  return {
    width: desiredSize,
    height: desiredSize,
  }
}

interface SimpleModuleNode {
  data: { module: { type: string } };
  style: { width: number, height: number };
}

export const getNodeDimensions = (n: SimpleModuleNode, sHandlesLength: number, noSource: boolean): { width: number, height: number } => {
  const moduleType = n.data.module.type;
  if (moduleType === "trigger") {
    return {
      width: n.style.width + 25,
      height: n.style.height + 25,
    };
  }
  if (moduleType === "router" && sHandlesLength > 3) {
    return getSizeRouter(sHandlesLength);
  }
  if (noSource) {
    return {
      width: n.style.width - 25,
      height: n.style.height - 25,
    };
  }
  return {
    width: n.style.width,
    height: n.style.height,
  };
};


interface EdgeSimple {
  id: string;
  sourceHandle: string;
  source: string;
  targetHandle: string;
  target: string;
}

/**
 * Calculate a layout for the provided graph using ELK.
 * @param nodes          The array of FlowNodes to layout.
 * @param layoutOptions  Optional layout configuration to override defaults.
 * @returns              A Promise containing layouted nodes and edges.
 */
export const getLayoutedNodes = async (
  nodes: FlowNode[],
  edges: Map<string, EdgeSimple>,
  layoutOptions: Partial<ElkLayoutOptions> = {}
): Promise<Positions> => {
  try {
    const parsedEdges = Array.from(edges, ([, e]) => ({
      id: e.id,
      sources: [e.sourceHandle || e.source],
      targets: [e.targetHandle || e.target],
    }));
    // Build the Elk graph input
    const elkGraph = {
      id: 'root',
      // Convert FlowNodes to ElkJS nodes
      children: nodes.map((n) => mapNodesToElkChildren(n)),
      // Build edges from the handles in each node
      edges: parsedEdges,
    } as ElkJSNode;

    // Merge default options with any overrides
    const mergedLayoutOptions = { ...defaultLayoutOptions, ...layoutOptions };

    // Run ELK layout (loaded dynamically to reduce bundle size)
    const elk = await getElk();
    const layoutedGraph = await elk.layout(elkGraph, {
      layoutOptions: mergedLayoutOptions as ElkLayoutOptions,
    });

    const nodePositions: Positions = (layoutedGraph.children ?? []).reduce<Positions>(
      (acc, node) => {
        acc[node.id] = {
          x: node.x ?? 0,
          y: node.y ?? 0,
        };
        return acc;
      }, 
      {}
    );

    if (Object.keys(nodePositions).length < 3) {
      return nodePositions;
    }
    return await computeForceDirectedPositions(
      nodePositions, 
      parsedEdges,
    );
  } catch (error) {
    // console.error('Error during ELK graph layout:', error);
    throw error;
  }
}

// import ELK from 'elkjs/lib/elk.bundled.js';

// import { ElkNode } from '../../interfaces/nodes';


// const elk = new ELK();

// const layoutOptions = {
//   'elk.algorithm': 'layered',
//   'elk.direction': 'RIGHT',
//   'elk.layered.spacing.edgeNodeBetweenLayers': '40',
//   // 'elk.layered.spacing.nodeNodeBetweenLayers': '150',
//   // 'elk.separateConnectedComponents': 'false',
//   'elk.spacing.nodeNode': '40',
//   'elk.layered.nodePlacement.strategy': 'SIMPLE',
// };

// // uses elkjs to give each node a layouted position
// export const getLayoutedNodes = async (nodes: ElkNode[]): Promise<ElkNode[]> => {
//   const graph = {
//     id: 'root',
//     children: nodes.map((n) => {
//       const targetPorts = n.data.targetHandles.map((t) => ({
//         id: t.id,

//         // ⚠️ it's important to let elk know on which side the port is
//         // in this example targets are on the left (WEST) and sources on the right (EAST)
//         properties: {
//           side: 'WEST',
//         },
//       }));

//       const sourcePorts = n.data.sourceHandles.map((s) => ({
//         id: s.id,
//         properties: {
//           side: 'EAST',
//         },
//       }));

//       return {
//         id: n.id,
//         width: (n.width ?? 100) + 5,
//         height: (n.height ?? 100) + (n.data.noSource ? 50 : 10),
//         // ⚠️ we need to tell elk that the ports are fixed, in order to reduce edge crossings
//         properties: {
//           'org.eclipse.elk.portConstraints': 'FIXED_ORDER',
//         },
//         // we are also passing the id, so we can also handle edges without a sourceHandle or targetHandle option
//         ports: [{ id: n.id }, ...targetPorts, ...sourcePorts],
//       };
//     }),
//   };
  
//   const layoutedGraph = await elk.layout(graph, { layoutOptions });
  
//   // edges: edges.map((e) => ({
//   //   id: e.id,
//   //   sources: [e.sourceHandle || e.source],
//   //   targets: [e.targetHandle || e.target],
//   // })),
//   return nodes.reduce((acc, node) => {
//     const layoutedNode = layoutedGraph.children?.find(
//       (lgNode) => lgNode.id === node.id,
//     );

//     acc[node.id] = {
//       x: layoutedNode?.x ?? 0,
//       y: layoutedNode?.y ?? 0,
//     };

//     return acc;
//   }, {});
// };

// const checkNonTriggerHasNoSource = (n: any, edges: Edge[]) => {
//   const moduleType = n.data.module.type;
//   if (moduleType === "trigger") {
//     return false;
//   }
//   return !n.data.targetHandles.some(h => edges.some(e => e.targetHandle === h.id));
// } 