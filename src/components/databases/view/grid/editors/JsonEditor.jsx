import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import React, { useEffect, useRef, forwardRef, useCallback } from 'react';

export default forwardRef((props, ref) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const editorTheme = isDarkMode ? 'vs-dark' : 'light';

  // Theme-aware colors
  const containerBg = isDarkMode ? theme.palette.grey[800] : theme.palette.background.paper;
  const borderColor = theme.palette.divider;
  const textColor = theme.palette.text.primary;
  const secondaryTextColor = theme.palette.text.secondary;
  const editorRef = useRef(null);
  const [isValidJson, setIsValidJson] = React.useState(true);
  const value = props.value
    ? typeof props.value === 'string'
      ? props.value
      : JSON.stringify(props.value, null, 2)
    : '';

  console.log('JsonEditor render:', { props });

  const saveChanges = () => {
    try {
      if (!editorRef.current) return;

      const jsonValue = JSON.parse(editorRef.current.getValue());
      const stringifiedValue = JSON.stringify(jsonValue);

      console.log('Saving JSON value:', stringifiedValue);

      props.onValueChange(stringifiedValue);
      props.stopEditing();
    } catch (error) {
      console.error('Error saving JSON:', error);
      return false;
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.focus();

    // Move cursor to end
    const model = editor.getModel();
    const lastLineNumber = model.getLineCount();
    const lastColumn = model.getLineMaxColumn(lastLineNumber);
    editor.setPosition({ lineNumber: lastLineNumber, column: lastColumn });

    // Override the default Enter key behavior
    // This prevents AG-Grid from receiving the Enter key event
    editor.addCommand(window.monaco.KeyMod.chord(window.monaco.KeyCode.Enter), () => {
      // Let Monaco handle the Enter key naturally (insert new line)
      editor.trigger('keyboard', 'type', { text: '\n' });
    });

    // Also handle Shift+Enter for inserting new lines
    editor.addCommand(
      window.monaco.KeyMod.chord(window.monaco.KeyMod.Shift | window.monaco.KeyCode.Enter),
      () => {
        editor.trigger('keyboard', 'type', { text: '\n' });
      },
    );

    // Handle Escape key to close the editor
    editor.addCommand(window.monaco.KeyMod.chord(window.monaco.KeyCode.Escape), () => {
      props.stopEditing();
    });

    // Handle Ctrl+S / Cmd+S to save
    editor.addCommand(
      window.monaco.KeyMod.chord(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS),
      () => {
        saveChanges();
      },
    );
  };

  // Handle keydown events on the container to catch any events that bubble up
  const handleContainerKeyDown = useCallback(
    (event) => {
      // Stop propagation of Enter key events to prevent AG-Grid from receiving them
      if (event.key === 'Enter') {
        event.stopPropagation();
        event.stopImmediatePropagation();
      }

      // Also handle Escape at the container level as backup
      if (event.key === 'Escape') {
        event.stopPropagation();
        props.stopEditing();
      }
    },
    [props],
  );

  // Add event listener for keydown on the container
  useEffect(() => {
    if (editorRef.current) {
      const domNode = editorRef.current.getContainerDomNode();
      if (domNode) {
        // Use capture phase to intercept events before they reach AG-Grid
        domNode.addEventListener('keydown', handleContainerKeyDown, true);
        return () => {
          domNode.removeEventListener('keydown', handleContainerKeyDown, true);
        };
      }
    }
  }, [handleContainerKeyDown]);

  const getValue = () => {
    try {
      if (!editorRef.current) return null;
      const jsonValue = JSON.parse(editorRef.current.getValue());
      return JSON.stringify(jsonValue);
    } catch (error) {
      console.error('Invalid JSON:', error);
      return null;
    }
  };

  React.useImperativeHandle(ref, () => ({
    getValue,
    isPopup: () => true,
    isCancelBeforeStart: () => false,
    isCancelAfterEnd: () => false,
    afterGuiAttached: () => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    },
  }));

  return (
    <div
      className="p-2 shadow-lg border rounded-md"
      style={{
        width: '500px',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: containerBg,
        borderColor: borderColor,
        color: textColor,
      }}
      onKeyDown={handleContainerKeyDown}
    >
      <div className="flex justify-between mb-2">
        <div
          className="text-sm"
          style={{ color: secondaryTextColor }}
        >
          Press Escape to cancel, Enter for new line, Ctrl+S to save
        </div>
        <button
          onClick={saveChanges}
          disabled={!isValidJson}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            isValidJson
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : isDarkMode
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save
        </button>
      </div>
      <Editor
        height="300px"
        width="100%"
        defaultLanguage="json"
        defaultValue={value}
        theme={editorTheme}
        options={{
          minimap: { enabled: false },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          formatOnPaste: true,
          folding: true,
          wordWrap: 'on',
          acceptSuggestionOnEnter: 'off', // Prevent suggestions from interfering with Enter
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          // Additional dark mode optimizations
          renderLineHighlight: 'line',
          fontSize: 13,
          fontFamily: theme.typography.fontFamily,
          cursorBlinking: 'smooth',
          renderWhitespace: 'boundary',
        }}
        onChange={(newValue) => {
          try {
            if (newValue) {
              JSON.parse(newValue);
              setIsValidJson(true);
              console.log('Valid JSON entered');
            } else {
              setIsValidJson(false);
            }
          } catch (error) {
            setIsValidJson(false);
            console.log('Invalid JSON entered');
          }
        }}
        onMount={handleEditorDidMount}
        beforeMount={(monaco) => {
          // This makes the monaco variable available globally
          window.monaco = monaco;
        }}
      />
    </div>
  );
});
