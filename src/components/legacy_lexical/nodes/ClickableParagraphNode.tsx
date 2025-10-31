import {
  $getSelection,
  $createTextNode,
  $setSelection,
  $isRangeSelection,
  $insertNodes,
  $getEditor,
  LexicalNode,
 ParagraphNode } from 'lexical';

export class ClickableParagraphNode extends ParagraphNode {
  static getType() {
    return 'clickable-paragraph';
  }

  static clone(node) {
    return new ClickableParagraphNode(node.__key);
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    dom.addEventListener('click', this.handleClick.bind(this));
    return dom;
  }

  handleClick(event) {
    event.stopPropagation();
    const editor = $getEditor();

    editor.update(() => {
      const currentSelection = $getSelection();
      const selectionOffset = 0; // Adjust as needed

      if ($isRangeSelection(currentSelection)) {
        const anchor = currentSelection.anchor;
        const focus = currentSelection.focus;

        const newNode = $createTextNode('');

        // Insert the new text node at the current selection
        $insertNodes([newNode]);

        // Update the selection to be inside the new text node
        currentSelection.setTextNodeRange(
          newNode,
          selectionOffset,
          newNode,
          selectionOffset
        );

        $setSelection(currentSelection);
      }
    });
  }
}

export function $createClickableParagraphNode(): ClickableParagraphNode {
  return new ClickableParagraphNode();
}

export function $isClickableParagraphNode(node: LexicalNode | null | undefined): node is ClickableParagraphNode {
  return node instanceof ClickableParagraphNode;
}
