import { LexicalComposer } from '@lexical/react/LexicalComposer';
import type { BaseSelection, LexicalEditor, LexicalNode } from 'lexical';
import {
  $getSelection,
  $createTextNode,
  $isRangeSelection,
  $getRoot,
  $isParagraphNode,
  $isTextNode,
  $createParagraphNode,
} from 'lexical';
import { memo, RefObject, useMemo, useEffect, useCallback } from 'react';

import useMessageListener from '@hooks/useMessageListener.ts';

import EditorPlugins from './EditorPlugins.tsx';
import { $createCodeFileTargetNode, CodeFileTargetDetails } from './nodes/CodeFileTargetNode.tsx';
import {
  $createComponentTargetNode,
  ComponentTargetDetails,
} from './nodes/ComponentTargetNode.tsx';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import editorTheme from '../../theme/editorTheme.js';
// import './editor.css';
import type { Attachment } from './plugins/ImageAttachmentPlugin/index.tsx';

const EDITOR_NAMESPACE = 'lexical-editor';

// const defaultInitialState = JSON.stringify({
//   root: {
//     children: [
//       {
//         type: 'paragraph',
//         children: [{ text: '' }],
//       },
//     ],
//   },
// });

// Define the extended editor ref type
interface EditorRefType {
  editor?: LexicalEditor;
  insertText?: (text: string) => void;
}

interface EditorProps {
  placeholder: string;
  disabled: boolean;
  namespace: string;
  editorRef: RefObject<EditorRefType>; // Use the extended type here
  threadId: string;
  setEditorEmpty: (p: boolean) => void;
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  autoFocus?: boolean;
}

const Editor = ({
  threadId,
  editorRef,
  placeholder,
  disabled,
  setEditorEmpty,
  setAttachments,
  autoFocus = false,
}: EditorProps): JSX.Element => {
  const namespace = `${EDITOR_NAMESPACE}_${threadId}`;
  // const content = localStorage.getItem(namespace);

  // const initialEditorState = useCallback((editor: LexicalEditor) => {
  //   editor.update(() => {
  //     const root = $getRoot();
  //     root.clear();
  //   });
  //   // const p = $createParagraphNode();
  //   // p.append($createTextNode("preloaded node"));
  //   // root.append(p);
  // }, []);

  // Create a stable insertText function using useCallback
  const setupInsertText = useCallback((ref: RefObject<EditorRefType>) => {
    if (ref.current) {
      ref.current.insertText = (text: string) => {
        const editor = ref.current?.editor;
        if (editor) {
          editor.update(() => {
            const selection = $getSelection();
            if (selection) {
              const textNode = $createTextNode(text);
              selection.insertNodes([textNode]);
            }
          });
        }
      };
    }
  }, []);

  const $insertNodeInSelection = (selection: BaseSelection | null, textNode: LexicalNode): void => {
    if (selection && $isRangeSelection(selection)) {
      // Insert inline in the current position
      selection.insertNodes([textNode]);
    } else {
      // Insert at the end of the current paragraph
      const root = $getRoot();
      const lastChild = root.getLastChild();

      if (lastChild && $isParagraphNode(lastChild)) {
        // Move selection to the end of the paragraph
        const lastTextNode = lastChild.getLastDescendant();
        if (lastTextNode && $isTextNode(lastTextNode)) {
          lastTextNode.select();
        } else {
          lastChild.select();
        }

        const updatedSelection = $getSelection();
        if ($isRangeSelection(updatedSelection)) {
          updatedSelection.insertNodes([textNode, $createTextNode('')]);
        }
      } else {
        // Fallback: empty editor or no paragraph nodes
        const paragraph = $createParagraphNode();
        paragraph.append(textNode);
        paragraph.append($createTextNode(''));
        root.append(paragraph);
      }
    }
  };

  const insertComponentTargetNode = (details: ComponentTargetDetails): void => {
    const editor = editorRef.current?.editor;
    if (!editor) {
      return;
    }

    editor.update(() => {
      const selection = $getSelection();
      const textNode = $createComponentTargetNode(details);
      $insertNodeInSelection(selection, textNode);
    });
  };

  const insertCodeFileTargetNode = (details: CodeFileTargetDetails): void => {
    const editor = editorRef.current?.editor;
    if (!editor) {
      return;
    }

    editor.update(() => {
      const selection = $getSelection();
      const textNode = $createCodeFileTargetNode(details);
      $insertNodeInSelection(selection, textNode);
    });
  };

  useMessageListener(
    ['https://*.preview.altan.ai', 'https://dashboard.altan.ai', 'https://dev-local.altan.ai:5173'],
    (event) => {
      const data = event.data;
      // console.debug('Received message (roomui):', data);
      if (data.type === 'element_selected' && data.action !== 'show-code') {
        insertComponentTargetNode(data.data);
      } else if (data.type === 'repo_file_selected') {
        if (data.action === 'add-to-chat') {
          insertCodeFileTargetNode(data.data);
        }
      } else if (data.type === 'code_snippet_selected') {
        if (data.action === 'add-to-chat') {
          insertCodeFileTargetNode(data.data);
        }
      }
    },
  );

  // Use the stable function in useEffect
  useEffect(() => {
    setupInsertText(editorRef);
  }, [editorRef, setupInsertText]);

  const initialConfig = useMemo(
    () => ({
      namespace,
      editable: !disabled,
      // editorState: initialEditorState,
      theme: editorTheme,
      nodes: [...PlaygroundNodes],
      onError: (error: Error) => {
        console.error(error);
      },
    }),
    [disabled, namespace],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorPlugins
        threadId={threadId}
        editorRef={editorRef}
        namespace={namespace}
        placeholder={placeholder}
        disabled={disabled}
        setEditorEmpty={setEditorEmpty}
        setAttachments={setAttachments}
        autoFocus={autoFocus}
      />
    </LexicalComposer>
  );
};

export default memo(Editor);
