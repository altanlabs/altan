import { ElementNode } from 'lexical';
import type {
  SerializedElementNode,
  LexicalNode,
  DOMConversionMap,
  EditorConfig,
  DOMConversionOutput,
  Spread,
} from 'lexical';

// Serialized type for SpanNode
export type SerializedSpanNode = Spread<
  {
    type: 'span-node';
    version: number;
  },
  SerializedElementNode
>;

function convertSpanElement(_domNode: HTMLSpanElement): DOMConversionOutput | null {
  const node = new SpanNode();
  return { node };
}

export class SpanNode extends ElementNode {
  static getType(): string {
    return 'span-node';
  }

  static clone(node: SpanNode): SpanNode {
    return new SpanNode(node.__key);
  }

  static importJSON(serializedNode: SerializedSpanNode): SpanNode {
    const node = $createSpanNode();
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedSpanNode {
    return {
      ...super.exportJSON(),
      type: 'span-node',
      version: 1,
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    dom.className = 'span-node';
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.classList.contains('span-node')) {
          return null;
        }
        return {
          conversion: convertSpanElement,
          priority: 2,
        };
      },
    };
  }
}

export function $createSpanNode(key?: string): SpanNode {
  return new SpanNode(key);
}

export function $isSpanNode(node: LexicalNode | null | undefined): node is SpanNode {
  return node instanceof SpanNode;
}
