import type { LexicalEditor } from 'lexical';
import React, { useCallback, useRef, useState } from 'react';

interface EditorRefType {
  editor?: LexicalEditor;
  insertText?: (text: string) => void;
  clear?: () => void;
  sendContent?: (content: string) => void;
  sendMessage?: () => void;
}

interface UseEditorManagerReturn {
  editorRef: React.RefObject<EditorRefType>;
  editorEmpty: boolean;
  setEditorEmpty: (empty: boolean) => void;
  getEditorContent: () => string;
  clearEditor: () => void;
  registerSendHandler: (handler: (content: string) => Promise<void>) => void;
}

export const useEditorManager = (): UseEditorManagerReturn => {
  const editorRef = useRef<EditorRefType>({});
  const [editorEmpty, setEditorEmpty] = useState(true);

  // Get content from editor
  const getEditorContent = useCallback((): string => {
    if (!editorRef.current?.editor) return '';

    let content = '';
    editorRef.current.editor.getEditorState().read(() => {
      content = editorRef.current.editor?._editorState._nodeMap.get('root')?.getTextContent() || '';
    });
    return content;
  }, []);

  // Clear editor
  const clearEditor = useCallback(() => {
    editorRef.current?.clear?.();
  }, []);

  // Register send handler for Enter key
  const registerSendHandler = useCallback(
    (handler: (content: string) => Promise<void>) => {
      if (editorRef.current) {
        editorRef.current.sendContent = handler;
      }
    },
    [],
  );

  return {
    editorRef,
    editorEmpty,
    setEditorEmpty,
    getEditorContent,
    clearEditor,
    registerSendHandler,
  };
};

