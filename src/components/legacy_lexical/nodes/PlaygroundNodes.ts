import type {Klass, LexicalNode} from 'lexical';

// import {CodeHighlightNode, CodeNode} from '@lexical/code';
// import {HashtagNode} from '@lexical/hashtag';
// import {AutoLinkNode, LinkNode} from '@lexical/link';
// import {ListItemNode, ListNode} from '@lexical/list';
// import {MarkNode} from '@lexical/mark';
// import {OverflowNode} from '@lexical/overflow';
// import {HorizontalRuleNode} from '@lexical/react/LexicalHorizontalRuleNode';
// import {HeadingNode, QuoteNode} from '@lexical/rich-text';
// import {TableCellNode, TableNode, TableRowNode} from '@lexical/table';

// import {CollapsibleContainerNode} from '../plugins/CollapsiblePlugin/CollapsibleContainerNode';
// import {CollapsibleContentNode} from '../plugins/CollapsiblePlugin/CollapsibleContentNode';
// import {CollapsibleTitleNode} from '../plugins/CollapsiblePlugin/CollapsibleTitleNode';
// import {AutocompleteNode} from './AutocompleteNode';
// import {EmojiNode} from './EmojiNode';
// import {EquationNode} from './EquationNode';
// import {FigmaNode} from './FigmaNode';
// import {ImageNode} from './ImageNode';
// import {InlineImageNode} from './InlineImageNode';
// import {KeywordNode} from './KeywordNode';
// import {LayoutContainerNode} from './LayoutContainerNode';
// import {LayoutItemNode} from './LayoutItemNode';
// import {MentionNode} from './MentionNode';
// import {PageBreakNode} from './PageBreakNode';
// import {PollNode} from './PollNode';
// import {TweetNode} from './TweetNode';
// import {YouTubeNode} from './YouTubeNode';
import { DecoratedTextNode } from './DecoratedTextNode';
import { EmptyArgNode } from './EmptyArgNode';
import { HelperNameNode } from './HelperNameNode';
import { HelperNode } from './HelperNode';
import { SpanNode } from './SpanNode';
import { VarNode } from './VarNode';
// Import ComponentTargetNode from the editor folder
import ComponentTargetNode from '../../editor/nodes/ComponentTargetNode';
// import { ClickableParagraphNode } from './ClickableParagraphNode';

const PlaygroundNodes: Array<Klass<LexicalNode>> = [
  // HeadingNode,
  // ListNode,
  // ListItemNode,
  // QuoteNode,
  // CodeNode,
  // TableNode,
  // TableCellNode,
  // TableRowNode,
  // HashtagNode,
  // CodeHighlightNode,
  // AutoLinkNode,
  // LinkNode,
  // OverflowNode,
  // PollNode,
  // ImageNode,
  // InlineImageNode,
  // MentionNode,
  VarNode,
  HelperNode,
  HelperNameNode,
  EmptyArgNode,
  DecoratedTextNode,
  SpanNode,
  ComponentTargetNode,
  // ClickableParagraphNode
  // EmojiNode,
  // EquationNode,
  // AutocompleteNode,
  // KeywordNode,
  // HorizontalRuleNode,
  // TweetNode,
  // YouTubeNode,
  // FigmaNode,
  // MarkNode,
  // CollapsibleContainerNode,
  // CollapsibleContentNode,
  // CollapsibleTitleNode,
  // PageBreakNode,
  // LayoutContainerNode,
  // LayoutItemNode,
];

export default PlaygroundNodes;
