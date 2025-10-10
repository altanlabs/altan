import { Icon } from '@iconify/react';
import Editor from '@monaco-editor/react';
import React, { memo, useMemo, useCallback, useState } from 'react';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';
import { cn } from '@lib/utils';

import { getToolIcon } from './toolRendererConfig.js';
import Iconify from '../../iconify/Iconify.jsx';

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
  };
  return verbMap[toolName] || (isCompleted ? 'Modified' : 'Modifying');
}

/**
 * Custom renderer for file editing tools (edit_file, create_file, write_file)
 * Displays file content in a Monaco editor with glassmorphic styling
 */
const FileEditorRenderer = memo(({ part, onScroll, isExpanded, onToggle }) => {
  const [copied, setCopied] = useState(false);
  const isCompleted = part?.is_done;

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
      const filename =
        args.file_name || args.file_path || args.target_file || args.path || 'untitled';
      const content = args.content || args.code_edit || args.new_string || args.code || '';
      const oldContent = args.old_string || null;

      return {
        filename,
        content,
        oldContent,
        language: getLanguageFromFilename(filename),
        lineCount: countLines(content),
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse file arguments:', err);
      return null;
    }
  }, [part?.arguments]);

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

  // Generate header text
  const actionVerb = getActionVerb(part?.name, isCompleted);
  const toolIcon = getToolIcon(part?.name, 'mdi:file-edit');
  const headerText = useMemo(() => {
    let text = actionVerb;
    if (fileInfo?.filename) {
      text += ` ${fileInfo.filename}`;
      if (fileInfo.lineCount > 0) {
        text += ` +${fileInfo.lineCount}`;
      }
    }
    if (duration && parseFloat(duration) > 0) {
      text += ` (${duration}s)`;
    }
    return text;
  }, [actionVerb, fileInfo, duration]);

  return (
    <div className="w-full">
      {/* Unified Header */}
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center gap-1.5 px-1 py-1.5 text-[12px] text-gray-400 dark:text-gray-300 hover:bg-gray-800/20 transition-colors cursor-pointer group"
      >
        <span className="flex items-center gap-1">
          <Iconify
            icon={toolIcon}
            size={8}
          />
          {!isCompleted && (
            <span className="inline-block w-1 h-3 rounded-sm bg-gray-400/70 animate-pulse" />
          )}
        </span>

        {!isCompleted ? (
          <TextShimmer className="inline-block font-medium">{headerText}</TextShimmer>
        ) : (
          <span className="font-medium">{headerText}</span>
        )}

        <div
          className="ml-auto flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-700/30 rounded transition-colors"
            title="Copy to clipboard"
          >
            <Icon
              icon={copied ? 'mdi:check' : 'mdi:content-copy'}
              className={cn('text-sm', copied ? 'text-emerald-400' : 'text-gray-400')}
            />
          </button>

          <Icon
            icon="mdi:chevron-down"
            className={cn(
              'w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-all duration-150',
              isExpanded ? 'rotate-180' : 'rotate-0',
            )}
          />
        </div>
      </button>

      {/* Monaco Editor - Always show when expanded, even during streaming */}
      {isExpanded && (
        <div
          className="bg-gray-900/40 dark:bg-black/40 backdrop-blur-sm border-b border-gray-700/20"
          onScroll={onScroll}
        >
          {fileInfo?.content ? (
            <Editor
              height="300px"
              language={fileInfo.language}
              value={fileInfo.content}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                fontSize: 12,
                fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
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
                padding: { top: 12, bottom: 12 },
              }}
              loading={
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  Loading editor...
                </div>
              }
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-1 h-3 rounded-sm bg-gray-400/70 animate-pulse" />
                <span>Streaming content...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

FileEditorRenderer.displayName = 'FileEditorRenderer';

export default FileEditorRenderer;
