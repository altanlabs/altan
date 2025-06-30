import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import { memo, useState, useCallback, useRef } from 'react';

import { cn } from '@lib/utils';

const CodeBlock = ({
  language = 'javascript',
  value = '',
  className,
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);

  // Calculate height based on content
  const calculateHeight = useCallback(() => {
    if (!value) return 100;

    const lines = value.split('\n').length;
    const lineHeight = 24; // Approximate line height in pixels
    const padding = 32; // Top and bottom padding
    const minHeight = 100;
    const maxHeight = 600;

    const calculatedHeight = lines * lineHeight + padding;
    return Math.min(Math.max(calculatedHeight, minHeight), maxHeight);
  }, [value]);

  const editorHeight = calculateHeight();

  // Copy handler for the clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [value]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    // Disable all editing capabilities
    editor.updateOptions({
      readOnly: true,
      contextmenu: false,
      quickSuggestions: false,
      parameterHints: { enabled: false },
      suggestOnTriggerCharacters: false,
      acceptSuggestionOnEnter: 'off',
      tabCompletion: 'off',
      wordBasedSuggestions: false,
      hover: { enabled: false },
      links: false,
      colorDecorators: false,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      lineNumbersMinChars: 3,
      folding: false,
      selectOnLineNumbers: false,
      selectionHighlight: false,
      cursorStyle: 'line',
      renderLineHighlight: 'none',
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 6,
      },
    });
  };

  return (
    <div
      className={cn(
        'rounded-xl shadow-md overflow-hidden w-full my-2',
        'text-gray-800 dark:text-gray-300',
        className,
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between bg-gray-200 dark:bg-gray-800 px-4 py-2 text-xs font-sans h-9 select-none w-full"
      >
        <span className="font-medium">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'flex bg-gray-200 dark:bg-gray-900 items-center space-x-1 px-2 py-1',
            'border border-transparent rounded-md',
            'hover:bg-gray-300 dark:hover:bg-gray-700',
            'transition-colors duration-150',
          )}
        >
          <span className="w-4 h-4 inline-block">
            {copied ? '✓' : '📋'}
          </span>
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="bg-white dark:bg-gray-900">
        <Editor
          height={editorHeight}
          language={language}
          value={value}
          theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light'}
          onMount={handleEditorDidMount}
          options={{
            automaticLayout: true,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
            fontSize: 14,
            lineHeight: 1.6,
            padding: { top: 16, bottom: 16 },
          }}
          loading={
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 font-mono text-sm">
              Loading editor...
            </div>
          }
        />
      </div>
    </div>
  );
};

export default memo(CodeBlock);
