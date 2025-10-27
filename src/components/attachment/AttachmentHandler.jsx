import { useMediaQuery, useTheme, DialogContent, CircularProgress } from '@mui/material';
import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';

import {
  selectActiveResponsesByThread,
  selectActiveActivationsByThread,
  stopThreadGeneration,
} from '../../redux/slices/room';
import { dispatch, useSelector } from '../../redux/store';
import CustomDialog from '../dialogs/CustomDialog.jsx';
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
import { BASE_MENU_ITEMS, FLOW_MENU_ITEM, TOOL_MENU_ITEM } from './utils/constants';
import { fetchAltanerData } from './utils/fetchAltanerData';

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

  // Check for active agent generation (activations OR responses)
  const activeResponses = useSelector((state) =>
    threadId ? selectActiveResponsesByThread(threadId)(state) : [],
  );
  const activeActivations = useSelector((state) =>
    threadId ? selectActiveActivationsByThread(threadId)(state) : [],
  );
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

      console.log('Transcription result:', result);

      if (result.status === 'success' && result.text) {
        console.log('Got transcription text:', result.text);
        console.log('editorRef:', editorRef);
        console.log('editorRef.current:', editorRef?.current);
        console.log('onSendMessage:', onSendMessage);
        
        // Insert transcription into editor and send immediately
        if (editorRef?.current?.insertText) {
          console.log('Calling insertText with:', result.text);
          editorRef.current.insertText(result.text);
          console.log('Text inserted, waiting before sending...');
          
          // Send the message immediately after inserting
          setTimeout(() => {
            console.log('About to call onSendMessage');
            if (onSendMessage) {
              console.log('Calling onSendMessage now');
              onSendMessage();
              console.log('onSendMessage called');
            } else {
              console.error('onSendMessage is not defined!');
            }
          }, 100);
        } else {
          console.error('editorRef.current.insertText not available!');
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
  }, [editorRef, enqueueSnackbar, onSendMessage]);

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
        setAudioBlob(blob);
        // Automatically trigger transcription after recording stops
        setTimeout(() => {
          transcribeAudio(blob);
        }, 100);
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

  // Handle transcription button click
  const handleTranscriptionClick = useCallback(() => {
    if (isRecording) {
      // Stop recording - transcription will be triggered automatically in onstop handler
      stopRecording();
    } else {
      // Start new recording
      startRecording();
    }
  }, [isRecording, stopRecording, startRecording]);

  // The container into which we'll portal the overlay
  const overlayContainer = containerRef?.current;

  return (
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
              handleTranscriptionClick();
            }}
            disabled={isTranscribing}
            className={`flex items-center justify-center p-2 rounded-full
                     transition-all duration-200
                     ${isRecording 
                       ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                       : 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                     }
                     ${isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isRecording ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Record and transcribe'}
          >
            {isTranscribing ? (
              <CircularProgress size={20} className="text-gray-600 dark:text-gray-300" />
            ) : (
              <Iconify
                icon={isRecording ? "mdi:stop" : "mdi:microphone"}
                className="text-xl"
              />
            )}
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
  );
};

export default memo(AttachmentHandler);
export { AltanAnimatedSvg };
