import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Tooltip } from '@mui/material';
import Chip from '@mui/material/Chip'; // Assuming you're using Material-UI for the Chip component
import { DecoratorNode } from 'lexical';
import type {
  LexicalNode,
  NodeKey,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  Spread,
  SerializedLexicalNode,
  EditorConfig,
} from 'lexical';
import * as React from 'react';

import { MethodArg, MethodKwarg } from './HelperNode';
import { $createSpanNode } from './SpanNode';

export type SerializedEmptyArgNode = Spread<
  {
    arg: MethodArg | MethodKwarg;
    type: 'empty-arg';
    version: number;
  },
  SerializedLexicalNode
>;

const EmptyArgComponent = ({ node }: { node: EmptyArgNode }): JSX.Element => {
  const [editor] = useLexicalComposerContext();

  const handleClick = React.useCallback((): void => {
    editor.update(() => {
      const spanNode = $createSpanNode();
      node.replace(spanNode);
      console.log('replaced');
      spanNode.select();
      console.log('selected');

      // const textNode = $createTextNode('');
      // spanNode.append(textNode);
      // spanNode.select();
    });
  }, [editor, node]);

  return (
    <Tooltip
      arrow
      title={`Click to add a ${node.__arg.type} argument.`}
    >
      <Chip
        color="warning"
        size="small"
        label={node.__arg.type}
        sx={{ borderRadius: 1 }}
        onClick={handleClick}
      />
    </Tooltip>
  );
};

function convertEmptyArgElement(domNode: HTMLSpanElement): DOMConversionOutput | null {
  const argRaw = domNode.getAttribute('data-empty-arg');
  if (argRaw) {
    const arg: MethodArg = JSON.parse(argRaw) as MethodArg;
    const node = new EmptyArgNode(arg);
    return { node };
  }
  return null;
}

export class EmptyArgNode extends DecoratorNode<React.ReactNode> {
  __arg: MethodArg | MethodKwarg;

  static getType(): string {
    return 'empty-arg';
  }

  static clone(node: EmptyArgNode): EmptyArgNode {
    return new EmptyArgNode(node.__arg, node.__key);
  }

  constructor(arg: MethodArg | MethodKwarg, key?: NodeKey) {
    super(key);
    this.__arg = arg;
  }

  static importJSON(serializedNode: SerializedEmptyArgNode): EmptyArgNode {
    return $createEmptyArgNode(serializedNode.arg);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    dom.className = 'empty-arg';
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute('data-empty-arg', JSON.stringify(this.__arg));
    return { element };
  }

  getTextContent(_includeInert?: boolean, _includeDirectionless?: false): string {
    return '';
  }

  exportJSON(): SerializedEmptyArgNode {
    return {
      ...super.exportJSON(),
      arg: this.__arg,
      type: 'empty-arg',
      version: 1,
    };
  }

  decorate(): JSX.Element {
    return <EmptyArgComponent node={this} />;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.classList.contains('empty-arg')) {
          return null;
        }
        const argRaw = domNode.hasAttribute('data-empty-arg');
        if (!argRaw) {
          return null;
        }
        return {
          conversion: convertEmptyArgElement,
          priority: 2,
        };
      },
    };
  }
}

export function $createEmptyArgNode(arg: MethodArg | MethodKwarg): EmptyArgNode {
  return new EmptyArgNode(arg);
}

export function $isEmptyArgNode(node: LexicalNode | null | undefined): node is EmptyArgNode {
  return node instanceof EmptyArgNode;
}
