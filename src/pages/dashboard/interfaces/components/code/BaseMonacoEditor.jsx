import { Editor, DiffEditor } from '@monaco-editor/react';
import React, { useRef, forwardRef, useImperativeHandle } from 'react';

const BaseMonacoEditor = forwardRef(
  (
    {
      editorType = 'normal', // 'normal' or 'diff'
      originalValue = '', // used for diff
      modifiedValue = '', // used for diff
      fileValue = '', // used for normal editor
      filePath,
      readOnly = false,
      language,
      onContentChange,
      onMountEditor,
      ...rest
    },
    ref,
  ) => {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        if (editorRef.current) {
          if (editorType === 'diff') {
            // In a DiffEditor, `.getModifiedEditor()` retrieves the right side
            return editorRef.current.getModifiedEditor().getValue();
          }
          return editorRef.current.getValue();
        }
        return '';
      },
    }));

    function handleEditorDidMount(editor, monaco) {
      editorRef.current = editor;
      monacoRef.current = monaco;
      onMountEditor?.(editor, monaco);
    }

    function handleChange(value) {
      if (editorType === 'normal') {
        onContentChange?.(value);
      } else {
        // For a diff editor, the `onChange` prop triggers with
        // an array [originalValue, modifiedValue].
        // But we only care about the new modified content.
        if (Array.isArray(value) && value.length > 1) {
          onContentChange?.(value[1]);
        }
      }
    }

    if (editorType === 'diff') {
      return (
        <DiffEditor
          onMount={handleEditorDidMount}
          original={originalValue}
          modified={modifiedValue}
          onChange={handleChange}
          language={language}
          options={{
            readOnly,
            renderSideBySide: false, // inline diff
            minimap: { enabled: true },
            automaticLayout: true,
            contextmenu: true,
          }}
          theme="vs-dark"
          {...rest}
        />
      );
    }

    return (
      <Editor
        onMount={handleEditorDidMount}
        value={fileValue}
        onChange={handleChange}
        language={language}
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
          tabSize: 2,
          contextmenu: true,
          alwaysConsumeMouseWheel: false,
        }}
        theme="vs-dark"
        {...rest}
      />
    );
  },
);

BaseMonacoEditor.displayName = 'BaseMonacoEditor';

export default BaseMonacoEditor;
