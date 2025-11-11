import {
  useMediaQuery,
  useTheme,
  DialogContent,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';

import {
  selectActiveResponsesByThread,
  selectActiveActivationsByThread,
  stopThreadGeneration,
  sendMessage,
} from '../../redux/slices/room';
import { setOperateMode } from '../../redux/slices/altaners';
import { dispatch, useSelector } from '../../redux/store';
import CustomDialog from '../dialogs/CustomDialog.jsx';
import { LiveWaveform } from '../elevenlabs/ui/live-waveform.tsx';
import Iconify from '../iconify';
import MobileViewToggle from '../mobile/MobileViewToggle.jsx';
import { useSnackbar } from '../snackbar';
import ConnectionManager from '../tools/ConnectionManager';
import AgentSelectionChip from './components/AgentSelectionChip.jsx';
import AttachmentMenu from './components/AttachmentMenu.jsx';
import DragOverlay from './components/DragOverlay.jsx';
import ModeSelectionChip from './components/ModeSelectionChip.jsx';
import VoiceCallButton from './components/VoiceCallButton.jsx';
import { useFileHandling } from './hooks/useFileHandling';
import { useVoiceConversationHandler } from './hooks/useVoiceConversation';
import AltanAnimatedSvg from './ui/AltanAnimatedSvg.jsx';
import { BASE_MENU_ITEMS, TOOL_MENU_ITEM } from './utils/constants';
import { fetchAltanerData } from './utils/fetchAltanerData';
import analytics from '../../lib/analytics';

// Stable empty array reference to avoid creating new references
const EMPTY_ARRAY = [];

const AttachmentHandler = ({
  threadId = null,
  onSendMessage,
  setAttachments,
  containerRef = null,
  isSendEnabled = false,
  editorRef,
  mode = 'standard',
  mobileActiveView = 'chat',
  onMobileToggle = null,
  selectedAgent = null,
  setSelectedAgent = null,
  selectedMode: propSelectedMode = null,
  setSelectedMode: propSetSelectedMode = null,
  agents = [],
  activeComponent = null,
  allComponents = null,
  isFullscreen = false,
  currentItemId = null,
  onItemSelect = null,
  show_mode_selector = false,
}) => {
  // Mobile detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const history = useHistory();
  const location = useLocation();
  
  // Detect operate mode directly from URL path
  const operateMode = location.pathname.endsWith('/operate');

  // Voice conversation hooks
  const { enqueueSnackbar } = useSnackbar();
  const { isVoiceActive, isVoiceConnecting, startVoiceCall, stopVoiceCall } =
    useVoiceConversationHandler(threadId);

  // Create stable memoized selectors to avoid unnecessary rerenders
  const selectActiveResponsesStable = useMemo(
    () => (threadId ? selectActiveResponsesByThread(threadId) : () => EMPTY_ARRAY),
    [threadId],
  );

  const selectActiveActivationsStable = useMemo(
    () => (threadId ? selectActiveActivationsByThread(threadId) : () => EMPTY_ARRAY),
    [threadId],
  );

  // Check for active agent generation (activations OR responses)
  const activeResponses = useSelector(selectActiveResponsesStable);
  const activeActivations = useSelector(selectActiveActivationsStable);

  // Show stop button if there are ANY active activations or responses
  const hasActiveGeneration =
    (activeResponses && activeResponses.length > 0) ||
    (activeActivations && activeActivations.length > 0);

  // File handling hooks
  const { dragOver, fileInputRef, handleFileChange, handleDrop, handleUrlUpload, setupDragEvents } =
    useFileHandling(setAttachments, editorRef);

  // State for flows and modals
  const [flows, setFlows] = useState([]);
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);
  const [showSpeechInput, setShowSpeechInput] = useState(false);
  const [isToolDialogOpen, setIsToolDialogOpen] = useState(false);

  // Use prop mode if provided, otherwise use local state
  const [localSelectedMode, setLocalSelectedMode] = useState('auto');
  const selectedMode = propSelectedMode !== null ? propSelectedMode : localSelectedMode;
  const setSelectedMode = propSetSelectedMode !== null ? propSetSelectedMode : setLocalSelectedMode;

  // Audio transcription state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcriptionError, setTranscriptionError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const shouldTranscribeRef = useRef(false);

  // Get altaner_id from route params
  const { altanerId } = useParams();

  // Determine menu items based on altanerId presence
  const displayMenuItems = altanerId ? [...BASE_MENU_ITEMS, TOOL_MENU_ITEM] : BASE_MENU_ITEMS;

  // Fetch altaner data on mount if altanerId exists
  useEffect(() => {
    if (altanerId) {
      fetchAltanerData(altanerId, setFlows);
    }
  }, [altanerId]);

  // Setup drag events
  useEffect(() => {
    return setupDragEvents(containerRef);
  }, [setupDragEvents, containerRef]);

  // Helper function to get file extension from MIME type
  const getFileExtension = useCallback((mimeType) => {
    // Remove codec information from MIME type
    const baseMimeType = mimeType.split(';')[0];
    const mimeToExt = {
      'audio/webm': 'webm',
      'audio/mp4': 'm4a',
      'audio/mpeg': 'mp3',
      'audio/ogg': 'ogg',
      'audio/wav': 'wav',
    };
    return mimeToExt[baseMimeType] || 'webm';
  }, []);

  // Transcribe audio - defined before startRecording to avoid hoisting issues
  const transcribeAudio = useCallback(
    async (blob) => {
      console.log('🎯 transcribeAudio called with blob:', blob);
      if (!blob) {
        console.log('❌ No blob provided to transcribeAudio');
        return;
      }

      setIsTranscribing(true);
      setTranscriptionError(null);

      try {
        const formData = new FormData();
        const mimeType = blob.type;
        const extension = getFileExtension(mimeType);
        formData.append('file', blob, `recording.${extension}`);
        console.log('📤 Sending to backend, file type:', mimeType, 'extension:', extension);

        const baseUrl = 'https://d9e17293-cf6.db-pool-europe-west1.altan.ai';
        const response = await fetch(`${baseUrl}/services/api/transcription_service/transcribe`, {
          method: 'POST',
          body: formData,
        });
        console.log('📥 Backend response:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success' && result.text) {
          // Send the transcribed text directly using Redux action
          if (threadId) {
            // Prepend agent mention if in instant mode and an agent is selected
            let messageContent = result.text;
            if (selectedMode === 'instant' && selectedAgent) {
              messageContent = `**[@${selectedAgent.name}](/member/${selectedAgent.id})**\n\n${result.text}`;
            }

            console.log('Sending transcribed message via Redux:', messageContent);
            await dispatch(
              sendMessage({
                content: messageContent,
                attachments: [],
                threadId,
              }),
            );

            // Track speech-to-text usage
            analytics.featureUsed('speech_to_text', {
              thread_id: threadId,
              text_length: result.text.length,
            });
          } else {
            console.error('No threadId available to send message');
          }
          // Reset audio blob after successful transcription
          setAudioBlob(null);
        } else if (result.error) {
          setTranscriptionError(result.error);
          enqueueSnackbar(`Transcription error: ${result.error}`, { variant: 'error' });
        } else {
          const errorMsg = result.message || 'Transcription failed';
          setTranscriptionError(errorMsg);
          enqueueSnackbar(errorMsg, { variant: 'error' });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to transcribe audio';
        setTranscriptionError(errorMsg);
        enqueueSnackbar(errorMsg, { variant: 'error' });
        console.error('Transcription error:', err);
      } finally {
        setIsTranscribing(false);
      }
    },
    [threadId, enqueueSnackbar, selectedMode, selectedAgent, getFileExtension],
  );

  // Start recording audio
  const startRecording = useCallback(async () => {
    console.log('🎤 startRecording called');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Got microphone access');

      // Try to use MP4/M4A format first, fall back to WebM
      let options = { mimeType: 'audio/mp4' };
      if (!MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/webm' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('⏹️ Recording stopped, chunks:', audioChunksRef.current.length);
        // Use the base MIME type without codecs
        const baseMimeType = mediaRecorder.mimeType.split(';')[0];
        const blob = new Blob(audioChunksRef.current, { type: baseMimeType });

        // Only set blob if we have chunks (not cancelled)
        // Don't auto-transcribe - wait for user to click accept button
        if (audioChunksRef.current.length > 0) {
          console.log('✅ Audio blob created, size:', blob.size);
          setAudioBlob(blob);
        }

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscriptionError(null);
      console.log('▶️ Recording started');
    } catch (err) {
      console.error('❌ Failed to start recording:', err);
      enqueueSnackbar('Failed to access microphone', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // Stop recording audio
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Cancel recording without transcribing
  const handleCancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      shouldTranscribeRef.current = false;

      // Stop the recorder
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all tracks to release microphone
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }

      // Clear the audio blob to prevent transcription
      audioChunksRef.current = [];
      setAudioBlob(null);
    }
  }, [isRecording]);

  // Accept recording and transcribe
  const handleAcceptRecording = useCallback(() => {
    if (isRecording) {
      // Mark that we should transcribe when recording stops
      shouldTranscribeRef.current = true;
      console.log('📝 Will transcribe after stop');
      // Stop recording first
      stopRecording();
    }
  }, [isRecording, stopRecording]);

  // Auto-transcribe when recording stops and user has clicked accept
  useEffect(() => {
    if (!isRecording && audioBlob && !isTranscribing && shouldTranscribeRef.current) {
      shouldTranscribeRef.current = false;
      console.log('🚀 Starting transcription...');
      // Wait a bit for the stop to complete
      const timer = setTimeout(() => {
        transcribeAudio(audioBlob);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isRecording, audioBlob, isTranscribing, transcribeAudio]);

  // Enhanced send message handler
  const handleSendMessage = useCallback(() => {
    if (!isSendEnabled && !isVoiceActive && !isRecording && !isTranscribing) {
      // Start audio recording for transcription
      startRecording();
    } else if (isVoiceActive && !isSendEnabled) {
      // Stop voice conversation (cleanup for deprecated feature)
      stopVoiceCall();
    } else if (isSendEnabled) {
      // Send regular message (text-to-voice handled in FloatingTextArea)
      onSendMessage();
    }
  }, [
    isSendEnabled,
    isVoiceActive,
    isRecording,
    isTranscribing,
    startRecording,
    stopVoiceCall,
    onSendMessage,
  ]);

  // Handle stopping agent generation
  const handleStopGeneration = useCallback(() => {
    if (threadId) {
      dispatch(stopThreadGeneration(threadId))
        .then(() => {
          enqueueSnackbar('Generation stopped', { variant: 'success' });
        })
        .catch((error) => {
          enqueueSnackbar('Failed to stop generation', { variant: 'error' });
          console.error('Failed to stop generation:', error);
        });
    }
  }, [threadId, enqueueSnackbar]);

  // Handle file input click for different types
  const handleFileInputClick = useCallback(
    (type) => {
      if (type === 'attachment') {
        // Standard file input for attachments
        fileInputRef.current?.click();
      } else if (type === 'url') {
        // Create a temporary file input for URL uploads
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.multiple = true;
        tempInput.accept = '*/*';
        tempInput.onchange = (e) => handleUrlUpload(Array.from(e.target.files));
        tempInput.click();
      } else if (type === 'flow') {
        // Open the flow selection dialog if flows are available
        if (flows && flows.length > 0) {
          setIsFlowDialogOpen(true);
        } else {
          console.warn('Workflows not available or empty. Cannot open selection dialog.');
          enqueueSnackbar('No workflows available', { variant: 'warning' });
        }
      } else if (type === 'tool') {
        // Open the tool creation dialog
        setIsToolDialogOpen(true);
      }
    },
    [handleUrlUpload, flows, enqueueSnackbar, fileInputRef],
  );

  // Handle flow selection
  const handleSelectFlow = useCallback(
    (flow) => {
      if (editorRef?.current?.insertText && flow) {
        const flowText = `
Workflow Selected: ${flow.name} (ID: ${flow.id})
`;
        console.log('Inserting flow text:', flowText);
        editorRef.current.insertText(flowText);
      }
      setIsFlowDialogOpen(false);
    },
    [editorRef],
  );

  // Handle transcript from speech input
  const handleTranscript = useCallback(
    (text) => {
      if (editorRef?.current?.insertText) {
        editorRef.current.insertText(text + ' ');
      }
    },
    [editorRef],
  );

  // Handle connection selection from ConnectionManager
  const handleConnectionSelected = useCallback(
    (connection) => {
      console.log('Connection selected:', connection);
      // You can add logic here to handle the selected connection
      // For example, insert connection info into the editor
      if (editorRef?.current?.insertText && connection) {
        const connectionText = `
Tool Connected: ${connection.name} (${connection.connection_type?.name})
`;
        editorRef.current.insertText(connectionText);
      }
    },
    [editorRef],
  );

  // Handle tool dialog close
  const handleToolDialogClose = useCallback(() => {
    setIsToolDialogOpen(false);
  }, []);

  // Agent selection handlers
  const handleAgentSelect = useCallback(
    (agent) => {
      setSelectedAgent(agent);
    },
    [setSelectedAgent],
  );

  const handleAgentClear = useCallback(() => {
    setSelectedAgent(null);
  }, [setSelectedAgent]);

  // Mode selection handler
  const handleModeSelect = useCallback(
    (mode) => {
      setSelectedMode(mode);
      // Clear agent selection when switching to auto or plan mode
      if ((mode === 'auto' || mode === 'plan') && selectedAgent) {
        setSelectedAgent(null);
      }
    },
    [selectedAgent, setSelectedAgent],
  );

  // Toggle between build and operate mode
  const handleToggleMode = useCallback(() => {
    if (!altanerId) return;
    
    if (operateMode) {
      // Currently in operate mode -> switch to build mode (go back to project root)
      history.replace(`/project/${altanerId}`);
    } else {
      // Currently in build mode -> switch to operate mode
      history.replace(`/project/${altanerId}/operate`);
    }
    
    dispatch(setOperateMode(!operateMode));
  }, [history, operateMode, altanerId]);

  // The container into which we'll portal the overlay
  const overlayContainer = containerRef?.current;

  return (
    <>
      {/* Full-screen Recording Overlay */}
      {(isRecording || isTranscribing) && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center px-4">
          <div className="w-full max-w-xl flex items-center gap-3 bg-white/10 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-3 py-2.5 shadow-2xl">
            {/* Cancel Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCancelRecording();
              }}
              disabled={isTranscribing}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all disabled:opacity-50"
            >
              <Iconify
                icon="mdi:close"
                className="text-lg text-white/90"
              />
            </button>

            {/* Live Waveform */}
            <div className="flex-1 min-w-0 text-white">
              <LiveWaveform
                active={isRecording}
                processing={isTranscribing}
                mode="static"
                height={40}
                barWidth={3}
                barGap={2}
              />
            </div>

            {/* Accept Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAcceptRecording();
              }}
              disabled={isTranscribing}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all disabled:opacity-50"
            >
              {isTranscribing ? (
                <div className="w-5 h-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Iconify
                  icon="mdi:check"
                  className="text-lg text-white/90"
                />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Normal UI - Hidden when recording */}
      <div className="relative flex flex-col w-full">
        {/* Hidden File Input (multiple selection allowed) */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* BOTTOM ROW: Buttons */}
        <div className="flex items-center justify-between w-full">
          {/* LEFT: Attach button with menu */}
          <div className="flex items-center gap-2">
            <Tooltip title={operateMode ? "Switch to Build Mode" : "Switch to Operate Mode"} placement="top" arrow>
              <IconButton
                size="small"
                onClick={handleToggleMode}
                sx={{
                  backgroundColor: operateMode ? 'rgba(168, 85, 247, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  '&:hover': {
                    backgroundColor: operateMode ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  },
                }}
              >
                <Iconify 
                  icon={operateMode ? "mdi:hammer-wrench" : "mdi:play-circle-outline"} 
                  width={20} 
                  height={20} 
                />
              </IconButton>
            </Tooltip>
            
            <AttachmentMenu
              menuItems={displayMenuItems}
              onFileInputClick={handleFileInputClick}
            />

            {!isMobile && !operateMode && (
              <>
                {show_mode_selector && (
                  <ModeSelectionChip
                    selectedMode={selectedMode}
                    onModeSelect={handleModeSelect}
                    isVoiceActive={isVoiceActive}
                  />
                )}

                {show_mode_selector && selectedMode === 'instant' && (
                  <AgentSelectionChip
                    agents={agents}
                    selectedAgent={selectedAgent}
                    onAgentSelect={handleAgentSelect}
                    onAgentClear={handleAgentClear}
                    isVoiceActive={isVoiceActive}
                  />
                )}
              </>
            )}
          </div>

          {/* CENTER: Mobile toggle buttons */}
          {mode === 'mobile' && onMobileToggle && (
            <MobileViewToggle
              mobileActiveView={mobileActiveView}
              onMobileToggle={onMobileToggle}
              activeComponent={activeComponent}
              allComponents={allComponents}
              isFullscreen={isFullscreen}
              currentItemId={currentItemId}
              onItemSelect={onItemSelect}
            />
          )}

          {/* RIGHT: Voice/Send button and Speech Recognition */}
          <div className="flex items-center gap-2">
            {/* Main Send/Voice Button */}
            <VoiceCallButton
              isVoiceActive={isVoiceActive}
              isVoiceConnecting={isVoiceConnecting}
              isSendEnabled={isSendEnabled}
              onSendMessage={handleSendMessage}
              hasActiveGeneration={hasActiveGeneration}
              onStopGeneration={handleStopGeneration}
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              onStartRecording={startRecording}
            />
          </div>
        </div>

        {/* Tool Creation Dialog */}
        <CustomDialog
          open={isToolDialogOpen}
          onClose={handleToolDialogClose}
        >
          <DialogContent className="py-6">
            <ConnectionManager
              onConnectionSelected={handleConnectionSelected}
              onClose={handleToolDialogClose}
              title="Add Tool Connection"
            />
          </DialogContent>
        </CustomDialog>

        {/* DRAG-AND-DROP OVERLAY */}
        <DragOverlay
          dragOver={dragOver}
          overlayContainer={overlayContainer}
          onDrop={handleDrop}
        />
      </div>
    </>
  );
};

export default memo(AttachmentHandler);
export { AltanAnimatedSvg };
