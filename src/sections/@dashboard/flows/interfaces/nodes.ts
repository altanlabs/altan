import type { Node } from 'reactflow';

export type ElkNodeData = {
  label: string;
  sourceHandles: { id: string }[];
  targetHandles: { id: string }[];
  exceptHandles: { id: string }[];
  noSource: boolean;
};

export type ElkNode = Node<ElkNodeData, 'elk'>;