import {
  $getSelection,
  $isRangeSelection,
  $createTextNode,
  TextNode,
  $isTextNode,
  LexicalEditor,
  RangeSelection,
  $getRoot,
  $isParagraphNode,
  $createParagraphNode,
  LexicalNode,
  ParagraphNode,
} from 'lexical';

import { HelperNode } from '../../../legacy_lexical/nodes/HelperNode';
import { $isSpanNode } from '../../../legacy_lexical/nodes/SpanNode';
import { VarNode } from '../../../legacy_lexical/nodes/VarNode';


function calculateDepth(text: string, offset: number): number {
  let depth = 0;
  for (let i = 0; i < offset; i++) {
    if (text[i] === '{') depth++;
    if (text[i] === '}') depth--;
  }
  return depth;
}


const PAIRS = {
  '{': {
    replacement: (depth: number) => `\n${'\t'.repeat(depth)}\n${'\t'.repeat(!depth ? depth : depth - 1)}}`,
    addition: true,
    offsetFocus: (depth: number) => -2 - depth + 1,
  },
  '[': {
    replacement: (depth: number) => '\n\t\n]',
    addition: true,
    offsetFocus: (depth: number) => -2 - depth + 1,
  },
  '"': {
    replacement: (depth: number) => '"',
    addition: true,
    offsetFocus: (depth: number) => -1,
    condition: (textContent: string, anchorOffset: number) => textContent[anchorOffset] !== '"'
  },
  "'": {
    replacement: (depth: number) => "'",
    addition: true,
    offsetFocus: (depth: number) => -1,
    condition: (textContent: string, anchorOffset: number) => textContent[anchorOffset] !== "'"
  },
  ':': {
    replacement: (depth: number) => ' ',
    addition: true,
    offsetFocus: (depth: number) => 0,
    condition: (textContent: string, anchorOffset: number) => ["'", '"'].includes(textContent[anchorOffset - 2])
  },
  ',': {
    replacement: (depth: number) => ` \n${'\t'.repeat(depth)}`,
    addition: true,
    offsetFocus: (depth: number) => -3 + depth,
  }
};


const TRIGGERS = Object.keys(PAIRS);


export function autoIndentAndClose(editor: LexicalEditor, prevTextContent: string, currTextContent: string) {
  editor.update(() => {
    if (prevTextContent !== currTextContent && prevTextContent.length < currTextContent.length) {
      console.log("rerender");

      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        if (!$isTextNode(anchorNode)) {
          return;
        }
        const anchorOffset = anchor.offset;
        const textContent = anchorNode.getTextContent();
        console.log("textContent", textContent, anchorOffset);

        // Auto-closing pairs
        const singleCharTrigger = textContent[anchorOffset - 1];

        if (TRIGGERS.includes(singleCharTrigger)) {
          const pair = PAIRS[singleCharTrigger];

          if (pair && (!pair.condition || pair.condition(textContent, anchorOffset))) {
            let newTextContent = '';
            const beforeText = textContent.slice(0, anchorOffset);
            const afterText = textContent.slice(anchorOffset);
            const depth = calculateDepth(textContent, anchorOffset);
            const textReplacement = pair.replacement(depth);
            if (pair.addition) {
              newTextContent = beforeText + textReplacement + afterText;
            } else {
              newTextContent = beforeText.slice(0, -1) + textReplacement + afterText;
            }
            
            // Set the updated text content
            anchorNode.setTextContent(newTextContent);
            
            // Calculate new cursor position
            const newOffset = beforeText.length + textReplacement.length + pair.offsetFocus(depth);
            selection.anchor.set(anchorNode.getKey(), newOffset, 'text');
            selection.focus.set(anchorNode.getKey(), newOffset, 'text');
            
            return;
          }
        }
      }
    }
  });
}

// // Auto-indentation
// const lines = textContent.split('\n');
// const currentLineIndex = textContent.slice(0, anchorOffset).split('\n').length - 1;

// if (lines.length > 1) {
//   const currentLine = lines[currentLineIndex];
//   const previousLine = lines[currentLineIndex - 1];
//   const previousIndentationMatch = previousLine.match(/^\s*/);
//   const previousIndentation = previousIndentationMatch ? previousIndentationMatch[0] : '';
//   const currentIndentationMatch = currentLine.match(/^\s*/);
//   const currentIndentation = currentIndentationMatch ? currentIndentationMatch[0] : '';

//   if (previousIndentation.length > currentIndentation.length) {
//     const indentLength = previousIndentation.length - currentIndentation.length;
//     const newIndentation = ' '.repeat(indentLength) + currentLine.trim();

//     const newTextNode = $createTextNode(newIndentation);
//     anchorNode.replace(newTextNode);
//     selection.anchor.set(newTextNode.getKey(), indentLength, 'text');
//     selection.focus.set(newTextNode.getKey(), indentLength, 'text');
//   }
// }

// Additional helper for JSON key-value auto-completion
export function autoCompleteJSON(editor: LexicalEditor, prevTextContent: string, currTextContent: string) {
  editor.update(() => {
    if (prevTextContent !== currTextContent) {
      // const selection = $getSelection();
      // if ($isRangeSelection(selection)) {
      //   const anchor = selection.anchor;
      //   const anchorNode = anchor.getNode();
      //   if (!$isTextNode(anchorNode)) {
      //     return;
      //   }
      //   const anchorOffset = anchor.offset;
      //   const textContent = anchorNode.getTextContent();

      //   if (textContent[anchorOffset - 1] === ':') {
      //     const newTextNode = $createTextNode(' ""');
      //     anchorNode.insertAfter(newTextNode);
      //     selection.anchor.set(anchorNode.getKey(), anchorOffset + 2, 'text');
      //     selection.focus.set(anchorNode.getKey(), anchorOffset + 2, 'text');
      //   }
      // }
    }
  });
}

// Additional helper for Python snippet completions
export function autoCompletePythonSnippets(editor: LexicalEditor) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchor = selection.anchor;
      const anchorNode = anchor.getNode();
      if (!$isTextNode(anchorNode)) {
        return;
      }
      const anchorOffset = anchor.offset;
      const textContent = anchorNode.getTextContent();

      const snippets = {
        'if ': 'if :\n\t',
        'for ': 'for in :\n\t',
        'def ': 'def ():',
        'class ': 'class :\n\tdef __init__(self):\n\t\t',
      };

      for (const trigger in snippets) {
        if (textContent.endsWith(trigger)) {
          const snippet = snippets[trigger];
          const newTextNode = $createTextNode(snippet);
          anchorNode.replace(newTextNode);
          // selection.anchor.set(newTextNode.getKey(), snippets[trigger].length, 'text');
          // selection.focus.set(newTextNode.getKey(), trigger.length, 'text');
          return;
        }
      }
    }
  });
}

// Helper function to find or create the closest ParagraphNode
const getOrCreateParagraphNode = (node: LexicalNode): ParagraphNode => {
  let current: LexicalNode | null = node;
  while (current) {
    if ($isParagraphNode(current)) {
      return current;
    }
    current = current.getParent();
  }
  // If no ParagraphNode is found, create one and append it to the root
  const rootNode = $getRoot();
  const newParagraphNode = $createParagraphNode();
  rootNode.append(newParagraphNode);
  return newParagraphNode;
};


export const $insertNodeAtCollapsedSelection = (
  nodeToInsert: VarNode | HelperNode,
  selection: RangeSelection
) => {
  const anchorNode = selection.anchor.getNode();
  const anchorOffset = selection.anchor.offset;

  if ($isTextNode(anchorNode)) {
    const textLength = anchorNode.getTextContentSize();

    if (anchorOffset === 0) {
      // Cursor is at the start of the TextNode
      // Insert the new node before the TextNode
      anchorNode.insertBefore(nodeToInsert);

      // Update the selection to be after the inserted node
      selection.setTextNodeRange(anchorNode, 0, anchorNode, 0);
    } else if (anchorOffset === textLength) {
      // Cursor is at the end of the TextNode
      // Insert the new node after the TextNode
      anchorNode.insertAfter(nodeToInsert);

      nodeToInsert.selectEnd();

      // Update the selection to be after the inserted node
      // selection.setTextNodeRange(
      //   nodeToInsert as TextNode,
      //   nodeToInsert.getTextContentSize(),
      //   nodeToInsert as TextNode,
      //   nodeToInsert.getTextContentSize()
      // );
    } else {
      // Cursor is in the middle of the TextNode
      // Split the TextNode at the cursor position
      const [leftTextNode, rightTextNode] =
        anchorNode.splitText(anchorOffset);

      // Insert the new node between the split text nodes
      leftTextNode.insertAfter(nodeToInsert);
      nodeToInsert.insertAfter(rightTextNode);

      // Update the selection to be after the inserted node
      selection.setTextNodeRange(rightTextNode, 0, rightTextNode, 0);
    }
  } else if ($isParagraphNode(anchorNode) || $isSpanNode(anchorNode)) {
    // If the anchor node is an ElementNode (e.g., ParagraphNode)
    // Insert the node within it at the specific position
    const offset = selection.anchor.offset;
    const children = anchorNode.getChildren();

    if (offset >= children.length) {
      // Insert at the end
      anchorNode.append(nodeToInsert);
    } else {
      // Insert before the child at the offset
      const targetNode = children[offset];
      targetNode.insertBefore(nodeToInsert);
    }

    nodeToInsert.selectEnd();

    // Update the selection to be after the inserted node
    // selection.setTextNodeRange(
    //   nodeToInsert as TextNode,
    //   nodeToInsert.getTextContentSize(),
    //   nodeToInsert as TextNode,
    //   nodeToInsert.getTextContentSize()
    // );
  } else {
    // For other types of nodes (e.g., VarNode, HelperNode)
    // Find or create a ParagraphNode
    const paragraphNode = getOrCreateParagraphNode(anchorNode);

    // Insert the new node at the appropriate position within the paragraph
    paragraphNode.append(nodeToInsert);

    // Update the selection to be after the inserted node
    // selection.setTextNodeRange(
    //   nodeToInsert as TextNode,
    //   nodeToInsert.getTextContentSize(),
    //   nodeToInsert as TextNode,
    //   nodeToInsert.getTextContentSize()
    // );
  }
};

export const $insertNodeAtNonCollapsedSelection = (
  nodeToInsert: VarNode | HelperNode,
  selection: RangeSelection
) => {
  const selectedNodes = selection.getNodes();

  if (selectedNodes.length > 0) {
    const firstSelectedNode = selectedNodes[0];
    const lastSelectedNode = selectedNodes[selectedNodes.length - 1];

    // Remove all selected nodes
    selectedNodes.forEach((node) => node.remove());

    // Insert the new node where the first selected node was
    firstSelectedNode.insertBefore(nodeToInsert);

    // Handle remaining text in the last selected TextNode
    if (
      lastSelectedNode instanceof TextNode &&
      selection.focus.offset < lastSelectedNode.getTextContentSize()
    ) {
      const remainingText = lastSelectedNode
        .getTextContent()
        .slice(selection.focus.offset);
      const newTextNode = $createTextNode(remainingText);

      // Insert the remaining text after the new node
      nodeToInsert.insertAfter(newTextNode);
    }

    // Update the selection to be after the inserted node
    // selection.setTextNodeRange(
    //   nodeToInsert as TextNode,
    //   nodeToInsert.getTextContentSize(),
    //   nodeToInsert as TextNode,
    //   nodeToInsert.getTextContentSize()
    // );
  } else {
    // If the selection has no nodes (unlikely but possible)
    // Find or create a ParagraphNode to insert the node into
    const paragraphNode = getOrCreateParagraphNode($getRoot());
    paragraphNode.append(nodeToInsert);

    // Update the selection to be after the inserted node
    // selection.setTextNodeRange(
    //   nodeToInsert as TextNode,
    //   nodeToInsert.getTextContentSize(),
    //   nodeToInsert as TextNode,
    //   nodeToInsert.getTextContentSize()
    // );
  }
};