import { Icon } from '@iconify/react';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { Tooltip } from '@mui/material';
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
import { useCallback } from 'react';

import { cn } from '@lib/utils';

interface ScreenPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComponentTargetDetails {
  file: string;
  line: number;
  column: number;
  elementName: string;
  type?: string | undefined;
  screenPosition?: ScreenPosition | undefined;
  rawData?: string | undefined; // JSON string with additional component data
}

export type SerializedComponentTargetNode = Spread<
  {
    details: ComponentTargetDetails;
    type: 'component-target';
    version: number;
  },
  SerializedLexicalNode
>;

function convertComponentTargetElement(domNode: HTMLSpanElement): DOMConversionOutput | null {
  const file = domNode.getAttribute('data-ct-file');
  const line = domNode.getAttribute('data-ct-line');
  const column = domNode.getAttribute('data-ct-column');
  const elementName = domNode.getAttribute('data-ct-elementName');
  const type = domNode.getAttribute('data-ct-type');
  const rawData = domNode.getAttribute('data-ct-rawData');
  const screenPositionX = domNode.getAttribute('data-ct-sp-x');
  const screenPositionY = domNode.getAttribute('data-ct-sp-y');
  const screenPositionWidth = domNode.getAttribute('data-ct-sp-width');
  const screenPositionHeight = domNode.getAttribute('data-ct-sp-height');

  if (
    file &&
    line &&
    column &&
    elementName
    // screenPositionX &&
    // screenPositionY &&
    // screenPositionWidth &&
    // screenPositionHeight
  ) {
    return {
      node: new ComponentTargetNode({
        file,
        line: Number(line),
        column: Number(column),
        elementName,
        type: type || undefined,
        rawData: rawData || undefined,
        screenPosition: !screenPositionX
          ? undefined
          : {
              x: Number(screenPositionX),
              y: Number(screenPositionY),
              width: Number(screenPositionWidth),
              height: Number(screenPositionHeight),
            },
      }),
    };
  }
  return null;
}

interface ComponentTargetRendererProps {
  nodeKey: NodeKey;
  details: ComponentTargetDetails;
}

class ComponentTargetNode extends DecoratorNode<JSX.Element> {
  __details: ComponentTargetDetails;

  constructor(details: ComponentTargetDetails, key?: NodeKey) {
    super(key);
    this.__details = details;
  }

  static getType(): string {
    return 'component-target';
  }

  isIsolated(): boolean {
    return false;
  }

  isInline(): boolean {
    return true;
  }

  static clone(node: ComponentTargetNode): ComponentTargetNode {
    return new ComponentTargetNode(node.__details, node.__key);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    dom.className = 'component-target w-fit h-[20px]';
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    const { file, line, column, elementName, type, screenPosition, rawData } = this.__details;

    element.setAttribute('data-ct-file', file);
    element.setAttribute('data-ct-line', line.toString());
    element.setAttribute('data-ct-column', column.toString());
    element.setAttribute('data-ct-elementName', elementName);
    if (type) element.setAttribute('data-ct-type', type);
    if (rawData) element.setAttribute('data-ct-rawData', rawData);

    if (screenPosition) {
      element.setAttribute('data-ct-sp-x', screenPosition.x.toString());
      element.setAttribute('data-ct-sp-y', screenPosition.y.toString());
      element.setAttribute('data-ct-sp-width', screenPosition.width.toString());
      element.setAttribute('data-ct-sp-height', screenPosition.height.toString());
    }

    return { element };
  }

  updateDOM(): false {
    return false;
  }

  static importDOM(): DOMConversionMap<HTMLSpanElement> | null {
    return {
      span: (domNode: HTMLSpanElement) => {
        if (!domNode.classList.contains('component-target')) {
          return null;
        }
        return {
          conversion: convertComponentTargetElement,
          priority: 2,
        };
      },
    };
  }

  static importJSON(serializedNode: SerializedComponentTargetNode): ComponentTargetNode {
    return $createComponentTargetNode(serializedNode.details);
  }

  exportJSON(): SerializedComponentTargetNode {
    return {
      ...super.exportJSON(),
      details: this.__details,
      type: 'component-target',
      version: 1,
    };
  }

  getTextContent(): string {
    const {
      file,
      line,
      column,
      elementName,
      type,
      rawData,
    } = this.__details;

    // Parse raw data to include rich information
    let parsedData = null;
    try {
      if (rawData) {
        parsedData = JSON.parse(rawData);
      }
    } catch (error) {
      console.warn('Failed to parse rawData in getTextContent:', error);
    }

    const typeInfo = type ? `:${type}` : '';
    const basicInfo = `${elementName}${typeInfo} @ ${file}:${line}:${column}`;

    // Include rich data in the message content, wrapped in <hide> tags
    if (parsedData) {
      const richInfo = [
        `📁 File: ${file}`,
        `📍 Position: Line ${line}, Column ${column}`,
        `🏷️ Element: ${elementName}${type ? ` (${type})` : ''}`,
        `📊 Details:`,
        `  • Line Range: ${parsedData.lineRange || 'N/A'}`,
        `  • Column Range: ${parsedData.columnRange || 'N/A'}`,
        `  • Custom Component: ${parsedData.isCustom ? 'Yes' : 'No'}`,
        parsedData.componentName ? `  • Component Name: ${parsedData.componentName}` : null,
        parsedData.ancestry ? `  • Parent Components: ${parsedData.ancestry.length}` : null,
        parsedData.path ? `  • Current path: ${parsedData.path}` : null,
      ].filter(Boolean).join('\n');

      return `\n[selected_component](${basicInfo})\n\n<hide>\n${richInfo}\n</hide>\n`;
    }

    // Fallback to basic info if no rich data
    return `\n[selected_component](${basicInfo})\n`;
  }

  decorate(_editor: LexicalEditor, _config: unknown): JSX.Element {
    return (
      <ComponentTargetRenderer
        nodeKey={this.__key}
        details={this.__details}
      />
    );
  }
}

function ComponentTargetRenderer({ nodeKey, details }: ComponentTargetRendererProps): JSX.Element {
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  // useEffect(() => {
  //   return mergeRegister();
  //   // Handle additional selection logic if needed later
  // }, [nodeKey]);

  const handleClick = useCallback(
    (event: MouseEvent): void => {
      event.preventDefault(); // Block Lexical default selection behavior
      event.stopPropagation(); // Block Lexical bubbling

      setSelected(true); // Toggle selection
    },
    [setSelected],
  );

  const onContextMenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      clearSelection();
    },
    [clearSelection],
  );

  return (
    <ComponentTarget
      details={details}
      isSelected={isSelected}
      handleClick={handleClick}
      onContextMenu={onContextMenu}
    />
  );
}

interface ComponentTargetProps {
  details: ComponentTargetDetails;
  isSelected: boolean;
  handleClick: (_event: MouseEvent) => void;
  onContextMenu: (_event: MouseEvent) => void;
}

export const ComponentTarget = ({
  details,
  isSelected = false,
  handleClick,
  onContextMenu,
}: ComponentTargetProps): JSX.Element => {
  const { file, line, column, elementName, type, screenPosition, rawData } = details;
  
  // Parse raw data if available
  let parsedData = null;
  try {
    if (rawData) {
      parsedData = JSON.parse(rawData);
    }
  } catch (error) {
    console.warn('Failed to parse rawData:', error);
  }

  return (
    <span
      className={cn(
        'flex flex-row w-fit h-[20px] max-w-[200px] truncate items-center gap-1 px-3 py-1 text-sm font-medium rounded-full cursor-pointer transition-colors border',
        isSelected
          ? 'bg-blue-600 text-white border-blue-700 dark:bg-blue-500 dark:border-blue-600'
          : 'bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
      )}
      onClick={handleClick}
      onContextMenu={onContextMenu}
    >
      <Tooltip
        title={
          <div style={{ padding: '12px', fontSize: '13px', lineHeight: '1.4' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>📁 File:</strong> {file}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>📍 Position:</strong> Line {line}, Column {column}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>🏷️ Element:</strong> {elementName}
            </div>
            {type && (
              <div style={{ marginBottom: '8px' }}>
                <strong>🔧 Type:</strong> {type}
              </div>
            )}
            {parsedData && (
              <>
                <div style={{ borderTop: '1px solid #666', paddingTop: '8px', marginTop: '8px', marginBottom: '8px' }}>
                  <strong>📊 Component Details:</strong>
                </div>
                <div style={{ fontSize: '12px' }}>
                  <div><strong>Line Range:</strong> {parsedData.lineRange || 'N/A'}</div>
                  <div><strong>Column Range:</strong> {parsedData.columnRange || 'N/A'}</div>
                  <div><strong>Custom Component:</strong> {parsedData.isCustom ? 'Yes' : 'No'}</div>
                  {parsedData.componentName && (
                    <div><strong>Component Name:</strong> {parsedData.componentName}</div>
                  )}
                  {parsedData.ancestry && (
                    <div><strong>Ancestry:</strong> {parsedData.ancestry.length} parent(s)</div>
                  )}
                  {parsedData.path && (
                    <div><strong>Path:</strong> {parsedData.path}</div>
                  )}
                </div>
              </>
            )}
            {!!screenPosition && (
              <div style={{ fontSize: '12px', borderTop: '1px solid #666', paddingTop: '8px', marginTop: '8px' }}>
                <strong>🖥️ Screen Position:</strong> ({screenPosition.x}, {screenPosition.y},{' '}
                {screenPosition.width}x{screenPosition.height})
              </div>
            )}
          </div>
        }
        arrow
        placement="top"
        enterDelay={500}
        leaveDelay={200}
      >
        <Icon
          icon="mdi:target"
          className="w-4 h-4 text-current animate-pulse"
        />
      </Tooltip>
      ({elementName}) {file.split('/').slice(-1)[0]} ({line}:{column})
    </span>
  );
};

export function $createComponentTargetNode(details: ComponentTargetDetails): ComponentTargetNode {
  return new ComponentTargetNode(details);
}

export function $isComponentTargetNode(node: unknown): node is ComponentTargetNode {
  return node instanceof ComponentTargetNode;
}

export default ComponentTargetNode;
