import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { Card, CardHeader, Chip, Stack, Tooltip } from '@mui/material';
import { DecoratorNode } from 'lexical';
import type {
  DOMExportOutput,
  NodeKey,
  SerializedLexicalNode,
  LexicalEditor,
  LexicalNode,
  DOMConversionMap,
  EditorConfig,
  DOMConversionOutput,
  Spread,
} from 'lexical';
import { truncate } from 'lodash';
import * as React from 'react';

import {
  selectCurrentExecutionByModule,
  selectModulesOrderPositions,
  makeSelectModule,
  selectModuleInMenu,
} from '../../../redux/slices/flows';
import { useSelector } from '../../../redux/store';
import { ModuleIcon, ModuleName, ModuleType } from '../../flows/schemas/modulePanelSections';
import { getNested } from '../../tools/dynamic/utils';

export type SerializedVarNode = Spread<
  {
    varName: string;
    varPath: string;
    varType: string;
    varValue: any;
    type: 'var';
    version: number;
  },
  SerializedLexicalNode
>;

export class VarOption extends MenuOption {
  path: string;
  type: string;
  value: any;

  constructor(path: string, type: string, value: any) {
    super(path);
    this.path = path;
    this.type = type;
    this.value = value;
  }
}

function convertVarElement(domNode: HTMLSpanElement): DOMConversionOutput | null {
  const varName = domNode.getAttribute('data-var-name');
  const varPath = domNode.getAttribute('data-var-path');
  const varType = domNode.getAttribute('data-var-type');
  const varValue = domNode.getAttribute('data-var-value');
  if (varName && varPath && varType) {
    const node = $createVarNode(new VarOption(varPath, varType, varValue));
    return { node };
  }
  return null;
}

export class VarNode extends DecoratorNode<React.ReactNode> {
  __varName: string;
  __varPath: string;
  __varType: string;
  __varValue: any;

  static getType(): string {
    return 'var';
  }

  static clone(node: VarNode): VarNode {
    return new VarNode(new VarOption(node.__varPath, node.__varType, node.__varValue), node.__key);
  }

  constructor(params: VarOption, key?: NodeKey) {
    super(key);
    this.__varName = params.key;
    this.__varPath = params.path;
    this.__varType = params.type;
    this.__varValue = params.value;
  }

  static importJSON(serializedNode: SerializedVarNode): VarNode {
    const node = $createVarNode(
      new VarOption(serializedNode.varPath, serializedNode.varType, serializedNode.varValue),
    );
    // node.setFormat(serializedNode.format);
    return node;
  }

  getTextContent(_includeInert?: boolean, _includeDirectionless?: false): string {
    return `{{${this.__varPath}}}`;
  }

  exportJSON(): SerializedVarNode {
    return {
      ...super.exportJSON(),
      varName: this.__varName,
      varPath: this.__varPath,
      varType: this.__varType,
      varValue: this.__varValue,
      type: 'var',
      version: 1,
    };
  }

  // createDOM(config: EditorConfig): HTMLElement {
  //   const dom = document.createElement("span");
  //   dom.className = "var";
  //   return dom;
  // }

  // createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
  //   const dom = document.createElement("span");
  //   dom.className = "var";
  //   dom.setAttribute("draggable", "true");

  //   dom.addEventListener("dragstart", (event) => {
  //     event.dataTransfer?.setData("application/lexical-node", this.getKey());
  //   });

  //   dom.addEventListener("dragover", (event) => {
  //     event.preventDefault(); // Necessary to allow dropping
  //   });

  //   dom.addEventListener("drop", (event) => {
  //     event.preventDefault();
  //     const draggedKey = event.dataTransfer?.getData("application/lexical-node");
  //     if (draggedKey) {
  //       editor.update(() => {
  //         const draggedNode = $getNodeByKey(draggedKey);
  //         const targetNode = $getNodeByKey(this.getKey());

  //         if (draggedNode && targetNode) {
  //           // Move the dragged node
  //           targetNode.insertBefore(draggedNode);
  //         }
  //       });
  //     }
  //   });

  //   return dom;
  // }
  // createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
  //   const dom = document.createElement("span");
  //   dom.className = "var";
  //   dom.setAttribute("draggable", "true");

  //   dom.addEventListener("dragstart", (event) => {
  //     event.dataTransfer?.setData("application/lexical-node", this.getKey());
  //     if (event.dataTransfer) {
  //       event.dataTransfer.effectAllowed = "move";
  //     }
  //   });

  //   dom.addEventListener("dragover", (event) => {
  //     event.preventDefault(); // Allow dropping
  //     if (event.dataTransfer) {
  //       event.dataTransfer.dropEffect = "move";
  //     }

  //     // Highlight the target position for better UX
  //     dom.style.border = "1px dashed #000"; // Optional visual feedback
  //   });

  //   dom.addEventListener("dragleave", () => {
  //     // Remove highlight when leaving the target
  //     dom.style.border = "";
  //   });

  //   dom.addEventListener("drop", (event) => {
  //     event.preventDefault();
  //     const draggedKey = event.dataTransfer?.getData("application/lexical-node");

  //     if (draggedKey) {
  //       editor.update(() => {
  //         const draggedNode = $getNodeByKey(draggedKey);
  //         const selection = $getSelection();
  //         $insertNodeAtCollapsedSelection(draggedNode as VarNode, selection);

  //         // if ($isRangeSelection(selection)) {
  //         //   if (selection.isCollapsed()) {
  //         //     // Handle collapsed selection (insertion point)
  //         //     $insertNodeAtCollapsedSelection(draggedNode as VarNode, selection);
  //         //   } else {
  //         //     // Handle non-collapsed selection (text range)
  //         //     $insertNodeAtNonCollapsedSelection(draggedNode as VarNode, selection);
  //         //   }
  //         // }
  //       });
  //     }
  //   });

  //   return dom;
  // }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('span');
    dom.className = 'var';
    dom.setAttribute('draggable', 'true');

    // // Add CSS class for default cursor
    // dom.classList.add("var-node");

    // // Handle the drag start event
    // dom.addEventListener("dragstart", (event) => {
    //   // Store the node's key in the dataTransfer object
    //   event.dataTransfer?.setData("application/lexical-node", this.getKey());
    //   // Indicate that the operation is a move
    //   event.dataTransfer.effectAllowed = "move";
    // });

    // // Handle the drag over event
    // dom.addEventListener("dragover", (event) => {
    //   event.preventDefault(); // Allow dropping
    //   // Set the drop effect to move
    //   event.dataTransfer.dropEffect = "move";

    //   // Add a CSS class to change the cursor and provide visual feedback
    //   dom.classList.add("var-node--drag-over");
    // });

    // // Handle the drag leave event to reset visual feedback
    // dom.addEventListener("dragleave", () => {
    //   dom.classList.remove("var-node--drag-over");
    // });

    // // Handle the drop event
    // dom.addEventListener("drop", (event) => {
    //   event.preventDefault();
    //   // Remove the visual feedback class
    //   dom.classList.remove("var-node--drag-over");

    //   // Retrieve the dragged node's key from the dataTransfer object
    //   const draggedKey = event.dataTransfer?.getData("application/lexical-node");

    //   if (draggedKey) {
    //     editor.update(() => {
    //       const draggedNode = $getNodeByKey(draggedKey);
    //       const selection = $getSelection();

    //       if (draggedNode && selection) {
    //         // Prevent moving a node into itself or its descendants
    //         if (draggedNode.isParentOf(this)) {
    //           console.warn("Cannot move a node into one of its descendants.");
    //           return;
    //         }

    //         // Remove the dragged node from its current position
    //         draggedNode.remove();

    //         // Determine the insertion point based on the selection type
    //         if (selection.type === "range" || selection.type === "text") {
    //           // For range or text selections, insert before the anchor node
    //           const anchorNode = selection.anchor.getNode();
    //           if (anchorNode) {
    //             anchorNode.insertBefore(draggedNode);
    //           }
    //         } else if (selection.type === "node") {
    //           // For node selections, insert before the first selected node
    //           const targetNode = selection.getNodes()[0];
    //           if (targetNode) {
    //             targetNode.insertBefore(draggedNode);
    //           }
    //         } else {
    //           // Fallback: append to the root if selection type is unrecognized
    //           const root = $getRoot();
    //           root.append(draggedNode);
    //         }
    //       }
    //     });
    //   }
    // });

    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute('data-var-name', this.__varName);
    element.setAttribute('data-var-path', this.__varPath);
    element.setAttribute('data-var-type', this.__varType);
    element.setAttribute('data-var-value', this.__varValue);
    return { element };
  }

  decorate(): JSX.Element {
    return (
      <VarComponent
        varName={this.__varName.split('.').slice(-1)[0]}
        varPath={this.__varPath}
        varType={this.__varType}
        varValue={this.__varValue}
      />
    );
  }

  static importDOM(): DOMConversionMap<HTMLSpanElement> | null {
    return {
      span: (domNode: HTMLSpanElement) => {
        if (!domNode.classList.contains('var')) {
          return null;
        }
        const varName = domNode.hasAttribute('data-var-name');
        const varPath = domNode.hasAttribute('data-var-path');
        const varType = domNode.hasAttribute('data-var-type');
        if (!(varName && varPath && varType)) {
          return null;
        }
        return {
          conversion: convertVarElement,
          priority: 2,
        };
      },
    };
  }
}

const VarComponent: React.FC<{
  varName: string;
  varPath: string;
  varType: string;
  varValue: any;
}> = ({ varName, varPath, varType, varValue }) => {
  const moduleInMenu = useSelector(selectModuleInMenu);
  const modulePositionsMapping = useSelector(selectModulesOrderPositions);
  const position = React.useMemo(() => {
    const [positionRaw] = varPath.split('.');
    const positionSliced = positionRaw.slice(1, -1);
    if (positionSliced === '$') {
      return positionSliced;
    }
    return parseInt(positionSliced, 10);
  }, [varPath]);

  const moduleId = React.useMemo(
    () => modulePositionsMapping[position] ?? moduleInMenu?.id,
    [moduleInMenu?.id, modulePositionsMapping, position],
  );

  const currentExecSelector = React.useMemo(
    () => selectCurrentExecutionByModule(moduleId, true),
    [moduleId],
  );
  const currentExec = useSelector(currentExecSelector);
  const moduleSelector = React.useMemo(makeSelectModule, [moduleId]);
  const module = useSelector((state) => moduleSelector(state, moduleId));

  const value = React.useMemo(
    () =>
      (varValue ?? currentExec?.details)
        ? getNested(Object.values(currentExec?.details ?? {})[0]?.global_vars ?? {}, varPath)
        : null,
    [currentExec?.details, varPath, varValue],
  );
  const finalVarType = React.useMemo(() => {
    if ([null, undefined].includes(value)) {
      return varType;
    }
    if (!varType) {
      return typeof value;
    }
    return `${typeof value}. expected ${varType}`;
  }, [value, varType]);

  const strValue = React.useMemo(
    () => (['array', 'object'].includes(typeof value) ? JSON.stringify(value) : value),
    [value],
  );

  return (
    <Tooltip
      enterDelay={900}
      enterNextDelay={900}
      slotProps={{
        tooltip: {
          sx: {
            padding: 0,
            backgroundColor: 'transparent',
          },
        },
      }}
      title={
        <Card
          className="backdrop-blur-lg border border-gray-400/40"
          sx={{
            padding: 0,
            backgroundColor: 'transparent',
          }}
        >
          <CardHeader
            title={
              <Stack width="100%">
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <ModuleIcon
                    module={module}
                    size={35}
                  />

                  <Stack
                    spacing={-1}
                    height="100%"
                  >
                    <ModuleName module={module} />
                    <ModuleType module={module} />
                  </Stack>
                </Stack>
                <span>
                  <b>{`${varPath}`}</b>
                  {` <${finalVarType}>`}
                </span>
              </Stack>
            }
            titleTypographyProps={{
              variant: 'caption',
            }}
            subheader={
              [null, undefined].includes(value)
                ? '<null>'
                : `${truncate(strValue, {
                    length: 60,
                  })} ${strValue.length > 60 ? `+${strValue.length - 60} bytes` : ''}`
            }
            subheaderTypographyProps={{
              variant: 'caption',
            }}
            sx={{
              padding: 1,
            }}
          />
        </Card>
      }
    >
      <Chip
        color="success"
        size="small"
        label={varName}
        icon={
          !!module ? (
            <ModuleIcon
              module={module}
              size={15}
            />
          ) : null
        }
        sx={{ borderRadius: 1 }}
        onDoubleClick={(e) => {
          navigator.clipboard.writeText(strValue || '');
          e.preventDefault(); // Prevent text selection
        }}
      />
    </Tooltip>
  );
};

export function $createVarNode(option: VarOption): VarNode {
  return new VarNode(option);
}

export function $isVarNode(node: LexicalNode | null | undefined): node is VarNode {
  return node instanceof VarNode;
}
