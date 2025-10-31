import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { ElementNode, $createTextNode } from 'lexical';
import type {
  SerializedElementNode,
  LexicalNode,
  NodeKey,
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
} from 'lexical';

// import { HelperNameNode, $createHelperNameNode } from './HelperNameNode';
// import { HelperArgumentNode, $createHelperArgumentNode } from './HelperArgumentNode';
import { $createDecoratedTextNode } from './DecoratedTextNode';
import { $createEmptyArgNode } from './EmptyArgNode';
import { $createHelperNameNode } from './HelperNameNode';
import { $createSpanNode } from './SpanNode';
import { $createVarNode, VarOption } from './VarNode';
import { METHODS } from '../../flows/menuvars/helpers';

function convertHelperElement(domNode: HTMLSpanElement): DOMConversionOutput | null {
  const helperName = domNode.getAttribute('data-helper-name');
  const helperPrefix = domNode.getAttribute('data-helper-prefix');
  const method = JSON.parse(domNode.getAttribute('data-method') || '{}') as Method;
  if (helperName && helperPrefix && method) {
    const node = new HelperNode(helperName, helperPrefix, method);
    return { node };
  }
  return null;
}

export class HelperOption extends MenuOption {
  name: string;
  prefix: string;
  method: object;

  constructor(name: string, prefix: string, method: object) {
    super(name);
    this.name = name;
    this.prefix = prefix;
    this.method = method;
  }
}

// Define the types for the method's args and kwargs
export type MethodArg = {
  type: string;
  value: string | null;
};

export type MethodKwarg = {
  name: string;
  type: string;
  value: string | null;
};

export type SerializedMethod = {
  name: string;
  description: string | null;
  args: Array<{ type: string; value: string | null }>;
  kwargs: Array<{ name: string; type: string; value: string | null }>;
};

export class Method {
  name: string;
  description: string | null;
  args: MethodArg[];
  kwargs: MethodKwarg[];

  constructor({ name, description, args, kwargs }: SerializedMethod) {
    this.name = name;
    this.description = description;
    this.args = args; //.map(arg => ({ type: arg.type }));
    this.kwargs = kwargs; //.map(kwarg => ({ name: kwarg.name, type: kwarg.type }));
  }

  exportJSON(): SerializedMethod {
    return {
      name: this.name,
      description: this.description,
      args: this.args,
      kwargs: this.kwargs,
    };
  }

  serialize(): string {
    return JSON.stringify(this.exportJSON());
  }
}

// Serialized type for HelperNode
export type SerializedHelperNode = {
  helperName: string;
  helperPrefix: string;
  method: SerializedMethod;
  type: 'helper';
  version: number;
} & SerializedElementNode;

export class HelperNode extends ElementNode {
  __helperName: string;
  __helperPrefix: string;
  __method: Method;

  static getType(): string {
    return 'helper';
  }

  static clone(node: HelperNode): HelperNode {
    return new HelperNode(node.__helperName, node.__helperPrefix, node.__method, node.__key);
  }

  constructor(helperName: string, helperPrefix: string, method: Method, key?: NodeKey) {
    super(key);
    this.__helperName = helperName;
    this.__helperPrefix = helperPrefix;
    this.__method = method;
  }

  static importJSON(serializedNode: SerializedHelperNode): HelperNode {
    const node = $createHelperNode(
      serializedNode.helperName,
      serializedNode.helperPrefix,
      new Method(serializedNode.method),
    );
    node.setFormat(serializedNode.format);
    return node;
  }

  getTextContent(_includeInert?: boolean, _includeDirectionless?: false): string {
    const realTextContent = this.getChildren()
      .map((node) => node.getTextContent())
      .join('');
    return realTextContent !== '' ? `{{${realTextContent}}}` : '';
  }

  exportJSON(): SerializedHelperNode {
    return {
      helperName: this.__helperName,
      helperPrefix: this.__helperPrefix,
      method: this.__method.exportJSON(),
      ...super.exportJSON(),
      type: 'helper',
      version: 1,
    };
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    dom.className = 'helper';
    // dom.style.pointerEvents = 'none';
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  // decorate(): JSX.Element {
  //   return <HelperComponent nodeKey={this.getKey()} />;
  // }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.classList.contains('helper')) {
          return null;
        }
        const helperName = domNode.hasAttribute('data-helper-name');
        const helperPrefix = domNode.hasAttribute('data-helper-prefix');
        const method = domNode.hasAttribute('data-method');
        if (!(helperName && helperPrefix && method)) {
          return null;
        }
        return {
          conversion: convertHelperElement,
          priority: 2,
        };
      },
    };
  }
}

// export function $createHelperNode(helperName: string, helperPrefix: string, method: Method): HelperNode {
//   const helperNode = new HelperNode(helperName, helperPrefix, method);
//   const nodes: any[] = [$createHelperNameNode(method, helperPrefix)];
//   const kwargsLength = method.kwargs?.length || 0;
//   if (method.args?.length) {
//     method.args.forEach((arg, i) => {
//       if (i) {
//         nodes.push($createDecoratedTextNode(', '));
//       }
//       nodes.push($createEmptyArgNode(arg));
//     });
//   }
//   if (kwargsLength) {
//     method.kwargs.forEach((kwarg, i) => {
//       nodes.push($createDecoratedTextNode(`${(method.args?.length || !!i) ? ', ' : ''}${kwarg.name}=`));
//       nodes.push($createEmptyArgNode(kwarg));
//     });
//   }
//   nodes.push($createDecoratedTextNode(')'));
//   nodes.forEach((node) => helperNode.append(node));
//   return helperNode;
// }

const splitArgsAndKwargs = (input: string): string[] => {
  const args: Array<string> = [];
  let currentArg = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (inString) {
      if (char === stringChar) {
        inString = false;
      }
      currentArg += char;
    } else {
      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
        currentArg += char;
      } else if (char === '(') {
        depth++;
        currentArg += char;
      } else if (char === ')') {
        depth--;
        currentArg += char;
      } else if (char === ',' && depth === 0) {
        args.push(currentArg.trim());
        currentArg = '';
      } else {
        currentArg += char;
      }
    }
  }
  if (currentArg.trim() !== '') {
    args.push(currentArg.trim());
  }
  return args;
};

const createHelperOption = (content: string): HelperOption => {
  // Remove the outer braces {{}}
  // const content = helperNodeContent.slice(2, -2);
  // Now content is 'prefix.helperName(argsAndKwargs)'

  // Extract the prefix and the rest
  const [identifier, ...rest] = content.split('(');

  const [prefix, helperName] = identifier.split('.', 2);

  // console.log("@createHelperOption: start:", content);
  // console.log("@createHelperOption: first extraction:", prefix, helperName, rest);

  if (!helperName) {
    throw new Error('Invalid helper node syntax');
  }
  let argsAndKwargsString = rest.join('(');
  if (argsAndKwargsString.slice(-1) === ')') {
    argsAndKwargsString = argsAndKwargsString.slice(0, -1);
  }

  // Access the method definition from METHODS
  const methodDefinition = METHODS[prefix]?.[helperName];
  if (!methodDefinition) {
    throw new Error(`Method ${prefix}.${helperName} not found in METHODS`);
  }
  // console.log("@createHelperOption parsed args", argsAndKwargsString);

  // Parse arguments and keyword arguments
  const argsAndKwargsArray = splitArgsAndKwargs(argsAndKwargsString);

  const args: MethodArg[] = [];
  const kwargs: MethodKwarg[] = [];

  // Get the expected arguments and kwargs from the method definition
  const expectedArgs = methodDefinition.args || [];
  const expectedKwargs = methodDefinition.kwargs || [];

  let argIndex = 0; // Index for expected positional arguments

  argsAndKwargsArray.forEach((item) => {
    const kwargMatch = item.match(/^(\w+)=(.*)$/);
    if (kwargMatch) {
      // It's a keyword argument
      const name = kwargMatch[1];
      const value = kwargMatch[2];

      // Find the expected kwarg
      const expectedKwarg = expectedKwargs.find((kw) => kw.name === name);
      if (!expectedKwarg) {
        throw new Error(`Unknown keyword argument '${name}' for method ${prefix}.${helperName}`);
      }

      kwargs.push({
        name,
        value,
        type: expectedKwarg.type,
      });
    } else {
      // It's a positional argument
      if (argIndex >= expectedArgs.length) {
        throw new Error(`Too many positional arguments for method ${prefix}.${helperName}`);
      }

      const expectedArg = expectedArgs[argIndex];
      args.push({
        value: item,
        type: expectedArg.type,
      });

      argIndex++;
    }
  });

  // Handle missing arguments (optional)
  // You might want to fill in default values or handle missing args here

  const method = new Method({
    name: helperName,
    description: methodDefinition.description,
    args: args,
    kwargs: kwargs,
  });

  return new HelperOption(helperName, prefix, method);
};

const createVarOption = (path: string): VarOption => {
  const value = null;
  const varType = 'any';
  return new VarOption(path, varType, value);
};

// export const parseContent = (text: string): LexicalNode[] => {
//   console.log("@parseContent:", text);
//   const nodes: LexicalNode[] = [];
//   const regex = /({{\w+\.\w+-?\w*\([^{}]*?(?:{{.*?}}[^{}]*?)*\)}})|({{\w+}})|([^{}]+|{|})/g;
//   let lastIndex = 0;
//   let match: RegExpExecArray | null;

//   const leadingTextNode = $createTextNode('');
//   nodes.push(leadingTextNode);

//   while ((match = regex.exec(text)) !== null) {
//     console.log("@parseContent match:", match);

//     const index = match.index;
//     const [fullMatch, helperNodeContent, varNodeContent, textContent] = match;

//     // Text before match
//     if (index > lastIndex) {
//       const textBefore = text.substring(lastIndex, index);
//       const textNode = $createTextNode(textBefore);
//       nodes.push(textNode);
//     }

//     if (helperNodeContent) {
//       // It's a helper node
//       const option = createHelperOption(helperNodeContent);
//       nodes.push(
//         $createHelperNode(option.name, option.prefix, new Method(option.method as SerializedMethod))
//       );
//     } else if (varNodeContent) {
//       // It's a variable node
//       const option = createVarOption(varNodeContent);
//       nodes.push($createVarNode(option));
//     } else if (textContent) {
//       // It's plain text
//       const textNode = $createTextNode(textContent);
//       nodes.push(textNode);
//     }

//     lastIndex = regex.lastIndex;
//   }

//   // Text after last match
//   if (lastIndex < text.length) {
//     const textAfter = text.substring(lastIndex);
//     const textNode = $createTextNode(textAfter);
//     nodes.push(textNode);
//   }
//   const trailingTextNode = $createTextNode('');
//   nodes.push(trailingTextNode);
//   return nodes;
// };

export const parseContent = (text: string): LexicalNode[] => {
  const nodes: LexicalNode[] = [];
  let i = 0;

  while (i < text.length) {
    if (text.startsWith('{{', i)) {
      const result = parseNode(text, i);
      // console.log("result", result);
      const { nodeContent, nodeType, newIndex } = result;

      if (nodeType === 'helper') {
        const option = createHelperOption(nodeContent);
        nodes.push(
          $createHelperNode(
            option.name,
            option.prefix,
            new Method(option.method as SerializedMethod),
          ),
        );
      } else {
        const option = createVarOption(nodeContent);
        nodes.push($createVarNode(option));
      }

      i = newIndex;
    } else {
      const nextIndex = text.indexOf('{{', i);
      const endIndex = nextIndex === -1 ? text.length : nextIndex;
      const textSegment = text.substring(i, endIndex);
      const textNode = $createTextNode(textSegment);
      nodes.push(textNode);
      i = endIndex;
    }
  }

  return nodes;
};

function parseNode(
  text: string,
  startIndex: number,
): { nodeContent: string; nodeType: string; newIndex: number } {
  let i = startIndex + 2; // Skip '{{'
  const stack = ['{{'];

  while (i < text.length && stack.length > 0) {
    if (text.startsWith('{{', i)) {
      stack.push('{{');
      i += 2;
    } else if (text.startsWith('}}', i)) {
      stack.pop();
      i += 2;
    } else {
      i++;
    }
  }

  if (stack.length > 0) {
    throw new Error(`Unmatched braces starting at position ${startIndex}`);
  }

  const nodeContent = text.substring(startIndex, i); // Includes '{{' and '}}'
  const innerContent = nodeContent.slice(2, -2).trim(); // Remove outer braces and trim

  // Determine if it's a helper node or variable node
  const isHelper = /^\w+\.\w+/.test(innerContent);

  const nodeType = isHelper ? 'helper' : 'varnode';

  return {
    nodeContent: innerContent, // Keep the content with '{{ }}'
    nodeType,
    newIndex: i,
  };
}

// export const parseContent = (text: string) => {
//   const nodes: Array<LexicalNode> = [];
//   let i = 0;

//   while (i < text.length) {
//     if (text.startsWith('{{', i)) {
//       const result = parseNode(text, i);
//       const nodeContent = result.node.content;
//       const isHelper = /^\{\{\w+\.\w+/.test(nodeContent);

//       if (isHelper) {
//         const option = createHelperOption(nodeContent);
//         nodes.push(
//           $createHelperNode(option.name, option.prefix, new Method(option.method as SerializedMethod))
//         );
//       } else {
//         const option = createVarOption(nodeContent);
//         nodes.push($createVarNode(option));
//       }

//       i = result.newIndex;
//     } else {
//       const nextIndex = text.indexOf('{{', i);
//       const endIndex = nextIndex === -1 ? text.length : nextIndex;
//       const textNode = $createTextNode(text.substring(i, endIndex));
//       nodes.push(textNode);
//       i = endIndex;
//     }
//   }

//   return nodes;
// };

// function parseNode(text: string, startIndex: number) {
//   let i = startIndex + 2; // Skip '{{'
//   const stack = ['{{'];

//   while (i < text.length && stack.length > 0) {
//     if (text.startsWith('{{', i)) {
//       stack.push('{{');
//       i += 2;
//     } else if (text.startsWith('}}', i)) {
//       stack.pop();
//       i += 2;
//     } else {
//       i++;
//     }
//   }

//   if (stack.length > 0) {
//     throw new Error('Unmatched braces');
//   }

//   const nodeContent = text.substring(startIndex, i);
//   const isHelper = /^\{\{\w+\.\w+/.test(nodeContent);

//   return {
//     node: {
//       type: isHelper ? 'helper' : 'varnode',
//       content: nodeContent,
//     },
//     newIndex: i,
//   };
// }

export function $createHelperNode(
  helperName: string,
  helperPrefix: string,
  method: Method,
): HelperNode {
  const helperNode = new HelperNode(helperName, helperPrefix, method);
  const nodes: any[] = [$createHelperNameNode(method, helperPrefix)];

  let firstArg = true;

  if (method.args?.length) {
    method.args.forEach((arg, i) => {
      if (!firstArg) {
        nodes.push($createDecoratedTextNode(', '));
      }
      firstArg = false;
      if (arg.value && arg.value.trim() !== '') {
        // There's a value in the argument
        const argNodes = parseContent(arg.value);
        const spanNode = $createSpanNode();
        argNodes.forEach((node) => spanNode.append(node));
        nodes.push(spanNode);
      } else {
        // Empty argument
        nodes.push($createEmptyArgNode(arg));
      }
    });
  }

  if (method.kwargs?.length) {
    method.kwargs.forEach((kwarg) => {
      if (!firstArg) {
        nodes.push($createDecoratedTextNode(', '));
      }
      firstArg = false;
      nodes.push($createDecoratedTextNode(`${kwarg.name}=`));
      if (kwarg.value && kwarg.value.trim() !== '') {
        // There's a value in the keyword argument
        const kwargNodes = parseContent(kwarg.value);
        const spanNode = $createSpanNode();
        kwargNodes.forEach((node) => spanNode.append(node));
        nodes.push(spanNode);
      } else {
        // Empty keyword argument
        nodes.push($createEmptyArgNode(kwarg));
      }
    });
  }

  // Add closing parenthesis
  nodes.push($createDecoratedTextNode(')'));

  nodes.forEach((node) => helperNode.append(node));
  return helperNode;
}

export function $isHelperNode(node: LexicalNode | null | undefined): node is HelperNode {
  return node instanceof HelperNode;
}
