import { memo, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { useSnackbar } from '../snackbar';
import AgentSelectionChip from './components/AgentSelectionChip.jsx';
import AttachmentMenu from './components/AttachmentMenu.jsx';
import DragOverlay from './components/DragOverlay.jsx';
import FlowSelectionDialog from './components/FlowSelectionDialog.jsx';
import SpeechInputModal from './components/SpeechInputModal.jsx';
import VoiceCallButton from './components/VoiceCallButton.jsx';
import { useFileHandling } from './hooks/useFileHandling';
import { useVoiceConversationHandler } from './hooks/useVoiceConversation';
import AltanAnimatedSvg from './ui/AltanAnimatedSvg.jsx';
import { BASE_MENU_ITEMS, FLOW_MENU_ITEM } from './utils/constants';
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
  agents = [],
}) => {
  // Voice conversation hooks
  const { enqueueSnackbar } = useSnackbar();
  const { isVoiceActive, isVoiceConnecting, startVoiceCall, stopVoiceCall } =
    useVoiceConversationHandler(threadId);

  // File handling hooks
  const { dragOver, fileInputRef, handleFileChange, handleDrop, handleUrlUpload, setupDragEvents } =
    useFileHandling(setAttachments, editorRef);

  // State for flows and modals
  const [flows, setFlows] = useState([]);
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);
  const [showSpeechInput, setShowSpeechInput] = useState(false);

  // Get altaner_id from route params
  const { altanerId } = useParams();

  // Determine menu items based on altanerId presence
  const displayMenuItems = altanerId ? [...BASE_MENU_ITEMS, FLOW_MENU_ITEM] : BASE_MENU_ITEMS;

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
      }
    },
    [handleUrlUpload, flows, enqueueSnackbar],
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

          <AgentSelectionChip
            agents={agents}
            selectedAgent={selectedAgent}
            onAgentSelect={handleAgentSelect}
            onAgentClear={handleAgentClear}
            isVoiceActive={isVoiceActive}
          />
        </div>

        {/* CENTER: Mobile toggle buttons */}
        {mode === 'mobile' && onMobileToggle && (
          <div className="flex items-center gap-1 p-1 rounded-full bg-gray-200/50 dark:bg-gray-800/50">
            <button
              onClick={() => onMobileToggle('chat')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                mobileActiveView === 'chat'
                  ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => onMobileToggle('preview')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                mobileActiveView === 'preview'
                  ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Preview
            </button>
          </div>
        )}

        {/* RIGHT: Voice/Send button and Speech Recognition */}
        <div className="flex items-center gap-2">
          {/* Speech Recognition Button - Always available */}
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSpeechInput(true);
            }}
            className="flex items-center justify-center p-1 rounded-full
                     bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800
                     text-gray-600 dark:text-gray-300 transition"
            title="Voice input"
          >
            <Iconify
              icon="mdi:microphone"
              className="text-xl"
            />
          </button> */}

          {/* Main Send/Voice Button */}
          <VoiceCallButton
            isVoiceActive={isVoiceActive}
            isVoiceConnecting={isVoiceConnecting}
            isSendEnabled={isSendEnabled}
            onSendMessage={handleSendMessage}
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
