import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { $getRoot, CLEAR_EDITOR_COMMAND } from 'lexical';
import { useEffect, memo, useMemo, useCallback } from 'react';

import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import EnterKeyPlugin from './plugins/EnterKeyPlugin';
import FigmaPlugin from './plugins/FigmaPlugin';
import { LayoutPlugin } from './plugins/LayoutPlugin/LayoutPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import MarkdownPlugin from './plugins/MarkdownShortcutPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import { useWebSocket } from '../../providers/WebSocketProvider';
// import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";

// import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';


// import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import YouTubePlugin from './plugins/YouTubePlugin';
// import EquationsPlugin from './plugins/EquationsPlugin';
// import AutocompletePlugin from './plugins/AutocompletePlugin';

// import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';

// import PollPlugin from './plugins/PollPlugin';
// import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
// import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
// import './editor.css';
import { RootState, useSelector } from '../../redux/store';

import { throttle } from 'lodash-es';
import { Tooltip } from '@mui/material';

const EDITOR_NAMESPACE = 'lexical-editor';

interface PluginProps {
  placeholder: string;
  disabled: boolean;
  namespace: string;
  editorRef: any;
  threadId: string;
  setEditorEmpty: (p: boolean) => void;
}

const sendEventWriting = throttle(
  (ws: WebSocket, roomId: string, threadId: string, memberId: string): void => {
    ws.send(
      JSON.stringify({
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
      }),
    );
  },
  2500,
);

const EditorPlugins = (props: PluginProps): JSX.Element => {
  const [editor] = useLexicalComposerContext();
  const { websocket }: { websocket: WebSocket } = useWebSocket();
  const { room, me } = useSelector((state: RootState) => state.room);

  const onChange = useCallback(
    throttle((editorState: EditorState) => {
      editorState.read(() => {
        const isEmpty = !$getRoot()?.__cachedText?.length;
        props.setEditorEmpty(isEmpty);
        // TODO: send websocket events status writing
        if (websocket !== null && !isEmpty) {
          sendEventWriting(websocket, room.id, props.threadId, me.id);
        }
      });
    }, 1500),
    [props.setEditorEmpty, websocket, props.threadId, room, me],
  );

  const sendMessage = useCallback(() => {
    let content;
    editor._editorState.read(() => {
      content = $convertToMarkdownString(TRANSFORMERS);
    });
    props.editorRef.current.sendContent(content);
    editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
  }, [editor, props.editorRef.current]);

  useEffect(() => {
    if (props.editorRef) {
      props.editorRef.current.sendMessage = sendMessage;
    }
    return () => {
      if (props.editorRef) {
        props.editorRef.current.sendMessage = null;
      }
    };
  }, [props.editorRef]);

  const contentEditable = useMemo(() => {
    const contentEditable = (
      <ContentEditable
        disabled={props.disabled}
        className="swiper-no-swipe"
        style={{
          outline: 'none',
          border: 'none',
          tabSize: 1,
          maxHeight: '300px',
          overflowY: 'auto',
          minHeight: '25px',
          fontFamily: 'Lato, sans-serif',
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
        placeholder={<span className="editor-placeholder">{props.placeholder}</span>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      {/* <LocalStoragePlugin namespace={props.namespace} /> */}
      <ClearEditorPlugin />
      <HistoryPlugin />
      {/* <AutoFocusPlugin /> */}
      {/* <DraggableBlockPlugin /> */}
      {/* <ComponentPickerPlugin /> */}
      <OnChangePlugin onChange={onChange} />
      <MarkdownPlugin />
      <MentionsPlugin />
      {/* <HashtagPlugin /> */}
      <LayoutPlugin />
      {/* <CodeActionMenuPlugin />
      <CodeHighlightPlugin /> */}
      <AutoEmbedPlugin />
      <TabIndentationPlugin />
      <ListPlugin />
      <CheckListPlugin />
      <AutoLinkPlugin />
      <LinkPlugin />
      {/* <PollPlugin /> */}
      <TwitterPlugin />
      <YouTubePlugin />
      <FigmaPlugin />
      <CollapsiblePlugin />
      {/* <AutocompletePlugin /> */}
      <EmojisPlugin />
      {/* <EquationsPlugin /> */}
      <EnterKeyPlugin onSendMessage={sendMessage} />
    </>
  );
};

export default memo(EditorPlugins);
