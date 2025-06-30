import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { Tooltip, Popover } from '@mui/material';
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { DecoratorNode } from 'lexical';
import { useCallback, useState, MouseEvent as ReactMouseEvent } from 'react';

import { cn } from '@lib/utils';

import CodeBlock from '../../../components/CodeBlock.jsx';
import Iconify from '../../iconify/Iconify.jsx';

// -----------------------------------------------------------------------------
// Types & Interfaces
// -----------------------------------------------------------------------------

// For a code snippet, details must include `code` (and a file path)
export interface CodeSnippetDetails {
  file: string;
  code: string;
}

// For file/directory, details include the file path, a type and total file count if directory
export interface FileTargetDetails {
  file: string;
  type: 'file' | 'directory';
  total: number;
}

// A discriminated union; if `code` exists then it’s a snippet; otherwise it’s file/directory.
export type CodeFileTargetDetails = Partial<FileTargetDetails> & Partial<CodeSnippetDetails>;

export type SerializedCodeFileTargetNode = Spread<
  {
    details: CodeFileTargetDetails;
    type: 'code-file-target';
    version: number;
  },
  SerializedLexicalNode
>;

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

export const getFileIcon = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const iconMap: Record<string, string> = {
    js: 'logos:javascript',
    jsx: 'logos:react',
    ts: 'logos:typescript-icon',
    tsx: 'logos:typescript-icon',
    css: 'vscode-icons:file-type-css',
    html: 'vscode-icons:file-type-html',
    json: 'vscode-icons:file-type-json',
    md: 'vscode-icons:file-type-markdown',
    gitignore: 'vscode-icons:file-type-git',
    env: 'vscode-icons:file-type-env',
    yml: 'vscode-icons:file-type-yaml',
    yaml: 'vscode-icons:file-type-yaml',
  };
  return iconMap[ext] || 'mdi:file-document-outline';
};

// -----------------------------------------------------------------------------
// DOM Conversion
// -----------------------------------------------------------------------------

function convertCodeFileTargetElement(domNode: HTMLSpanElement): DOMConversionOutput | null {
  const file = domNode.getAttribute('data-cft-file');
  // Optional attributes: code, type, total
  const code = domNode.getAttribute('data-cft-code') || undefined;
  const nodeType = domNode.getAttribute('data-cft-type') || undefined;
  const total = domNode.getAttribute('data-cft-total');

  if (file) {
    const details: CodeFileTargetDetails = {
      file,
      code,
      type: nodeType as 'file' | 'directory' | undefined,
      total: total ? Number(total) : undefined,
    };
    return { node: new CodeFileTargetNode(details) };
  }
  return null;
}

// -----------------------------------------------------------------------------
// Decorator Node: CodeFileTargetNode
// -----------------------------------------------------------------------------

class CodeFileTargetNode extends DecoratorNode<JSX.Element> {
  __details: CodeFileTargetDetails;

  constructor(details: CodeFileTargetDetails, key?: NodeKey) {
    super(key);
    this.__details = details;
  }

  static getType(): string {
    return 'code-file-target';
  }

  isInline(): boolean {
    return true;
  }

  isIsolated(): boolean {
    return false;
  }

  static clone(node: CodeFileTargetNode): CodeFileTargetNode {
    return new CodeFileTargetNode(node.__details, node.__key);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    dom.className = 'code-file-target inline-block';
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    const { file, code, type, total } = this.__details;
    element.setAttribute('data-cft-file', file);
    if (code) {
      element.setAttribute('data-cft-code', code);
    }
    if (type) {
      element.setAttribute('data-cft-type', type);
    }
    if (total !== undefined) {
      element.setAttribute('data-cft-total', total.toString());
    }
    return { element };
  }

  updateDOM(): false {
    return false;
  }

  static importDOM(): DOMConversionMap<HTMLSpanElement> | null {
    return {
      span: (domNode: HTMLSpanElement) => {
        if (!domNode.classList.contains('code-file-target')) {
          return null;
        }
        return {
          conversion: convertCodeFileTargetElement,
          priority: 2,
        };
      },
    };
  }

  static importJSON(serializedNode: SerializedCodeFileTargetNode): CodeFileTargetNode {
    return $createCodeFileTargetNode(serializedNode.details);
  }

  exportJSON(): SerializedCodeFileTargetNode {
    return {
      ...super.exportJSON(),
      details: this.__details,
      type: 'code-file-target',
      version: 1,
    };
  }

  getTextContent(): string {
    const { file, code, type, total } = this.__details;
    if (code && file) {
      const ext = file.split('.').pop()?.toLowerCase() || '';
      return `\n[code_snippet_selected](${file})\n\`\`\`${ext}\n${code}\n\`\`\`\n`;
    }
    // For file/directory nodes, include the file name and additional info
    const typeInfo = type === 'directory' ? ` (dir, ${total} files)` : '';
    return `\n[file_selected](${file}${typeInfo})\n`;
  }

  decorate(editor: LexicalEditor, config: unknown): JSX.Element {
    return (
      <CodeFileTargetRenderer
        nodeKey={this.__key}
        details={this.__details}
      />
    );
  }
}

// -----------------------------------------------------------------------------
// Renderer Component
// -----------------------------------------------------------------------------

interface CodeFileTargetRendererProps {
  nodeKey: NodeKey;
  details: CodeFileTargetDetails;
}

function CodeFileTargetRenderer({ nodeKey, details }: CodeFileTargetRendererProps): JSX.Element {
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  const handleClick = useCallback(
    (event: MouseEvent): void => {
      event.preventDefault();
      event.stopPropagation();
      setSelected(true);
    },
    [setSelected],
  );

  const onContextMenu = useCallback(
    (event: MouseEvent): void => {
      event.preventDefault();
      clearSelection();
    },
    [clearSelection],
  );

  // If the node represents a code snippet, render with an icon button that opens a popover.
  if (details.code) {
    return (
      <CodeSnippetRenderer
        details={details}
        isSelected={isSelected}
        handleClick={handleClick}
        onContextMenu={onContextMenu}
      />
    );
  }

  // Otherwise, it’s a file or directory.
  return (
    <FileTargetRenderer
      details={details}
      isSelected={isSelected}
      handleClick={handleClick}
      onContextMenu={onContextMenu}
    />
  );
}

// Renderer for a code snippet with popover to display code
interface CodeSnippetRendererProps {
  details: CodeFileTargetDetails;
  isSelected: boolean;
  handleClick: (_event: MouseEvent) => void;
  onContextMenu: (_event: MouseEvent) => void;
}

const CodeSnippetRenderer = ({
  details,
  isSelected,
  handleClick,
  onContextMenu,
}: CodeSnippetRendererProps): JSX.Element => {
  const { file, code } = details;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleIconClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const ext = file.split('.').pop()?.toLowerCase() || '';
  const open = Boolean(anchorEl);

  return (
    <span
      className={cn(
        'code-snippet-target inline-flex items-center gap-1 border rounded-full px-2 py-1 cursor-pointer',
        isSelected
          ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-700 dark:border-blue-600'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
      )}
      onClick={handleClick}
      onContextMenu={onContextMenu}
    >
      <Tooltip
        title={`Code Snippet: ${file}`}
        arrow
      >
        <Iconify
          icon="mdi:code-tags"
          width={15}
          onClick={handleIconClick}
          className="cursor-pointer animate-pulse w-fit"
        />
      </Tooltip>
      <span className="truncate text-xs">{file.split('/').pop()}</span>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            className:
              'max-w-[90vw] bg-transparent max-h-[400px] overflow-hidden whitespace-nowrap  ',
          },
        }}
      >
        {/* Assuming CodeBlock supports dark mode styling */}
        <CodeBlock
          language={ext}
          value={code}
          className="flex flex-col max-h-[400px] text-xs leading-relaxed tracking-wide text-gray-900 dark:text-gray-100"
        />
      </Popover>
    </span>
  );
};

// Renderer for a file or directory
interface FileTargetRendererProps {
  details: CodeFileTargetDetails;
  isSelected: boolean;
  handleClick: (_event: MouseEvent) => void;
  onContextMenu: (_event: MouseEvent) => void;
}

const FileTargetRenderer = ({
  details,
  isSelected,
  handleClick,
  onContextMenu,
}: FileTargetRendererProps): JSX.Element => {
  const { file, type, total } = details;
  const isDirectory = type === 'directory';
  const icon = isDirectory ? 'mdi:folder' : getFileIcon(file);

  return (
    <span
      className={cn(
        'file-target inline-flex items-center gap-1 border rounded-full px-2 py-1 cursor-pointer',
        isSelected
          ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-700 dark:border-blue-600'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
      )}
      onClick={handleClick}
      onContextMenu={onContextMenu}
    >
      <Tooltip
        title={isDirectory ? `${file} (Directory, ${total} file${total !== 1 ? 's' : ''})` : file}
        arrow
      >
        <Iconify
          icon={icon}
          width={15}
          className={isDirectory ? 'text-blue-400 dark:text-blue-300' : ''}
        />
      </Tooltip>
      <span className="truncate text-xs">{file.split('/').pop()}</span>
    </span>
  );
};

// -----------------------------------------------------------------------------
// Helper functions for node creation and type checking
// -----------------------------------------------------------------------------

export function $createCodeFileTargetNode(details: CodeFileTargetDetails): CodeFileTargetNode {
  return new CodeFileTargetNode(details);
}

export function $isCodeFileTargetNode(node: unknown): node is CodeFileTargetNode {
  return node instanceof CodeFileTargetNode;
}

export default CodeFileTargetNode;
