import { useMediaQuery, useTheme, DialogContent, CircularProgress, IconButton } from '@mui/material';
import { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import {
  selectActiveResponsesByThread,
  selectActiveActivationsByThread,
  stopThreadGeneration,
  sendMessage,
} from '../../redux/slices/room';
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
import FlowSelectionDialog from './components/FlowSelectionDialog.jsx';
import ModeSelectionChip from './components/ModeSelectionChip.jsx';
import SpeechInputModal from './components/SpeechInputModal.jsx';
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

  // Enhanced send message handler
  const handleSendMessage = useCallback(() => {
    if (!isSendEnabled && !isVoiceActive) {
      // Start voice conversation
      startVoiceCall(agents, selectedAgent);
    } else if (isVoiceActive && !isSendEnabled) {
      // Stop voice conversation
      stopVoiceCall();
    } else if (isSendEnabled) {
      // Send regular message (text-to-voice handled in FloatingTextArea)
      onSendMessage();
    }
  }, [
    isSendEnabled,
    isVoiceActive,
    startVoiceCall,
    stopVoiceCall,
    onSendMessage,
    agents,
    selectedAgent,
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
  const handleConnectionSelected = useCallback((connection) => {
    console.log('Connection selected:', connection);
    // You can add logic here to handle the selected connection
    // For example, insert connection info into the editor
    if (editorRef?.current?.insertText && connection) {
      const connectionText = `
Tool Connected: ${connection.name} (${connection.connection_type?.name})
`;
      editorRef.current.insertText(connectionText);
    }
  }, [editorRef]);

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
  const handleModeSelect = useCallback((mode) => {
    setSelectedMode(mode);
    // Clear agent selection when switching to auto or plan mode
    if ((mode === 'auto' || mode === 'plan') && selectedAgent) {
      setSelectedAgent(null);
    }
  }, [selectedAgent, setSelectedAgent]);

  // Helper function to get file extension from MIME type
  const getFileExtension = (mimeType) => {
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
  };

  // Transcribe audio - defined before startRecording to avoid hoisting issues
  const transcribeAudio = useCallback(async (blob) => {
    if (!blob) return;

    setIsTranscribing(true);
    setTranscriptionError(null);

    try {
      const formData = new FormData();
      const mimeType = blob.type;
      const extension = getFileExtension(mimeType);
      formData.append('file', blob, `recording.${extension}`);

      const baseUrl = 'https://d9e17293-cf6.db-pool-europe-west1.altan.ai';
      const response = await fetch(`${baseUrl}/services/api/transcription_service/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && result.text) {
        // Send the transcribed text directly using Redux action
        if (threadId) {
          console.log('Sending transcribed message via Redux:', result.text);
          await dispatch(
            sendMessage({
              content: result.text,
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
  }, [threadId, enqueueSnackbar]);

  // Start recording audio
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
        // Use the base MIME type without codecs
        const baseMimeType = mediaRecorder.mimeType.split(';')[0];
        const blob = new Blob(audioChunksRef.current, { type: baseMimeType });

        // Only set blob if we have chunks (not cancelled)
        // Don't auto-transcribe - wait for user to click accept button
        if (audioChunksRef.current.length > 0) {
          setAudioBlob(blob);
        }

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscriptionError(null);
    } catch (err) {
      console.error('Failed to start recording:', err);
      enqueueSnackbar('Failed to access microphone', { variant: 'error' });
    }
  }, [enqueueSnackbar, transcribeAudio]);

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
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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
      // Stop recording first
      stopRecording();
    }
  }, [isRecording, stopRecording]);

  // Auto-transcribe when recording stops and user has clicked accept
  useEffect(() => {
    if (!isRecording && audioBlob && !isTranscribing && shouldTranscribeRef.current) {
      shouldTranscribeRef.current = false;
      // Wait a bit for the stop to complete
      const timer = setTimeout(() => {
        transcribeAudio(audioBlob);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isRecording, audioBlob, isTranscribing, transcribeAudio]);

  // The container into which we'll portal the overlay
  const overlayContainer = containerRef?.current;

  return (
    <>
      {/* Full-screen Recording Overlay */}
      {(isRecording || isTranscribing) && (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl flex items-center gap-4 bg-gray-100 dark:bg-gray-800 rounded-full px-6 py-4">
            {/* Cancel Button */}
            <IconButton
              size="medium"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelRecording();
              }}
              disabled={isTranscribing}
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Iconify icon="mdi:close" className="text-2xl text-gray-700 dark:text-gray-300" />
            </IconButton>

            {/* Live Waveform */}
            <div className="flex-1 min-w-0 text-gray-700 dark:text-white">
              <LiveWaveform
                active={isRecording}
                processing={isTranscribing}
                mode="static"
                height={60}
                barWidth={4}
                barGap={2}
              />
            </div>

            {/* Accept Button */}
            <IconButton
              size="medium"
              onClick={(e) => {
                e.stopPropagation();
                handleAcceptRecording();
              }}
              disabled={isTranscribing}
              className="hover:bg-green-100 dark:hover:bg-green-900/50"
            >
              {isTranscribing ? (
                <CircularProgress size={24} className="text-gray-700 dark:text-white" />
              ) : (
                <Iconify icon="mdi:check" className="text-2xl text-green-600 dark:text-green-400" />
              )}
            </IconButton>
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
            <AttachmentMenu
              menuItems={displayMenuItems}
              onFileInputClick={handleFileInputClick}
            />

            {!isMobile && (
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
            {/* Audio Transcription Button */}
            <button
              onClick={(e) => {
              e.stopPropagation();
              startRecording();
            }}
              className="flex items-center justify-center p-2 rounded-full
                     bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800
                     text-gray-600 dark:text-gray-300 transition-all duration-200"
              title="Record and transcribe"
            >
              <Iconify icon="mdi:microphone" className="text-xl" />
            </button>

            {/* Main Send/Voice Button */}
            <VoiceCallButton
              isVoiceActive={isVoiceActive}
              isVoiceConnecting={isVoiceConnecting}
              isSendEnabled={isSendEnabled}
              onSendMessage={handleSendMessage}
              hasActiveGeneration={hasActiveGeneration}
              onStopGeneration={handleStopGeneration}
            />
          </div>
        </div>

        {/* Speech Input Modal */}
        <SpeechInputModal
          open={showSpeechInput}
          onClose={() => setShowSpeechInput(false)}
          onTranscript={handleTranscript}
          threadId={threadId}
        />

        {/* Flow Selection Dialog */}
        <FlowSelectionDialog
          open={isFlowDialogOpen}
          onClose={() => setIsFlowDialogOpen(false)}
          flows={flows}
          onSelectFlow={handleSelectFlow}
        />

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
