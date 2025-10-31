import {
  DecoratorNode,
  SerializedDecoratorBlockNode,
  LexicalNode,
  NodeKey,
  DOMConversionMap,
  EditorConfig
} from 'lexical';
// import MentionComponent from '../../room/members/MentionComponent';


export type SerializedMentionNode = {
  mentionName: string;
  mentionId: string;
  type: 'mention';
  version: number;
} & SerializedDecoratorBlockNode;

export class MentionNode extends DecoratorNode<JSX.Element> {
  __mentionName: string;
  __mentionId: string;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mentionName, node.__mentionId, node.__key);
  }

  constructor(mentionName: string, mentionId: string, key?: NodeKey) {
    super(key);
    this.__mentionName = mentionName;
    this.__mentionId = mentionId;
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.mentionName, serializedNode.mentionId);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedMentionNode {
    return {
      mentionName: this.getMentionName(),
      mentionId: this.getMentionId(),
      type: 'mention',
      version: 1
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    dom.className = 'mention';
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return null;//<MentionComponent mentionName={this.__mentionName} mentionId={this.__mentionId} />;
  }

  getMentionName(): string {
    return this.__mentionName;
  }

  getMentionId(): string {
    return this.__mentionId;
  }

  getTextContent(
    _includeInert?: boolean  ,
    _includeDirectionless?: false  ,
  ): string {
    return `**[@${this.__mentionName}](/member/${this.__mentionId})**`;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.classList.contains('mention')) {
          return null;
        }
        const mentionName = domNode.getAttribute('data-mention-name');
        const mentionId = domNode.getAttribute('data-mention-id');
        if (mentionName && mentionId) {
          const node = new MentionNode(mentionName, mentionId);
          return { node };
        }
        return null;
      }
    };
  }
}

export function $createMentionNode(mentionName: string, mentionId: string): MentionNode {
  return new MentionNode(mentionName, mentionId);
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode;
}