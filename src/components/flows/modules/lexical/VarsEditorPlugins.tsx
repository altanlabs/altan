// VarsEditorPlugins.tsx
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  // LexicalEditor,
  EditorState,
  ElementNode,
  $isParagraphNode,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  FOCUS_COMMAND,
  // $insertNodes,
  // $setSelection,
  $isTextNode,
} from 'lexical';
import { debounce, uniqueId } from 'lodash';
import React, { RefObject, useEffect, useMemo, useRef } from 'react';
// import { $createVarNode, VarNode, $isVarNode } from './VarNode';
// import {
//   $createHelperNode,
//   HelperNode,
//   $isHelperNode,
// } from './HelperNode';
// import { openMenu } from './menuSlice';
// import { VarOption, HelperOption } from './types';
// import './editor.css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { $insertNodeAtCollapsedSelection, $insertNodeAtNonCollapsedSelection } from './utils';
import { openGlobalVarsMenu } from '../../../../redux/slices/general';
import { dispatch } from '../../../../redux/store';
import {
  $createHelperNode,
  $isHelperNode,
  HelperNode,
  HelperOption,
  Method,
  SerializedMethod,
} from '../../../lexical/nodes/HelperNode';
// import { METHODS } from '../../menuvars/helpers';
// import { getNested } from '../../../tools/dynamic/utils';

import { $isSpanNode } from '../../../lexical/nodes/SpanNode';
import { $createVarNode, $isVarNode, VarNode, VarOption } from '../../../lexical/nodes/VarNode';

// const serializeContent = (node: ElementNode): string => {
//   let text = "";
//   if (!node) {
//     return text;
//   }
//   if ($isVarNode(node) || $isHelperNode(node) || $isSpanNode(node) || $isTextNode(node)) {
//     return node.getTextContent();
//   }
//   node.getChildren().forEach((child) => {
//     text += serializeContent(child as ElementNode);
//   });
//   return text;
// };

const serializeContent = (node: ElementNode): string => {
  if (!node) return '';

  if ($isVarNode(node) || $isHelperNode(node) || $isSpanNode(node) || $isTextNode(node)) {
    return node.getTextContent();
  }

  const children = node.getChildren().map((child) => serializeContent(child as ElementNode));

  // If any child is a paragraph, join with '\n' to preserve line breaks
  const shouldJoinWithNewline = node
    .getChildren()
    .some((child) => (child as ElementNode).getType() === 'paragraph');

  return children.join(shouldJoinWithNewline ? '\n' : '');
};

type HandleChangeProps = {
  onChange?: () => void;
  valueRef: React.RefObject<string>;
};

export const useHandleChange = ({ onChange, valueRef }: HandleChangeProps): unknown => {
  return useMemo((): unknown => {
    return debounce((editorState: EditorState) => {
      editorState.read(() => {
        const root = $getRoot();
        if (!root) return;

        const text: string = serializeContent(root as ElementNode);

        if (!!onChange && valueRef.current !== text) {
          valueRef.current = text;
          onChange(text);
        }
      });
    }, 300); // Adjust debounce interval as needed
  }, [onChange, valueRef]);
};

interface VarsEditorPluginsProps {
  onChange?: (value: any) => void;
  style?: React.CSSProperties;
  valueRef: RefObject<string>;
}

const VarsEditorPlugins: React.FC<VarsEditorPluginsProps> = ({ onChange, style, valueRef }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorId: string = uniqueId();
  const [editor] = useLexicalComposerContext();

  const insertNodeAtCursor = (option: VarOption | HelperOption) => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        let nodeToInsert: VarNode | HelperNode;

        // Create the appropriate node based on the option type
        if (option instanceof VarOption) {
          nodeToInsert = $createVarNode(option);
        } else if (option instanceof HelperOption) {
          nodeToInsert = $createHelperNode(
            option.name,
            option.prefix,
            new Method(option.method as SerializedMethod),
          );
        } else {
          return; // Exit early if option type is unhandled
        }

        if (selection.isCollapsed()) {
          // Handle collapsed selection (insertion point)
          $insertNodeAtCollapsedSelection(nodeToInsert, selection);
        } else {
          // Handle non-collapsed selection (text range)
          $insertNodeAtNonCollapsedSelection(nodeToInsert, selection);
        }
      }
    });
  };
  // Helper function to find the closest ParagraphNode
  // const findParagraphNode = (node: LexicalNode): ParagraphNode | null => {
  //   let current: LexicalNode | null = node;
  //   while (current) {
  //     console.log("current", current);
  //     if ($isParagraphNode(current)) {
  //       return current;
  //     }
  //     current = current.getParent();
  //   }
  //   return null;
  // };

  // const handleChange = useCallback((editorState: EditorState) => {
  //   editorState.read(() => {
  //     const root = $getRoot();
  //     const text = serializeContent(root);
  //     console.log("serialized content", text);
  //     if (onChange) {
  //       onChange(text);
  //     }
  //   });
  // }, [onChange]);

  // const handleChange = useMemo(() => debounce((editorState: EditorState) => {
  //     editorState.read(() => {
  //       const root = $getRoot();
  //       const text = serializeContent(root);
  //       if (!!onChange && valueRef.current !== text) {
  //         onChange(text);
  //       }
  //     });
  //   }, 300), // Adjust debounce interval as needed
  //   [onChange, valueRef]
  // );

  const handleChange = useHandleChange({
    editor,
    onChange,
    valueRef,
  });

  // Listen for menu selection events
  useEffect(() => {
    const handleMenuSelect = (event: CustomEvent<{ value: VarOption | HelperOption }>) => {
      const selectedOption = event.detail.value;
      insertNodeAtCursor(selectedOption);
    };

    window.addEventListener(`menuSelect:${editorId}`, handleMenuSelect as EventListener);

    return () => {
      window.removeEventListener(`menuSelect:${editorId}`, handleMenuSelect as EventListener);
    };
  }, [editor]);

  useEffect(() => {
    // Handle focus event to open the global menu
    const unregisterFocus = editor.registerCommand(
      FOCUS_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          dispatch(openGlobalVarsMenu({ context: { editorId, anchorEl: editorRef.current } }));
        });
        return false; // Continue to other handlers
      },
      COMMAND_PRIORITY_LOW,
    );

    // Handle selection change to check for empty paragraphs
    const unregisterSelectionChange = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_, newEditor) => {
        newEditor.update(() => {
          const selection = $getSelection();
          // console.log("@SELECTION_CHANGE_COMMAND bitch", selection);
          if (!selection) {
            // console.log("no selection", );
            $getRoot().getChildren()[0].selectEnd();
            return false;
          }
          if ($isRangeSelection(selection) && selection.isCollapsed()) {
            const nodes = selection.getNodes();
            if (nodes.length !== 1) {
              return false;
            }
            const uniqueNode = nodes[0];
            // console.log("nodes", nodes);
            if (!($isParagraphNode(uniqueNode) || $isHelperNode(uniqueNode))) {
              return false;
            }
            const root = $getRoot();
            if (
              uniqueNode.getTextContent().replace(' ', '') === '' &&
              root.getTextContent() === ''
            ) {
              // console.log("root", root.getChildren());
              root.clear();
            }
          }
        });
        return false; // Continue to other handlers
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterFocus();
      unregisterSelectionChange();
    };
  }, [editor]);

  return (
    <div
      className="input-container"
      ref={editorRef}
    >
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            // className="editor-input"
            style={style}
          />
        }
        placeholder={
          <div className="editor-placeholder">Click to select helpers and variables...</div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <OnChangePlugin onChange={handleChange} />
    </div>
  );
};

export default React.memo(VarsEditorPlugins);
