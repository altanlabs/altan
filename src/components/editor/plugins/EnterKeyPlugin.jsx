import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { KEY_ENTER_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';
import { memo, useEffect } from 'react';

const EnterKeyPlugin = ({ onSendMessage }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        if (event.shiftKey) {
          // Handle SHIFT + ENTER: Insert a new line
          // const selection = $getSelection();
          // if ($isRangeSelection(selection)) {
          //   selection.insertParagraph();
          // }
        } else {
          // Handle ENTER: Send message
          event.preventDefault();
          onSendMessage();
        }
        return true;
      },
      COMMAND_PRIORITY_LOW, // Set command priority here
    );
  }, [editor, onSendMessage]);

  return null;
};

export default memo(EnterKeyPlugin);
