import { useCallback, useEffect } from 'react';

interface FileAttachment {
  file_name: string;
  mime_type: string;
  url?: string;
  preview?: string;
}

interface Attachment {
  file_name: string;
  mime_type: string;
  url?: string;
}

interface UseSendOrchestratorProps {
  files: FileAttachment[];
  disabled: boolean;
  isViewer: boolean;
  getAgentMention: () => string | undefined;
  prepareContent: (content: string, agentMention?: string) => string;
  sendMessageContent: (messageContent: { content: string; attachments: Attachment[] }) => Promise<void>;
  clearFiles: () => void;
  clearEditor: () => void;
  clearAgent: () => void;
  getEditorContent: () => string;
  registerSendHandler: (handler: (content: string) => Promise<void>) => void;
}

interface UseSendOrchestratorReturn {
  handleSend: (content: string) => Promise<void>;
  handleSendClick: () => void;
}

export const useSendOrchestrator = ({
  files,
  disabled,
  isViewer,
  getAgentMention,
  prepareContent,
  sendMessageContent,
  clearFiles,
  clearEditor,
  clearAgent,
  getEditorContent,
  registerSendHandler,
}: UseSendOrchestratorProps): UseSendOrchestratorReturn => {
  // Sanitize attachments by removing preview property
  const sanitizeAttachments = useCallback((): Attachment[] => {
    return files.map(({ preview, ...rest }) => rest);
  }, [files]);

  // Main send handler
  const handleSend = useCallback(
    async (content: string): Promise<void> => {
      // Validate
      if (!content?.trim() && files.length === 0) return;
      if (disabled || isViewer) return;

      // Prepare content with agent mention
      const agentMention = getAgentMention();
      const finalContent = prepareContent(content, agentMention);
      const sanitizedAttachments = sanitizeAttachments();

      try {
        // Send message
        await sendMessageContent({
          content: finalContent,
          attachments: sanitizedAttachments,
        });

        // Clear state after successful send
        clearFiles();
        clearEditor();
        clearAgent();
      } catch {
        // Error already handled in sendMessageContent
      }
    },
    [
      files,
      disabled,
      isViewer,
      getAgentMention,
      prepareContent,
      sanitizeAttachments,
      sendMessageContent,
      clearFiles,
      clearEditor,
      clearAgent,
    ],
  );

  // Register send handler for Enter key
  useEffect(() => {
    registerSendHandler(handleSend);
  }, [handleSend, registerSendHandler]);

  // Handle send button click (non-async wrapper for onClick)
  const handleSendClick = useCallback((): void => {
    const content = getEditorContent();
    if (content.trim() || files.length > 0) {
      void handleSend(content);
    }
  }, [getEditorContent, files, handleSend]);

  return {
    handleSend,
    handleSendClick,
  };
};

