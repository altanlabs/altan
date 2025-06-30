import Chip from '@mui/material/Chip'; // Assuming you're using Material-UI for the Chip component
import { DecoratorNode } from 'lexical';
import type {
  NodeKey,
  DOMExportOutput,
  SerializedLexicalNode,
  LexicalNode,
  DOMConversionMap,
  EditorConfig,
  DOMConversionOutput,
  Spread,
} from 'lexical';
import * as React from 'react';

function convertDecoratedTextElement(domNode: HTMLSpanElement): DOMConversionOutput | null {
  const text = domNode.getAttribute('data-decorated-text-text');
  if (text) {
    const node = new DecoratedTextNode(text);
    return { node };
  }
  return null;
}

export type SerializedDecoratedTextNode = Spread<
  {
    text: string;
    type: 'decorated-text';
    version: number;
  },
  SerializedLexicalNode
>;

export class DecoratedTextNode extends DecoratorNode<React.ReactNode> {
  __text: string;

  static getType(): string {
    return 'decorated-text';
  }

  static clone(node: DecoratedTextNode): DecoratedTextNode {
    return $createDecoratedTextNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(key);
    this.__text = text.trim();
  }

  static importJSON(serializedNode: SerializedDecoratedTextNode): DecoratedTextNode {
    const node = $createDecoratedTextNode(serializedNode.text);
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute('data-decorated-text-text', this.__text.trim());
    return { element };
  }

  getTextContent(_includeInert?: boolean, _includeDirectionless?: false): string {
    return this.__text.trim();
  }

  exportJSON(): SerializedDecoratedTextNode {
    return {
      ...super.exportJSON(),
      text: this.__text,
      type: 'decorated-text',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    dom.className = 'decorated-text';
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <Chip
        size="small"
        label={this.__text}
        sx={{ borderRadius: 1 }}
      />
    );
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.classList.contains('decorated-text')) {
          return null;
        }
        const text = domNode.hasAttribute('data-decorated-text-text');
        if (!text) {
          return null;
        }
        return {
          conversion: convertDecoratedTextElement,
          priority: 2,
        };
      },
    };
  }
}

export function $createDecoratedTextNode(text: string, key?: NodeKey): DecoratedTextNode {
  return new DecoratedTextNode(text, key);
}

export function $isDecoratedTextNode(
  node: LexicalNode | null | undefined,
): node is DecoratedTextNode {
  return node instanceof DecoratedTextNode;
}
