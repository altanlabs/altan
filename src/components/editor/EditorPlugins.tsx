import { useEffect, memo, useMemo, useCallback, RefObject } from 'react';
import { $getRoot, CLEAR_EDITOR_COMMAND, EditorState, LexicalEditor } from 'lexical';

// import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
// import {
//   $isRootTextContentEmpty
// } from '@lexical/text';
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
// import './editor.css';
// import { LocalStoragePlugin } from './plugins/LocalStoragePlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { Tooltip } from '@mui/material';
import { throttle } from 'lodash';

// import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
// import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import EnterKeyPlugin from './plugins/EnterKeyPlugin';
import type { Attachment } from './plugins/ImageAttachmentPlugin';
// import LinkPlugin from './plugins/LinkPlugin';
import ImageAttachmentPlugin from './plugins/ImageAttachmentPlugin';
import { LayoutPlugin } from './plugins/LayoutPlugin/LayoutPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import { useWebSocket } from '../../providers/websocket/WebSocketProvider.jsx';
import { selectMe, selectRoomId } from '../../redux/slices/room';
import { useSelector } from '../../redux/store';

// const EDITOR_NAMESPACE = 'lexical-editor';

// Define the same EditorRefType interface
interface EditorRefType {
  editor?: LexicalEditor;
  insertText?: (text: string) => void;
  sendMessage?: () => void;
  sendContent?: (content: string) => void;
}

interface PluginProps {
  placeholder: string;
  disabled: boolean;
  namespace: string;
  editorRef: RefObject<EditorRefType>; // Update to use EditorRefType
  threadId: string;
  setEditorEmpty: (p: boolean) => void;
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  autoFocus?: boolean;
}

const sendEventWriting = throttle(
  (send: (payload: object) => void, roomId: string, threadId: string, memberId: string): void => {
    const payload = {
      type: 'status',
      data: {
        type: 'writing',
        status: 'active',
        data: {
          member: memberId,
          thread: threadId,
        },
      },
      channels: [`room:${roomId}`],
    };

    send(payload);
  },
  2500,
) as (send: (payload: object) => void, roomId: string, threadId: string, memberId: string) => void;

const EditorPlugins = (props: PluginProps): JSX.Element => {
  const [editor] = useLexicalComposerContext();
  const { sendPayload }: { sendPayload: (payload: object) => void } = useWebSocket();
  const roomId: string = useSelector(selectRoomId);
  const me = useSelector(selectMe);

  const onChange = useMemo(
    () =>
      throttle((editorState: EditorState) => {
        editorState.read(() => {
          const root = $getRoot();
          const isEmpty = !root?.__cachedText?.length;

          props.setEditorEmpty(isEmpty);

          if (sendPayload && !isEmpty && me) {
            sendEventWriting(sendPayload, roomId, props.threadId, me.id);
          }
        });
      }, 1000) as (editorState: EditorState) => void,
    [props.threadId, props.setEditorEmpty, sendPayload, roomId, me],
  );

  const sendMessage = useCallback(() => {
    // let content;
    // editor._editorState.read(() => {
    //   content = $convertToMarkdownString(TRANSFORMERS);
    // });
    // props.editorRef.current.sendContent(content);
    let content: string | undefined;
    editor._editorState.read(() => {
      content = $getRoot().getTextContent();
    });
    if (props.editorRef.current?.sendContent && content) {
      props.editorRef.current.sendContent(content);
    }
    editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
  }, [editor, props.editorRef]);

  useEffect(() => {
    if (props.editorRef?.current) {
      props.editorRef.current.editor = editor; // Store the editor instance
      props.editorRef.current.sendMessage = sendMessage;
    }
    return () => {
      if (props.editorRef?.current) {
        props.editorRef.current.sendMessage = null;
        props.editorRef.current.editor = undefined;
      }
    };
  }, [editor, sendMessage, props.editorRef]);

  const contentEditable = useMemo(() => {
    const contentEditable = (
      <ContentEditable
        disabled={props.disabled}
        className="outline-none border-none max-h-[300px] overflow-y-auto min-h-[25px]"
        style={{
          fontFamily: 'Lato, sans-serif',
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 5,
          opacity: 1
        }}
      />
    );
    return !props.disabled ? (
      contentEditable
    ) : (
      <Tooltip
        arrow
        followCursor
        title="Ask the owner of this room to give you a role with higher privileges."
      >
        <div>{contentEditable}</div>
      </Tooltip>
    );
  }, [props.disabled]);

  return (
    <>
      <RichTextPlugin
        contentEditable={contentEditable}
        placeholder={
          <span className="editor-placeholder pointer-events-none select-none opacity-80 text-gray-600 dark:text-gray-400 absolute top-1 z-0">
            {props.placeholder}
          </span>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      {/* <LocalStoragePlugin namespace={props.namespace} /> */}
      <ClearEditorPlugin />
      <HistoryPlugin />
      <ImageAttachmentPlugin setAttachments={props.setAttachments} />
      {props.autoFocus && <AutoFocusPlugin />}
      {/* <DraggableBlockPlugin /> */}
      {/* <ComponentPickerPlugin /> */}
      <OnChangePlugin onChange={onChange} />
      {/* <MarkdownPlugin /> */}
      <MentionsPlugin />
      {/* <HashtagPlugin /> */}
      <LayoutPlugin />
      {/* <CodeActionMenuPlugin />
      <CodeHighlightPlugin /> */}
      {/* <AutoEmbedPlugin /> */}
      <TabIndentationPlugin />
      {/* <ListPlugin /> */}
      {/* <CheckListPlugin /> */}
      {/* <AutoLinkPlugin />
      <LinkPlugin /> */}
      {/* <PollPlugin /> */}
      {/* <TwitterPlugin />
      <YouTubePlugin />
      <FigmaPlugin /> */}
      <CollapsiblePlugin />
      {/* <AutocompletePlugin /> */}
      {/* <EmojisPlugin /> */}
      {/* <EquationsPlugin /> */}
      <EnterKeyPlugin onSendMessage={sendMessage} />
    </>
  );
};

export default memo(EditorPlugins);
