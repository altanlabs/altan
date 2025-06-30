import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { debounce } from 'lodash';
import { useCallback, useEffect } from 'react';

type LocalStoragePluginProps = {
  namespace: string;
};

export function LocalStoragePlugin({ namespace }: LocalStoragePluginProps): null {
  const [editor] = useLexicalComposerContext();

  const saveContent = useCallback(
    (content: string) => {
      localStorage.setItem(namespace, content);
    },
    [namespace],
  );

  const debouncedSaveContent = debounce(saveContent, 1000);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      // Don't update if nothing changed
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;

      const serializedState = JSON.stringify(editorState);
      debouncedSaveContent(serializedState);
    });
  }, [debouncedSaveContent, editor]);

  return null;
}
