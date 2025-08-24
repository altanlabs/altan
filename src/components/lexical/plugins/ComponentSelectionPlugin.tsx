import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createTextNode, $getRoot, $isParagraphNode, $isTextNode, $createParagraphNode } from 'lexical';
import { useEffect } from 'react';

import { $createComponentTargetNode, ComponentTargetDetails } from '../../editor/nodes/ComponentTargetNode';

const ComponentSelectionPlugin = (): null => {
  const [editor] = useLexicalComposerContext();

  const insertComponentTargetNode = (details: ComponentTargetDetails): void => {
    editor.update(() => {
      const selection = $getSelection();
      const componentNode = $createComponentTargetNode(details);
      
      if (selection && $isRangeSelection(selection)) {
        // Insert inline in the current position
        selection.insertNodes([componentNode]);
      } else {
        // Insert at the end of the current paragraph
        const root = $getRoot();
        const lastChild = root.getLastChild();

        if (lastChild && $isParagraphNode(lastChild)) {
          // Move selection to the end of the paragraph
          const lastTextNode = lastChild.getLastDescendant();
          if (lastTextNode && $isTextNode(lastTextNode)) {
            lastTextNode.select();
          } else {
            lastChild.select();
          }

          const updatedSelection = $getSelection();
          if ($isRangeSelection(updatedSelection)) {
            updatedSelection.insertNodes([componentNode, $createTextNode('')]);
          }
        } else {
          // Fallback: empty editor or no paragraph nodes
          const paragraph = $createParagraphNode();
          paragraph.append(componentNode);
          paragraph.append($createTextNode(''));
          root.append(paragraph);
        }
      }
    });
  };

  // Listen for custom insertComponentTarget events
  useEffect(() => {
    const handleInsertComponent = (event: CustomEvent) => {
      const componentDetails = event.detail as ComponentTargetDetails;
      // eslint-disable-next-line no-console
      console.log('🎯 Lexical ComponentSelectionPlugin received custom event:', componentDetails);
      insertComponentTargetNode(componentDetails);
    };
    
    window.addEventListener('insertComponentTarget', handleInsertComponent as EventListener);
    return () => window.removeEventListener('insertComponentTarget', handleInsertComponent as EventListener);
  }, [insertComponentTargetNode]);

  return null;
};

export default ComponentSelectionPlugin;
