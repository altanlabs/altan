import { LexicalComposer } from '@lexical/react/LexicalComposer';

// import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { $createParagraphNode, $getRoot, LineBreakNode } from 'lexical';
import React, { memo, useRef } from 'react';

import VarsEditorPlugins from './lexical/VarsEditorPlugins';
import editorTheme from '../../../theme/editorTheme';
import { parseContent } from '../../legacy_lexical/nodes/HelperNode';
import PlaygroundNodes from '../../legacy_lexical/nodes/PlaygroundNodes';
// import { METHODS } from '../menuvars/helpers';
// import { getNested } from '../../tools/dynamic/utils';
// import { $createVarNode, VarOption } from '../../lexical/nodes/VarNode';
// import { $createClickableParagraphNode } from '../../lexical/nodes/ClickableParagraphNode';

interface VarsEditorProps {
  value: string;
  onChange?: (value: any) => void;
  maxHeight: number | string;
  disabled: boolean;
}

const VarsEditor: React.FC<VarsEditorProps> = ({
  value = null,
  onChange,
  disabled = false,
  maxHeight = '300px',
}) => {
  const lastTextRef = useRef<string | null>(value);

  // const [prevTextContent, setPrevTextContent] = useState<string>('');

  // const parseContent = (text: string): LexicalNode[] => {
  //   console.log("@parseContent:", text);
  //   const nodes: LexicalNode[] = [];
  //   const regex = /({{\w+\.\w+-?\w*\([^{}]*?(?:{{.*?}}[^{}]*?)*\)}})|({{\w+}})|([^{}]+|{|})/g;
  //   let lastIndex = 0;
  //   let match: RegExpExecArray | null;

  //   const leadingTextNode = $createTextNode('');
  //   nodes.push(leadingTextNode);

  //   while ((match = regex.exec(text)) !== null) {
  //     const index = match.index;
  //     const [fullMatch, innerContent] = match;

  //     // Text before match
  //     if (index > lastIndex) {
  //       const textNode = $createTextNode(text.substring(lastIndex, index));
  //       nodes.push(textNode);
  //     }

  //     // Determine node type
  //     if (isHelperSyntax(innerContent)) {
  //       const option = createHelperOption(innerContent);
  //       nodes.push($createHelperNode(option.name, option.prefix, new Method(option.method as SerializedMethod)));
  //     } else {
  //       const option = createVarOption(innerContent);
  //       nodes.push($createVarNode(option));
  //     }

  //     lastIndex = regex.lastIndex;
  //   }

  //   // Text after last match
  //   if (lastIndex < text.length) {
  //     const textNode = $createTextNode(text.substring(lastIndex));
  //     nodes.push(textNode);
  //   }
  //   const trailingTextNode = $createTextNode('');
  //   nodes.push(trailingTextNode);
  //   return nodes;
  // };

  // const isHelperSyntax = (content: string): boolean => {
  //   return /\(.*\)/.test(content);
  // };

  // const createHelperOption = (content: string): HelperOption => {
  //   const match = content.match(/^(.*?)\((.*)\)$/);
  //   if (!match) {
  //     throw new Error(`Invalid helper syntax: ${content}`);
  //   }
  //   const [, nameWithPrefix, argsString] = match;
  //   const [prefix, name] = nameWithPrefix.split('.');
  //   const methodDetails = METHODS[prefix]?.[name];
  //   if (!methodDetails) {
  //     throw new Error(`Method ${prefix}.${name} not found`);
  //   }
  //   console.log("argsString", argsString);
  //   console.log("methodDetails.args", methodDetails.args);
  //   console.log("methodDetails.kwargs", methodDetails.kwargs);
  //   const methodDict = {
  //     name,
  //     description: methodDetails.description,
  //     args: methodDetails.args,
  //     kwargs: methodDetails.kwargs,
  //   };
  //   // const method = new Method(methodDict);
  //   return new HelperOption(name, prefix, methodDict);
  // };

  const initialEditorState = () => {
    const root = $getRoot();
    root.clear();
    if (value?.length) {
      // const p = $createClickableParagraphNode();
      const p = $createParagraphNode();
      // p.append($createTextNode(value));
      const nodes = parseContent(value);
      // console.log("nodes", nodes);
      p.append(...nodes);
      root.append(p);
    }
  };

  const initialConfig = {
    namespace: 'VarsEditor',
    theme: editorTheme,
    nodes: [LineBreakNode, ...PlaygroundNodes],
    editable: !disabled,
    editorState: initialEditorState,
    onError: (error: Error) => {
      console.error(error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <VarsEditorPlugins
        onChange={onChange}
        valueRef={lastTextRef}
        style={{
          tabSize: 4,
          lineHeight: 'normal',
          maxHeight: maxHeight,
          overflowY: 'auto',
          width: '100%',
          paddingTop: 5,
          paddingBottom: 5,
          paddingLeft: 10,
          paddingRight: 10,
          minWidth: '150px',
          minHeight: '25px',
          fontFamily: 'Inter, Lato, sans-serif',
          border: '1px solid #99999944',
          outline: 'none',
          borderRadius: '.4rem',
        }}
      />
    </LexicalComposer>
  );
};

export default memo(VarsEditor);
