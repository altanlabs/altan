import { forwardRef, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { BuildModeToggle } from './BuildModeToggle';
import { FilePreview } from './FilePreview';
import { SendIcon, PlusIcon, MicIcon } from './icons';
import { RecordingOverlay } from './RecordingOverlay';
import { useFileHandling } from './useFileHandling';
import { useVoiceRecording } from './useVoiceRecording';
import { ViewerMode } from './ViewerMode';
import { selectCurrentAltaner } from '../../../redux/slices/altaners';
import {
  sendMessage,
  selectMe,
  selectRoomContext,
  addThread,
  setThreadMain,
  selectMembers,
  selectActiveResponsesByThread,
  selectActiveActivationsByThread,
  stopThreadGeneration,
} from '../../../redux/slices/room';
import { selectTasksByThread } from '../../../redux/slices/tasks';
import { dispatch, useSelector } from '../../../redux/store';
import { optimai_room } from '../../../utils/axios';
import AgentSelectionChip from '../../attachment/components/AgentSelectionChip.jsx';
import AuthorizationRequests from '../../AuthorizationRequests.jsx';
import CreditWallet from '../../CreditWallet.jsx';
import Editor from '../../editor/Editor';
import ActivationLifecycleBar from '../../response/ActivationLifecycleBar.jsx';
import { getMemberDetails } from '../../room/utils.js';
import { useSnackbar } from '../../snackbar';
import TodoWidget from '../../TodoWidget.jsx';

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
    // --- Hooks ---
    const { altanerId } = useParams();
    const location = useLocation();

    // --- State ---
    const editorRef = useRef<any>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const [editorEmpty, setEditorEmpty] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);

    // --- Redux ---
    const me = useSelector(selectMe);
    const roomContext = useSelector(selectRoomContext);
    const members = useSelector(selectMembers);
    const altaner = useSelector(selectCurrentAltaner);
    const { enqueueSnackbar } = useSnackbar();

    // Detect operate mode
    const operateMode = location.pathname.endsWith('/operate');

    // Get agents from room members, filtered by altaner's agent list in operate mode only
    const agents = useMemo(() => {
      // Get all agent members from the room
      const allAgentMembers = Object.values(members.byId || {})
        .filter((member: any) => member?.member?.member_type === 'agent');
      
      const allAgents = allAgentMembers.map((member: any) => getMemberDetails(member));

      // Only filter by altaner's agents when in OPERATE mode
      if (operateMode && altanerId && altaner) {
        const agentsComponent = altaner.components?.items?.find((c: any) => c.type === 'agents');
        const altanerAgentIds = agentsComponent?.params?.ids || [];
        
        if (altanerAgentIds.length > 0) {
          // Filter by comparing altaner agent IDs with the actual agent.id (not room member id)
          return allAgentMembers
            .filter((member: any) => {
              const agentId = member.member?.agent?.id || member.member?.agent_id;
              return altanerAgentIds.includes(agentId);
            })
            .map((member: any) => getMemberDetails(member));
        }
      }

      return allAgents;
    }, [members.byId, altanerId, altaner, operateMode]);

    // Get tasks for TodoWidget
    const tasksSelector = useMemo(() => selectTasksByThread(threadId), [threadId]);
    const tasks = useSelector(tasksSelector);
    const hasTasks = altanerId && tasks && tasks.length > 0 && !operateMode;

    const isViewer = me?.role === 'viewer' || me?.role === 'listener';

    // --- File Handling (extracted hook) ---
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

    // --- Voice Recording (extracted hook) ---
    const { isRecording, isTranscribing, startRecording, cancelRecording, acceptRecording } =
      useVoiceRecording({
        threadId,
        roomId,
        selectedAgent,
        onAgentClear: () => setSelectedAgent(null),
        enqueueSnackbar,
      });

    // Check for active agent generation
    const EMPTY_ARRAY: any[] = [];
    const selectActiveResponsesStable = useMemo(
      () => (threadId && threadId !== 'new' ? selectActiveResponsesByThread(threadId) : () => EMPTY_ARRAY),
      [threadId],
    );
    const selectActiveActivationsStable = useMemo(
      () => (threadId && threadId !== 'new' ? selectActiveActivationsByThread(threadId) : () => EMPTY_ARRAY),
      [threadId],
    );
    const activeResponses = useSelector(selectActiveResponsesStable);
    const activeActivations = useSelector(selectActiveActivationsStable);
    const hasActiveGeneration =
      (activeResponses && activeResponses.length > 0) ||
      (activeActivations && activeActivations.length > 0);

    const hasValue = !editorEmpty || files.length > 0;

    // Handle paste events for images
    useEffect(() => {
      const handlePaste = (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          // Check if the item is an image
          if (item.type.startsWith('image/')) {
            e.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;

            // Convert to FileAttachment format
            const reader = new FileReader();
            reader.onloadend = () => {
              const newFile: FileAttachment = {
                file_name: `pasted-image-${Date.now()}.png`,
                mime_type: file.type,
                preview: reader.result as string,
                url: reader.result as string,
              };
              setFiles((prev) => [...prev, newFile]);
            };
            reader.readAsDataURL(file);
          }
        }
      };

      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }, []);

    // --- Track height changes ---
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

    // --- Handlers ---
    const handleSendContent = useCallback(
      async (content: string) => {
        if (!content?.trim() && files.length === 0) return;
        if (disabled || isViewer) return;

        let finalContent = content.trim();

        // Prepend agent mention if selected
        if (selectedAgent) {
          const mentionText = `**[@${selectedAgent.name}](/member/${selectedAgent.id})**`;
          finalContent = mentionText + (finalContent ? '\n' + finalContent : '');
          setSelectedAgent(null);
        }

        // Append room context if available
        if (roomContext) {
          finalContent += `\n<hide>${roomContext}</hide>`;
        }

        // Clean attachments (remove preview property)
        const sanitizedAttachments = files.map(({ preview, ...rest }) => rest);

        // If threadId is 'new', we need to create the thread first
        if (threadId === 'new') {
          try {
            const threadName = finalContent.substring(0, 50).trim() || 'New Chat';
            const response = await optimai_room.post(`/v2/rooms/${roomId}/threads`, {
              name: threadName,
            });
            const newThread = response.data;

            dispatch(addThread(newThread));
            dispatch(setThreadMain({ current: newThread.id }));

            await dispatch(
              sendMessage({
                threadId: newThread.id,
                content: finalContent,
                attachments: sanitizedAttachments,
              }),
            );
          } catch (e: any) {
            enqueueSnackbar(e.message || 'Failed to create thread', { variant: 'error' });
          }
        } else {
          dispatch(
            sendMessage({
              threadId,
              content: finalContent,
              attachments: sanitizedAttachments,
            }),
          ).catch((e: Error) => {
            enqueueSnackbar(e.message || 'Failed to send message', { variant: 'error' });
          });
        }

        // Clear files (editor clears itself)
        clearFiles();
      },
      [
        files,
        threadId,
        roomId,
        disabled,
        isViewer,
        selectedAgent,
        roomContext,
        clearFiles,
        enqueueSnackbar,
      ],
    );

    // Setup editor ref - the Editor will call sendContent when Enter is pressed
    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.sendContent = handleSendContent;
      }
    }, [handleSendContent]);

    // Send button handler - reads content from editor and sends
    const handleSendClick = useCallback(() => {
      if (editorRef.current?.editor) {
        let content = '';
        editorRef.current.editor.getEditorState().read(() => {
          content =
            editorRef.current.editor?._editorState._nodeMap.get('root')?.getTextContent() || '';
        });
        if (content.trim() || files.length > 0) {
          handleSendContent(content);
        }
      }
    }, [handleSendContent, files]);

    // Handle stopping agent generation
    const handleStopGeneration = useCallback(() => {
      if (threadId && threadId !== 'new') {
        dispatch(stopThreadGeneration(threadId))
          .then(() => {
            enqueueSnackbar('Generation stopped', { variant: 'success' });
          })
          .catch((error: any) => {
            enqueueSnackbar('Failed to stop generation', { variant: 'error' });
          });
      }
    }, [threadId, enqueueSnackbar]);

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
            <ActivationLifecycleBar
              threadId={threadId}
              className="mb-2"
            />
            <AuthorizationRequests />
            <TodoWidget
              threadId={threadId}
              mode={mode}
            />
          </>
        )}

        <div
          ref={containerRef}
          className={`relative w-full max-w-[700px] mx-auto ${
            hasTasks ? 'rounded-b-3xl' : 'rounded-3xl'
          } border bg-white/90 dark:bg-[#1c1c1c] hover:bg-white/95 dark:hover:bg-[#1c1c1c] focus-within:bg-white/95 dark:focus-within:bg-[#1c1c1c] backdrop-blur-lg border-gray-200/30 dark:border-gray-700/30 transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="*/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Drag Overlay */}
          {dragOver && (
            <div className="absolute inset-0 z-50 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-3xl flex items-center justify-center backdrop-blur-sm">
              <div className="text-blue-600 dark:text-blue-400 font-medium">Drop files here</div>
            </div>
          )}

          {/* Credit Wallet */}
          {renderCredits && <CreditWallet />}

          {/* File Previews */}
          <FilePreview
            files={files}
            onRemove={handleRemoveFile}
          />

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

          {/* Bottom Bar */}
          <div className="p-2 pt-0">
            <TooltipProvider delayDuration={100}>
              <div className="flex items-center justify-between">
                {/* Left: Attach button + Agent Selection */}
                <div className="flex items-center gap-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleAttachClick}
                        disabled={disabled}
                        className="h-8 w-8 rounded-full"
                      >
                        <PlusIcon />
                        <span className="sr-only">Attach files</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Attach files</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Agent Selection */}
                  <AgentSelectionChip
                    agents={agents}
                    selectedAgent={selectedAgent}
                    onAgentSelect={setSelectedAgent}
                    onAgentClear={() => setSelectedAgent(null)}
                    isVoiceActive={false}
                    altaner={altaner}
                    operateMode={operateMode}
                  />
                </div>

                {/* Right: Build mode chip + Send/Voice button */}
                <div className="flex items-center gap-2">
                  {/* Build Mode Chip */}
                  <BuildModeToggle operateMode={operateMode} />

                  {/* Send or Voice button */}
                  {/* Stop Generation Button (when agent is generating) */}
                  {hasActiveGeneration ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleStopGeneration}
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8 rounded-full"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="6" width="12" height="12" />
                          </svg>
                          <span className="sr-only">Stop generation</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Stop generation</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : hasValue ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleSendClick}
                          disabled={disabled}
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <SendIcon />
                          <span className="sr-only">Send message</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Send</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={startRecording}
                          disabled={disabled}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                        >
                          <MicIcon />
                          <span className="sr-only">Start voice recording</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Voice input</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </>
    );
  },
);

RoomPromptInput.displayName = 'RoomPromptInput';
