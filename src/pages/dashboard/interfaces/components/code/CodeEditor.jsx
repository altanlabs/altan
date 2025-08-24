import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';

import BinaryFilePlaceholder from './BinaryFilePlaceholder';
import EditorErrorBoundary from './EditorErrorBoundary';
import { useDebounce } from '../../../../../hooks/useDebounce';
import { selectFileContent, updateFileContent } from '../../../../../redux/slices/codeEditor';
import { dispatch, useSelector } from '../../../../../redux/store';
import { getLanguage, isBinaryFile } from '../../utils/editor';

const CodeEditor = forwardRef(({ interfaceId, filePath, chatIframeRef }, ref) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [selection, setSelection] = useState(null);
  const debouncedSelection = useDebounce(selection, 500);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const initialContentRef = useRef(null);
  const fileContent = useSelector((state) => selectFileContent(state, filePath));
  const [editorKey, setEditorKey] = useState(0);

  useImperativeHandle(ref, () => ({
    getValue: () => editorRef.current?.getValue(),
  }));

  // Reset editor when file changes
  useEffect(() => {
    setEditorKey((prev) => prev + 1);
    initialContentRef.current = fileContent;
    setIsLoading(false);
  }, [filePath]);

  const handleEditorDidMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      try {
        // Configure TypeScript defaults
        if (monaco.languages.typescript) {
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
            noUnusedLocals: false,
            noUnusedParameters: false,
            allowJs: true,
            checkJs: false,
            noImplicitAny: false,
            jsx: monaco.languages.typescript.JsxEmit.React,
            target: monaco.languages.typescript.ScriptTarget.Latest,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            noResolve: true,
            skipLibCheck: true,
            skipDefaultLibCheck: true,
            suppressImplicitAnyIndexErrors: true,
          });

          // Disable specific diagnostic codes for imports and modules
          monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: false,
            noSuggestionDiagnostics: true,
            diagnosticCodesToIgnore: [
              1002, // Unterminated string literal
              1005, // ';' expected
              2307, // Cannot find module
              2304, // Cannot find name
              2339, // Property does not exist
              2305, // Module has no exported member
              2503, // Cannot find namespace
              2322, // Type is not assignable
              6133, // Variable is declared but never used
              7006, // Parameter implicitly has an 'any' type
              7016, // Could not find declaration file for module
              7027, // Unreachable code detected
            ],
          });

          monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: false,
            noSuggestionDiagnostics: true,
            diagnosticCodesToIgnore: [
              1002, 1005, 2307, 2304, 2339, 2305, 2503, 2322, 6133, 7006, 7016, 7027,
            ],
          });
        }

        // Add custom context menu items
        editor.addAction({
          id: 'add-to-chat',
          label: 'Add to Chat',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],
          contextMenuGroupId: 'navigation',
          contextMenuOrder: 1.5,
          run: (ed) => {
            const selection = ed.getSelection();
            const selectedText = ed.getModel().getValueInRange(selection);
            if (selectedText) {
              const data = {
                type: 'code_snippet_selected',
                action: 'add-to-chat',
                data: { file: filePath, code: selectedText, interfaceId },
              };
              
              // Send to chat iframe if it exists
              if (chatIframeRef?.current?.contentWindow) {
                chatIframeRef.current.contentWindow.postMessage(data, '*');
              }
              
              // Also dispatch to the current window for direct React editor
              window.dispatchEvent(new CustomEvent('insertCodeSnippet', {
                detail: { file: filePath, code: selectedText, interfaceId }
              }));
              
              console.log('Add to chat:', { file: filePath, code: selectedText });
            }
          },
        });

        // Add selection change listener for floating menu
        editor.onDidChangeCursorSelection((e) => {
          const selectedText = editor.getModel().getValueInRange(e.selection);
          if (selectedText) {
            const startPosition = editor.getScrolledVisiblePosition(e.selection.getStartPosition());
            const editorDomNode = editor.getDomNode();
            if (editorDomNode) {
              const editorPosition = editorDomNode.getBoundingClientRect();
              setSelection({
                text: selectedText,
                position: {
                  top: editorPosition.top + startPosition.top - 40,
                  left: editorPosition.left + startPosition.left,
                },
              });
            }
          } else {
            setSelection(null);
          }
        });

        // Add edit selection action
        editor.addAction({
          id: 'edit-selection',
          label: 'Edit',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],
          contextMenuGroupId: '1_modification',
          contextMenuOrder: 1,
          run: (ed) => {
            const selection = ed.getSelection();
            const selectedText = ed.getModel().getValueInRange(selection);
            if (selectedText) {
              const data = {
                type: 'code_snippet_selected',
                action: 'edit-selection',
                data: { file: filePath, code: selectedText, interfaceId },
              };
              if (chatIframeRef?.current?.contentWindow) {
                chatIframeRef.current.contentWindow.postMessage(data, '*');
              } else {
                console.debug('invalid room iframe detected');
              }
            }
          },
        });
      } catch (error) {
        console.error('Error in editor setup:', error);
      }
    },
    [chatIframeRef, filePath, interfaceId],
  );

  const handleEditorChange = (value) => {
    if (typeof value === 'string') {
      dispatch(updateFileContent({ path: filePath, content: value }));
    }
  };

  const onAddToChat = useCallback(() => {
    const selectedText = debouncedSelection?.text;
    if (selectedText?.length) {
      const data = {
        type: 'code_snippet_selected',
        action: 'add-to-chat',
        data: { file: filePath, code: selectedText, interfaceId },
      };
      
      // Send to chat iframe if it exists
      if (chatIframeRef?.current?.contentWindow) {
        chatIframeRef.current.contentWindow.postMessage(data, '*');
      }
      
      // Also dispatch to the current window for direct React editor
      window.dispatchEvent(new CustomEvent('insertCodeSnippet', {
        detail: { file: filePath, code: selectedText, interfaceId }
      }));
      
      console.log('Add to chat:', { file: filePath, code: selectedText });
    }
  }, [chatIframeRef, debouncedSelection?.text, filePath, interfaceId]);

  // Check if file is binary before rendering editor
  if (isBinaryFile(filePath)) {
    return <BinaryFilePlaceholder filePath={filePath} />;
  }

  return (
    <EditorErrorBoundary>
      <div className="relative w-full h-full">
        <Editor
          key={editorKey}
          height="100%"
          defaultLanguage={getLanguage(filePath)}
          value={fileContent}
          loading={isLoading}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          theme={theme.palette.mode === 'light' ? 'light' : 'vs-dark'}
          path={filePath}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            readOnly: false,
            automaticLayout: true,
            tabSize: 2,
            contextmenu: true,
            quickSuggestions: true,
            validateOnType: false,
            semanticValidation: false,
            syntaxValidation: false,
            alwaysConsumeMouseWheel: false,
            'typescript.validate.enable': false,
            'javascript.validate.enable': false,
            'typescript.suggest.enabled': false,
            'javascript.suggest.enabled': false,
          }}
        />

        {debouncedSelection && (
          <div
            className="fixed z-50 flex gap-2 bg-[#2d2d2d] rounded shadow-lg border border-[#404040]"
            style={{
              top: `${debouncedSelection.position.top}px`,
              left: `${debouncedSelection.position.left}px`,
            }}
          >
            <button
              className="flex items-center px-3 py-1.5 hover:bg-[#404040] text-gray-300 text-sm"
              onClick={onAddToChat}
            >
              Add to Chat <span className="ml-2 text-xs text-gray-500">⌘K</span>
            </button>
          </div>
        )}
      </div>
    </EditorErrorBoundary>
  );
});

CodeEditor.displayName = 'CodeEditor';

CodeEditor.propTypes = {
  interfaceId: PropTypes.string.isRequired,
  filePath: PropTypes.string.isRequired,
  chatIframeRef: PropTypes.object,
};

export default CodeEditor;
