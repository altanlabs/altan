import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { $getRoot, EditorState, LexicalEditor } from 'lexical';
import { useState } from 'react';

import { 
  autoCompleteJSON,
  autoIndentAndClose
} from './lexical/utils';
import editorTheme from '../../../theme/editorTheme';

// import './lexical/editor.css';


const initialConfig = {
  namespace: 'PythonEditor',
  theme: editorTheme,
  onError: (error: Error) => {
    console.error(error);
  },
};

const PythonEditor = () => {
  const [prevTextContent, setPrevTextContent] = useState<string>('');

  const onChange = (editorState: EditorState, editor: LexicalEditor) => {
    const currTextContent = editorState.read(() => $getRoot().getTextContent() ?? '');

    // autoCompletePythonSnippets(editor);
    autoIndentAndClose(editor, prevTextContent, currTextContent);
    autoCompleteJSON(editor, prevTextContent, currTextContent);

    setPrevTextContent(currTextContent);
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="input-container">
        <RichTextPlugin
          contentEditable={<ContentEditable
            className="editor-input"
            style={{
              outline: 'none',
              // border: 'none', 
              tabSize: 4,
              lineHeight: 'normal',
              maxHeight: '300px',
              overflowY: 'auto',
              width: '100%',
              minHeight: '50px',
              fontFamily: 'Lato, sans-serif'
            }} />}
          placeholder={<div className="editor-placeholder">Start writing...</div>} 
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={onChange} />
        <AutoFocusPlugin />
      </div>
    </LexicalComposer>
  );
};

export default PythonEditor;
