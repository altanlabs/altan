import type {Spread,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
  $applyNodeReplacement,
  TextNode,
} from 'lexical';


export type SerializedMentionNode = Spread<
  {
    mentionName: string;
    mentionId: string;
  },
  SerializedTextNode
>;

function convertMentionElement(domNode: HTMLElement): DOMConversionOutput | null {
  // Extract both mentionName and mentionId from the DOM element
  const mentionName = domNode.getAttribute('data-mention-name');
  const mentionId = domNode.getAttribute('data-mention-id');

  if (mentionName && mentionId) {
    const node = $createMentionNode(mentionName, mentionId);
    return {
      node,
    };
  }

  return null;
}

export class MentionNode extends TextNode {
  __mention: string;
  __mentionId: string;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mention, node.__mentionId, node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.mentionName, serializedNode.mentionId);
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  constructor(mentionName: string, mentionId: string, text?: string, key?: NodeKey) {
    super(text ?? `[@${mentionName}](/member/${mentionId})`, key);
    // super(text ?? `@${mentionName}`, key);
    this.__mention = mentionName;
    this.__mentionId = mentionId;
  }
  
  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      mentionId: this.__mentionId,
      type: 'mention',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.className = 'mention'; 
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute('data-lexical-mention', 'true');
    element.setAttribute('data-mention-id', this.__mentionId);
    element.setAttribute('data-mention-name', this.__mention);
    element.textContent = this.__text;
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-mention')) {
          return null;
        }
        return {
          conversion: convertMentionElement,
          priority: 1,
        };
      },
    };
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  getFull(): string {
    return `**[@${this.__mention}](/member/${this.__mentionId})**`;
  }

  // getTextContent(): string {
  //   const realText = super.getTextContent();
  //   console.log("REAL TEXT", realText);
  //   return `**[@${this.__mention}](/member/${this.__mentionId})**`;
  // }

  // getTextContentSize(): number {
  //   return `@${this.__mention}`.length;
  // }
}

export function $createMentionNode(mentionName: string, mentionId: string): MentionNode {
  const mentionNode = new MentionNode(mentionName, mentionId);
  mentionNode.setMode('token').toggleDirectionless();
  mentionNode.setFormat(1);
  return $applyNodeReplacement(mentionNode);
}

export function $isMentionNode(
  node: LexicalNode | null | undefined,
): node is MentionNode {
  return node instanceof MentionNode;
}
