import { DecoratorNode } from 'lexical';
import type {
  LexicalNode,
  NodeKey,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  SerializedLexicalNode,
  EditorConfig,
} from 'lexical';
import * as React from 'react';

import { Method, SerializedMethod } from './HelperNode';
import HelperMethodChip from '../../flows/menuvars/HelperMethodChip.jsx';

export type SerializedHelperNameNode = {
  method: object;
  prefix: string;
  type: 'helper-name';
  version: number;
} & SerializedLexicalNode;

function convertHelperNameElement(domNode: HTMLSpanElement): DOMConversionOutput | null {
  const methodRaw = domNode.getAttribute('data-helper-name-method');
  const prefix = domNode.getAttribute('data-helper-name-prefix');
  if (methodRaw && prefix) {
    const method: object = JSON.parse(methodRaw) as object;
    const node = new HelperNameNode(new Method(method as SerializedMethod), prefix);
    return { node };
  }
  return null;
}

export class HelperNameNode extends DecoratorNode<React.ReactNode> {
  __method: Method;
  __prefix: string;

  static getType(): string {
    return 'helper-name';
  }

  static clone(node: HelperNameNode): HelperNameNode {
    return $createHelperNameNode(node.__method, node.__prefix, node.__key);
  }

  constructor(method: Method, prefix: string, key?: NodeKey) {
    super(key);
    this.__method = method;
    this.__prefix = prefix;
  }

  static importJSON(serializedNode: SerializedHelperNameNode): HelperNameNode {
    const node = $createHelperNameNode(
      new Method(serializedNode.method as SerializedMethod),
      serializedNode.prefix,
    );
    // node.setFormat(serializedNode.format);
    return node;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    dom.className = 'helper-name';
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute('data-helper-name-method', this.__method.serialize());
    element.setAttribute('data-helper-name-prefix', this.__prefix);
    return { element };
  }

  getTextContent(_includeInert?: boolean, _includeDirectionless?: false): string {
    return `${this.__prefix}.${this.__method.name}(`;
  }

  exportJSON(): SerializedHelperNameNode {
    return {
      ...super.exportJSON(),
      method: JSON.parse(this.__method.serialize()),
      prefix: this.__prefix,
      type: 'helper-name',
      version: 1,
    };
  }

  decorate(): JSX.Element {
    return (
      <HelperMethodChip
        prefix={this.__prefix}
        method={this.__method}
      />
    );
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.classList.contains('helper-name')) {
          return null;
        }
        const methodRaw = domNode.hasAttribute('data-helper-name-method');
        const prefix = domNode.hasAttribute('data-helper-name-prefix');

        if (!(methodRaw && prefix)) {
          return null;
        }
        return {
          conversion: convertHelperNameElement,
          priority: 2,
        };
      },
    };
  }
}

export function $createHelperNameNode(
  method: Method,
  prefix: string,
  key?: NodeKey,
): HelperNameNode {
  return new HelperNameNode(method, prefix, key);
}

export function $isHelperNameNode(node: LexicalNode | null | undefined): node is HelperNameNode {
  return node instanceof HelperNameNode;
}
