import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_HIGH, PASTE_COMMAND } from 'lexical';
import { useEffect } from 'react';

import { getBase64FromFile } from '@lib/utils';

export interface Attachment {
  file_content: string;
  file_name: string;
  mime_type: string;
  preview: string;
}

interface ImageAttachmentPluginProps {
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
}

export default function ImageAttachmentPlugin({
  setAttachments,
}: ImageAttachmentPluginProps): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregisterPasteHandler = editor.registerCommand(
      PASTE_COMMAND,
      async (event: ClipboardEvent) => {
        const items = event.clipboardData?.items;
        if (items) {
          const filePromises: Promise<Attachment | null>[] = [];

          for (const item of Array.from(items)) {
            if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
              event.preventDefault(); // Prevent default pasting for images/videos

              const file = item.getAsFile();
              if (file) {
                filePromises.push(
                  getBase64FromFile(file)
                    .then((result: string | ArrayBuffer | null) => {
                      if (typeof result === 'string') {
                        return {
                          file_content: result.split(',')[1],
                          file_name: file.name,
                          mime_type: file.type,
                          preview: URL.createObjectURL(file),
                        };
                      }
                      return null;
                    })
                    .catch((error) => {
                      console.error('Error processing file:', error);
                      return null;
                    }),
                );
              }
            }
          }

          if (filePromises.length > 0) {
            const resolvedAttachments = (await Promise.all(filePromises)).filter(
              (attachment): attachment is Attachment => attachment !== null,
            );

            if (resolvedAttachments.length > 0) {
              setAttachments((prev) => [...prev, ...resolvedAttachments]);
            }
          }
        }

        // Allow default paste behavior for non-image/video content
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );

    return () => {
      unregisterPasteHandler();
    };
  }, [editor, setAttachments]);

  return null;
}
