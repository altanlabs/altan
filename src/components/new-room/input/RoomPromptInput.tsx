import { forwardRef, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { selectCurrentAltaner } from '../../../redux/slices/altaners';
import { selectMe, selectMembers } from '../../../redux/slices/room/selectors/memberSelectors';
import { selectRoomContext } from '../../../redux/slices/room/selectors/roomSelectors';
import { selectTasksByThread } from '../../../redux/slices/tasks';
import { useSelector } from '../../../redux/store';
import { AuthorizationRequests } from '../../authorization-requests';
import Editor from '../../editor/Editor';
import { useSnackbar } from '../../snackbar';
import { InputActions } from './components/InputActions';
import { InputContainer } from './components/InputContainer';
import { useAgentSelection } from './hooks/useAgentSelection';
import { useEditorManager } from './hooks/useEditorManager';
import { useMessageSending } from './hooks/useMessageSending';
import { useSendOrchestrator } from './hooks/useSendOrchestrator';
import { useThreadGeneration } from './hooks/useThreadGeneration';
import { RecordingOverlay } from './RecordingOverlay';
import { useFileHandling } from './useFileHandling';
import { useVoiceRecording } from './useVoiceRecording';
import { ViewerMode } from './ViewerMode';
import { TodoWidget } from '../../todo';


// --- Props Interface ---
interface RoomPromptInputProps {
  threadId: string;
  roomId: string;
  disabled?: boolean;
  placeholder?: string;
  onHeightChange?: (height: number) => void;
  renderCredits?: boolean;
  mode?: 'standard' | 'mobile';
}

export const RoomPromptInput = forwardRef<HTMLTextAreaElement, RoomPromptInputProps>(
  (
    {
      threadId,
      roomId,
      disabled = false,
      placeholder = 'Ask anything...',
      onHeightChange,
      renderCredits = false,
      mode = 'standard',
    }: RoomPromptInputProps,
    _ref,
  ) => {
    // --- Router Hooks ---
    const { altanerId } = useParams();
    const location = useLocation();

    // --- Redux Selectors ---
    const me = useSelector(selectMe);
    const roomContext = useSelector(selectRoomContext);
    const members = useSelector(selectMembers);
    const altaner = useSelector(selectCurrentAltaner);
    const { enqueueSnackbar } = useSnackbar();

    // Detect operate mode
    const operateMode = location.pathname.endsWith('/operate');

    // Get tasks for TodoWidget
    const tasks = useSelector((state) => selectTasksByThread(state, threadId));
    const hasTasks = altanerId && tasks && tasks.length > 0 && !operateMode;

    const isViewer = me?.role === 'viewer' || me?.role === 'listener';

    // --- Custom Hooks ---
    
    // Editor management
    const { editorRef, editorEmpty, setEditorEmpty, getEditorContent, clearEditor, registerSendHandler } =
      useEditorManager();

    // Agent selection
    const { selectedAgent, setSelectedAgent, agents, clearAgent, getAgentMention } =
      useAgentSelection({
        members,
        altanerId,
        altaner,
        operateMode,
      });

    // File handling
    const {
      files,
      dragOver,
      fileInputRef,
      handleFileChange,
      handleRemoveFile,
      handleAttachClick,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      clearFiles,
      addFiles,
    } = useFileHandling(disabled, isViewer);

    // Message sending
    const { sendMessageContent, prepareContent } = useMessageSending({
      threadId,
      roomId,
      roomContext,
      enqueueSnackbar,
    });

    // Thread generation state
    const { hasActiveGeneration, stopGeneration } = useThreadGeneration({
      threadId,
      enqueueSnackbar,
    });

    // Send orchestration
    const { handleSendClick } = useSendOrchestrator({
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
    });

    // Voice recording
    const { isRecording, isTranscribing, startRecording, cancelRecording, acceptRecording } =
      useVoiceRecording({
        threadId,
        roomId,
        selectedAgent,
        onAgentClear: clearAgent,
        enqueueSnackbar,
      });

    const hasValue = !editorEmpty || files.length > 0;
    const containerRef = useRef<HTMLDivElement>(null);

    // Wrap async function for onClick handler
    const handleStartRecording = (): void => {
      void startRecording();
    };

    // --- Effects ---

    // Handle paste events for images
    useEffect(() => {
      const handlePaste = (e: ClipboardEvent): void => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          if (item.type.startsWith('image/')) {
            e.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;

            const reader = new FileReader();
            reader.onloadend = (): void => {
              addFiles([
                {
                  file_name: `pasted-image-${Date.now()}.png`,
                  mime_type: file.type,
                  preview: reader.result as string,
                  url: reader.result as string,
                },
              ]);
            };
            reader.readAsDataURL(file);
          }
        }
      };

      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }, [addFiles]);

    // Track height changes
    useEffect(() => {
      if (!containerRef.current || !onHeightChange) return;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onHeightChange(entry.contentRect.height);
        }
      });

      resizeObserver.observe(containerRef.current);
      onHeightChange(containerRef.current.offsetHeight);

      return () => resizeObserver.disconnect();
    }, [onHeightChange]);

    // --- Viewer Mode ---
    if (isViewer) {
      return <ViewerMode containerRef={containerRef} />;
    }

    // --- Main Input UI ---
    return (
      <>
        {/* Recording overlay */}
        <RecordingOverlay
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          onCancel={cancelRecording}
          onAccept={acceptRecording}
        />

        {/* Components above the input */}
        {!operateMode && (
          <>
            <AuthorizationRequests />
            <TodoWidget
              threadId={threadId}
              mode={mode}
            />
          </>
        )}

        <InputContainer
          containerRef={containerRef}
          hasTasks={hasTasks}
          dragOver={dragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          files={files}
          onRemoveFile={handleRemoveFile}
          renderCredits={renderCredits}
        >
          {/* Editor with @ mention support */}
          <div className="relative w-full px-3 py-3">
            <Editor
              key={`${threadId}`}
              threadId={threadId}
              disabled={disabled || isViewer}
              editorRef={editorRef}
              placeholder={placeholder}
              setEditorEmpty={setEditorEmpty}
              setAttachments={addFiles}
              autoFocus={false}
              namespace={`room-input-${roomId}`}
            />
          </div>

          {/* Input Actions */}
          <InputActions
            onAttachClick={handleAttachClick}
            disabled={disabled}
            agents={agents}
            selectedAgent={selectedAgent}
            onAgentSelect={setSelectedAgent}
            onAgentClear={clearAgent}
            altaner={altaner}
            operateMode={operateMode}
            hasActiveGeneration={hasActiveGeneration}
            hasValue={hasValue}
            onSendClick={handleSendClick}
            onStopGeneration={stopGeneration}
            onStartRecording={handleStartRecording}
          />
        </InputContainer>
      </>
    );
  },
);

RoomPromptInput.displayName = 'RoomPromptInput';
