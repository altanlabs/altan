import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { $getRoot } from 'lexical';
import { memo } from 'react';

import PlaygroundNodes from './nodes/PlaygroundNodes';
import editorTheme from '../../theme/editorTheme';
// import './editor.css';
import EditorPlugins from './EditorPlugins';


const EDITOR_NAMESPACE = "lexical-editor";


// const defaultInitialState = JSON.stringify({
//   root: {
//     children: [
//       {
//         type: 'paragraph',
//         children: [{ text: '' }],
//       },
//     ],
//   },
// });

const Editor = ({ threadId, editorRef, placeholder, setEditorEmpty, disabled }) => {
  const namespace = `${EDITOR_NAMESPACE}_${threadId}`;
  console.log("rerender editor");
  // const content = localStorage.getItem(namespace);

  const initialEditorState = () => {
    const root = $getRoot();
    root.clear();
    // const p = $createParagraphNode();
    // p.append($createTextNode("preloaded node"));
    // root.append(p);
  }; 

  const initialConfig = {
    namespace,
    editable: !disabled,
    editorState: initialEditorState, 
    theme: editorTheme,
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      console.error(error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorPlugins
        threadId={threadId}
        editorRef={editorRef}
        namespace={namespace}
        placeholder={placeholder}
        disabled={disabled}
        setEditorEmpty={setEditorEmpty}
      />
    </LexicalComposer>
  );
};

export default memo(Editor);

