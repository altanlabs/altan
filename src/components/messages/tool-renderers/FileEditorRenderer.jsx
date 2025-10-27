import { Icon } from '@iconify/react';
import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useCallback, useState } from 'react';

import ToolPartError from '../tool-parts/ToolPartError.jsx';
import ToolPartResult from '../tool-parts/ToolPartResult.jsx';

/**
 * Get file icon based on extension
 */
function getFileIcon(filename) {
  if (!filename) return 'mdi:file-outline';

  const ext = filename.split('.').pop()?.toLowerCase();
  const iconMap = {
    js: 'mdi:language-javascript',
    jsx: 'mdi:react',
    ts: 'mdi:language-typescript',
    tsx: 'mdi:react',
    py: 'mdi:language-python',
    json: 'mdi:code-json',
    html: 'mdi:language-html5',
    css: 'mdi:language-css3',
    scss: 'mdi:sass',
    sass: 'mdi:sass',
    md: 'mdi:language-markdown',
    yaml: 'mdi:file-code',
    yml: 'mdi:file-code',
    xml: 'mdi:file-xml-box',
    sql: 'mdi:database',
    sh: 'mdi:bash',
    bash: 'mdi:bash',
    java: 'mdi:language-java',
    c: 'mdi:language-c',
    cpp: 'mdi:language-cpp',
    go: 'mdi:language-go',
    rs: 'mdi:language-rust',
    php: 'mdi:language-php',
    rb: 'mdi:language-ruby',
    swift: 'mdi:language-swift',
    kt: 'mdi:language-kotlin',
    r: 'mdi:language-r',
    vue: 'mdi:vuejs',
    svelte: 'mdi:file-code',
    env: 'mdi:cog',
    git: 'mdi:git',
    docker: 'mdi:docker',
    dockerfile: 'mdi:docker',
  };

  return iconMap[ext] || 'mdi:file-document-outline';
}

/**
 * Get Monaco language from file extension
 */
function getLanguageFromFilename(filename) {
  if (!filename) return 'plaintext';

  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    json: 'json',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    sql: 'sql',
    sh: 'shell',
    bash: 'shell',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    go: 'go',
    rs: 'rust',
    php: 'php',
    rb: 'ruby',
    swift: 'swift',
    kt: 'kotlin',
    r: 'r',
  };

  return languageMap[ext] || 'plaintext';
}

/**
 * Count lines in content
 */
function countLines(content) {
  if (!content) return 0;
  return content.split('\n').length;
}

/**
 * Get action verb based on tool name
 */
function getActionVerb(toolName, isCompleted) {
  const verbMap = {
    edit_file: isCompleted ? 'Edited' : 'Editing',
    create_file: isCompleted ? 'Created' : 'Creating',
    write_file: isCompleted ? 'Wrote' : 'Writing',
    execute_sql: isCompleted ? 'Executed' : 'Executing',
  };
  return verbMap[toolName] || (isCompleted ? 'Modified' : 'Modifying');
}

/**
 * Custom renderer for file editing tools (edit_file, create_file, write_file, execute_sql)
 * Displays file content in a Monaco editor with glassmorphic styling
 */
const FileEditorRenderer = ({ part, onScroll, isExpanded, onToggle }) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showError, setShowError] = useState(false);
  const isCompleted = part?.is_done;
  const isDarkMode = theme.palette.mode === 'dark';

  // Calculate duration
  const duration = useMemo(() => {
    const partCreatedAt = part?.created_at || part?.date_creation;
    if (!isCompleted || !partCreatedAt || !part?.finished_at) return null;
    const start = new Date(partCreatedAt).getTime();
    const end = new Date(part.finished_at).getTime();
    const s = (end - start) / 1000;
    return s < 10 ? s.toFixed(1) : Math.round(s);
  }, [isCompleted, part?.created_at, part?.date_creation, part?.finished_at]);

  // Parse arguments to get file info
  const fileInfo = useMemo(() => {
    if (!part?.arguments) return null;

    try {
      const args = typeof part.arguments === 'string' ? JSON.parse(part.arguments) : part.arguments;

      // For execute_sql, use query.sql as filename to trigger SQL highlighting
      let filename = args.file_name || args.file_path || args.target_file || args.path;
      if (!filename && part?.name === 'execute_sql') {
        filename = 'query.sql';
      } else if (!filename) {
        filename = 'untitled';
      }

      const content =
        args.content || args.code_edit || args.new_string || args.code || args.query || '';
      const oldContent = args.old_string || null;

      return {
        filename,
        content,
        oldContent,
        language: getLanguageFromFilename(filename),
        lineCount: countLines(content),
      };
    } catch {
      // During streaming, JSON might be incomplete - try to extract partial content
      if (typeof part.arguments === 'string') {
        const argsStr = part.arguments;

        // Try to extract filename from partial JSON
        const filenameMatch = argsStr.match(
          /"(?:file_name|file_path|target_file|path)"\s*:\s*"([^"]*)"/,
        );
        let filename = filenameMatch?.[1];
        if (!filename && part?.name === 'execute_sql') {
          filename = 'query.sql';
        } else if (!filename) {
          filename = 'untitled';
        }

        // Try to extract content - look for the content field and capture everything after it
        // We need to handle escaped quotes and newlines in the JSON string
        const contentFieldMatch = argsStr.match(
          /"(?:content|code_edit|new_string|code|query)"\s*:\s*"/,
        );

        if (contentFieldMatch) {
          // Find where the content value starts
          const contentStartIndex = contentFieldMatch.index + contentFieldMatch[0].length;
          const contentSubstring = argsStr.substring(contentStartIndex);

          // Try to find the end of the string value
          // We need to handle escaped characters properly
          let content = '';
          let i = 0;
          let isEscaped = false;

          while (i < contentSubstring.length) {
            const char = contentSubstring[i];

            if (isEscaped) {
              // Handle escape sequences
              switch (char) {
                case 'n':
                  content += '\n';
                  break;
                case 't':
                  content += '\t';
                  break;
                case 'r':
                  content += '\r';
                  break;
                case '\\':
                  content += '\\';
                  break;
                case '"':
                  content += '"';
                  break;
                default:
                  content += char;
              }
              isEscaped = false;
            } else if (char === '\\') {
              isEscaped = true;
            } else if (char === '"') {
              // End of string value (unescaped quote)
              break;
            } else {
              content += char;
            }

            i++;
          }

          return {
            filename,
            content,
            oldContent: null,
            language: getLanguageFromFilename(filename),
            lineCount: countLines(content),
            isPartial: true,
          };
        }
      }

      // If we can't extract anything, return null
      return null;
    }
  }, [part?.arguments, part?.name]);

  // Handle copy to clipboard
  const handleCopy = useCallback(
    (e) => {
      e.stopPropagation(); // Prevent triggering the toggle
      if (fileInfo?.content) {
        navigator.clipboard.writeText(fileInfo.content).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }
    },
    [fileInfo?.content],
  );

  // Handle result click
  const handleResultClick = useCallback((e) => {
    e.stopPropagation();
    setShowResult((v) => !v);
  }, []);

  // Handle error click
  const handleErrorClick = useCallback((e) => {
    e.stopPropagation();
    setShowError((v) => !v);
  }, []);

  // Check if there's a result or error
  const hasResult = !!part?.result;
  const hasError = !!part?.error;

  // Generate compact display text
  const actionVerb = getActionVerb(part?.name, isCompleted);
  const fileIcon = getFileIcon(fileInfo?.filename);

  // Compact file display
  const fileDisplay = useMemo(() => {
    let text = fileInfo?.filename || 'untitled';
    if (fileInfo?.lineCount > 0 && isExpanded) {
      text += ` +${fileInfo.lineCount}`;
    }
    return text;
  }, [fileInfo, isExpanded]);

  // Check if filename is long enough to need fade
  const needsFade = fileDisplay.length > 40;

  // Get status info
  const getStatusInfo = () => {
    if (!isCompleted) {
      return {
        icon: 'svg-spinners:ring-resize',
        text: actionVerb.replace('ing', '...'),
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
      };
    }
    if (hasError) {
      return {
        icon: 'mdi:close-circle',
        text: 'Failed',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
      };
    }
    return {
      icon: 'mdi:check-circle',
      text: actionVerb,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="w-full my-0.5">
      <div className={`group border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-150 ${isExpanded ? 'w-full' : 'inline-flex max-w-full'}`}>
        {/* Compact Header */}
        <button
          onClick={onToggle}
          aria-expanded={isExpanded}
          className={`inline-flex items-center gap-1.5 px-2 py-1 select-none relative min-w-0 ${isExpanded ? 'w-full' : ''}`}
        >
          {/* Expand Icon */}
          <Icon
            icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 text-[11px] flex-shrink-0 transition-all"
          />

          {/* File Type Icon */}
          <Icon
            icon={fileIcon}
            className="text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 text-[11px] flex-shrink-0 transition-colors"
          />

          {/* Status Icon - just the icon when collapsed */}
          {statusInfo && !isExpanded && (
            <Icon
              icon={statusInfo.icon}
              className={`text-[11px] flex-shrink-0 ${statusInfo.color.replace('text-', 'text-').replace('-600', '-500').replace('-400', '-500')}`}
            />
          )}

          {/* Status Badge with text - only when expanded */}
          {statusInfo && isExpanded && (
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
              <Icon icon={statusInfo.icon} className="text-[10px]" />
              <span>{statusInfo.text}</span>
            </div>
          )}

          {/* File Display - with optional fade when collapsed and long */}
          {!isExpanded && (
            <div className="min-w-0 max-w-md overflow-hidden">
              <span
                className="text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 font-mono text-[10px] transition-colors block whitespace-nowrap"
                style={needsFade ? {
                  maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                } : {}}
              >
                {fileDisplay}
              </span>
            </div>
          )}

          {/* File Display - full when expanded */}
          {isExpanded && (
            <span className="text-gray-700 dark:text-gray-300 font-mono text-[10px]">
              {fileDisplay}
            </span>
          )}

          {/* Duration - only when expanded */}
          {isExpanded && duration && parseFloat(duration) > 0 && (
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
              {duration}s
            </span>
          )}

          {/* Spacer when expanded */}
          {isExpanded && <div className="flex-1" />}

          {/* Action buttons - appear on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="flex items-center gap-0.5 px-1.5 py-0.5 flex-shrink-0 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-500 dark:text-gray-400 text-[9px]"
              title="Copy to clipboard"
            >
              <Icon
                icon={copied ? 'mdi:check' : 'mdi:content-copy'}
                className="text-[10px]"
              />
              <span className="font-medium">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {hasResult && (
              <button
                onClick={handleResultClick}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Show output"
              >
                <Icon
                  icon="mdi:information-outline"
                  className="text-blue-500 text-[10px]"
                />
              </button>
            )}

            {hasError && (
              <button
                onClick={handleErrorClick}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Show error"
              >
                <Icon
                  icon="mdi:alert-circle"
                  className="text-red-500 text-[10px]"
                />
              </button>
            )}
          </div>
        </button>

        {/* Monaco Editor - Only show when expanded */}
        {isExpanded && fileInfo?.content && (
          <div className="border-t border-gray-200/60 dark:border-gray-700/60">
            <div className="bg-gray-900 dark:bg-black" onScroll={onScroll}>
              <Editor
                height="300px"
                language={fileInfo.language}
                value={fileInfo.content}
                theme={isDarkMode ? 'vs-dark' : 'light'}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  lineNumbersMinChars: 3,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  fontSize: 12,
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                  automaticLayout: true,
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                    useShadows: false,
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                  overviewRulerBorder: false,
                  hideCursorInOverviewRuler: true,
                  overviewRulerLanes: 0,
                  renderLineHighlight: 'none',
                  contextmenu: false,
                  links: false,
                  folding: true,
                  foldingStrategy: 'indentation',
                  showFoldingControls: 'mouseover',
                  padding: { top: 8, bottom: 8 },
                }}
              />
            </div>
          </div>
        )}

        {/* Error Display - Only show when clicked */}
        {showError && (
          <div className="border-t border-gray-200/60 dark:border-gray-700/60">
            <ToolPartError
              partId={part?.id}
              showError={showError}
            />
          </div>
        )}

        {/* Result Display - Only show when clicked */}
        {showResult && (
          <div className="border-t border-gray-200/60 dark:border-gray-700/60">
            <ToolPartResult
              partId={part?.id}
              showResult={showResult}
            />
          </div>
        )}
      </div>
    </div>
  );
};

FileEditorRenderer.displayName = 'FileEditorRenderer';

export default FileEditorRenderer;
