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
import React, { memo, RefObject, useMemo, useEffect, useCallback } from 'react';
import EditorPlugins from './EditorPlugins';
import { $createCodeFileTargetNode, CodeFileTargetDetails } from './nodes/CodeFileTargetNode';
import { $createComponentTargetNode, ComponentTargetDetails } from './nodes/ComponentTargetNode';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import editorTheme from '../../theme/editorTheme.js';
// import './editor.css';
import type { Attachment } from './plugins/ImageAttachmentPlugin/index';

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

  // Listen for custom insertComponentTarget events with debounce to prevent duplicates
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleInsertComponent = (event: CustomEvent) => {
      const componentDetails = event.detail as ComponentTargetDetails;
      console.log('🎯 TypeScript Editor received custom event:', componentDetails);

      // Clear any existing timeout to debounce rapid events
      clearTimeout(timeoutId);

      // Add a small delay to prevent duplicate insertions
      timeoutId = setTimeout(() => {
        insertComponentTargetNode(componentDetails);
      }, 100);
    };

    window.addEventListener('insertComponentTarget', handleInsertComponent as EventListener);
    return () => {
      window.removeEventListener('insertComponentTarget', handleInsertComponent as EventListener);
      clearTimeout(timeoutId);
    };
  }, [insertComponentTargetNode]);

  // Listen for custom insertCodeSnippet events
  useEffect(() => {
    const handleInsertCodeSnippet = (event: CustomEvent) => {
      const codeDetails = event.detail as CodeFileTargetDetails;
      console.log('📝 TypeScript Editor received code snippet:', codeDetails);
      insertCodeFileTargetNode(codeDetails);
    };

    window.addEventListener('insertCodeSnippet', handleInsertCodeSnippet as EventListener);
    return () =>
      window.removeEventListener('insertCodeSnippet', handleInsertCodeSnippet as EventListener);
  }, [insertCodeFileTargetNode]);

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
        // eslint-disable-next-line no-console
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
