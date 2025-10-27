import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import { memo, useState, useCallback, useRef, useMemo } from 'react';

import { cn } from '@lib/utils';

const CodeBlock = ({
  language = 'javascript',
  value = '',
  className,
  defaultExpanded = false,
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const editorRef = useRef(null);

  // Get code statistics
  const codeStats = useMemo(() => {
    const lines = value.split('\n');
    const lineCount = lines.length;
    const charCount = value.length;
    const preview = lines[0]?.trim() || '';
    const truncatedPreview = preview.length > 60 ? `${preview.slice(0, 60)}...` : preview;

    return { lineCount, charCount, preview: truncatedPreview };
  }, [value]);

  // Calculate height based on content
  const calculateHeight = useCallback(() => {
    if (!value) return 100;

    const lines = value.split('\n').length;
    const lineHeight = 20;
    const padding = 16;
    const minHeight = 80;
    const maxHeight = 500;

    const calculatedHeight = lines * lineHeight + padding;
    return Math.min(Math.max(calculatedHeight, minHeight), maxHeight);
  }, [value]);

  const editorHeight = calculateHeight();

  // Copy handler
  const handleCopy = useCallback(async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy code:', err);
    }
  }, [value]);

  // Toggle expand/collapse
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

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
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      },
    });
  };

  const languageColors = {
    javascript: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    typescript: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    python: 'bg-green-500/10 text-green-700 dark:text-green-400',
    java: 'bg-red-500/10 text-red-700 dark:text-red-400',
    css: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    html: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    json: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    default: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  };

  const langColor = languageColors[language] || languageColors.default;

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-full my-1.5',
        'transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600',
        'bg-white dark:bg-gray-900',
        className,
      )}
    >
      {/* Compact Header - Clickable to expand/collapse */}
      <button
        type="button"
        onClick={toggleExpand}
        className={cn(
          'w-full flex items-center justify-between px-3 py-1.5 text-xs',
          'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800',
          'transition-colors duration-150 select-none',
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Expand/Collapse Icon */}
          <svg
            className={cn(
              'w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-200 flex-shrink-0',
              isExpanded && 'rotate-90',
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          {/* Language Badge */}
          <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide flex-shrink-0', langColor)}>
            {language}
          </span>

          {/* Line Count */}
          <span className="text-gray-500 dark:text-gray-400 text-[10px] flex-shrink-0">
            {codeStats.lineCount} {codeStats.lineCount === 1 ? 'line' : 'lines'}
          </span>

          {/* Preview when collapsed */}
          {!isExpanded && codeStats.preview && (
            <span className="text-gray-600 dark:text-gray-300 font-mono text-[10px] truncate">
              {codeStats.preview}
            </span>
          )}
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1 px-2 py-0.5 ml-2 flex-shrink-0',
            'rounded border border-gray-300 dark:border-gray-600',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'transition-colors duration-150',
            copied && 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600',
          )}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-600 dark:text-green-400 text-[10px] font-medium">Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-medium">Copy</span>
            </>
          )}
        </button>
      </button>

      {/* Expandable Editor Section */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="border-t border-gray-200 dark:border-gray-700">
          <Editor
            height={editorHeight}
            language={language}
            value={value}
            theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light'}
            onMount={handleEditorDidMount}
            options={{
              automaticLayout: true,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
              fontSize: 11,
              lineHeight: 1.5,
              padding: { top: 4, bottom: 4 },
            }}
            loading={
              <div className="p-3 text-center text-gray-500 dark:text-gray-400 font-mono text-xs">
                Loading...
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default memo(CodeBlock);
