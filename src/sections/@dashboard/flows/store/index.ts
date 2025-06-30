import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  addEdge,
} from 'reactflow';
import { validate as isValidUUID } from 'uuid';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import {
  updateEdge,
} from '../../../../redux/slices/flows';
import { dispatch } from '../../../../redux/store';

const rsplit = (str: string, sep: string, maxsplit: number): string[] => {
  const split = str.split(sep);
  return maxsplit ? [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit)) : split;
};

type RFState = {
  nodes: Node[];
  edges: Edge[];
  selectedNodes: Node[];
  selectedEdges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (id: string) => void;
  clearSelections: () => void;
};

const useStore = create<RFState>()(
  immer((set) => ({
    nodes: [],
    edges: [],
    selectedNodes: [],
    selectedEdges: [],
    setNodes: (nodes: Node[]) => {
      set((state) => {
        state.nodes = nodes;
      });
    },
    setEdges: (edges: Edge[]) => {
      set((state) => {
        state.edges = edges;
      });
    },
    onNodesChange: (changes: NodeChange[]) => {
      set((state) => {
        state.nodes = applyNodeChanges(changes, state.nodes);
      });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
      set((state) => {
        state.edges = applyEdgeChanges(changes, state.edges);
      });
    },
    onConnect: (connection: Connection) => {
      set((state) => {
        state.edges = addEdge(connection, state.edges);
      });
    },
    selectNode: (id: string) => {
      set((state) => {
        state.nodes.forEach((node) => {
          node.selected = node.id === id;
        });
        state.edges.forEach((edge) => {
          edge.selected = false;
        });
        state.selectedNodes = state.nodes.filter((node) => node.selected);
        state.selectedEdges = [];
      });
    },
    selectEdge: (source: string, target: string) => {
      set((state) => {
        state.edges.forEach((edge) => {
          edge.selected = source === edge.source && target === edge.target;
        });
        state.nodes.forEach((node) => {
          node.selected = false;
        });
      });
    },
    deleteModules: (modules: Node[]) => {
      set((state) => {
        const newNodeIds = modules.map((node) => node.id);
        state.edges = state.edges.filter((edge) => !newNodeIds.includes(edge.target));
        state.nodes = state.nodes.filter((node) => !newNodeIds.includes(node.id));
      });
    },
    setSelection: (selectedNodes: Node[], selectedEdges: Edge[]) => {
      set((state) => {
        state.selectedNodes = selectedNodes ?? [];
        state.selectedEdges = selectedEdges ?? [];
      });
    },
    clearSelections: () => {
      set((state) => {
        state.nodes.forEach((node) => {
          node.selected = false;
        });
        state.edges.forEach((edge) => {
          edge.selected = false;
        });
        state.selectedNodes = [];
        state.selectedEdges = [];
      });
    },
    // Add to the store
    addConnection: (params: Connection) => {
      set((state) => {
        const { source, target, sourceHandle, targetHandle } = params;

        if (!source || !target) {
          return;
        }

        const sourceNode = state.nodes.find((node) => node.id === source);
        const targetNode = state.nodes.find((node) => node.id === target);

        const splitted = sourceHandle === undefined ? undefined : rsplit(sourceHandle, ':', 1).filter(Boolean);
        const condition = splitted === undefined ? null : (splitted.length > 1 ? splitted[1] : null);

        if (isValidUUID(target) && (!condition || isValidUUID(condition))) {
          dispatch(updateEdge(source, condition, target, sourceHandle?.endsWith("-e") ?? false)).catch(() => {

          });
        }

        state.edges.push({
          id: `edge:${source}:${target}`,
          source,
          target,
          sourceHandle,
          targetHandle,
          type: 'circles',
          data: {
            selectIndex: 0,
            sourceNodeColor: sourceNode?.data?.color,
            targetNodeColor: targetNode?.data?.color,
          },
        });
      });
    },

  }))
);

export default useStore;
