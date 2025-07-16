import {
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Chip,
  Avatar,
  Popover,
  Box,
  Typography,
} from '@mui/material';
import { m } from 'framer-motion';
import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';

import { getBase64FromFile, cn } from '@lib/utils';

import { AIVoiceInput } from './AIVoiceInput';
import SendButton from './SendButton.jsx';
import { optimai } from '../../utils/axios.js';
import { uploadRoomMedia } from '../../utils/media';
import Iconify from '../iconify/Iconify.jsx';

const AltanAnimatedSvg = ({ size = 145, ratio = 84 / 72, className, pathClassName }) => {
  const width = size;
  const height = size / ratio;

  return (
    <m.svg
      width={width}
      height={height}
      viewBox="0 0 84 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        filter: 'blur(10px)',
        scale: 0.5,
        transition: {
          duration: 3,
          ease: 'easeOut',
        },
      }}
      transition={{ duration: 2, ease: 'easeOut' }}
      className={cn('relative', className)}
    >
      <m.path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M83.5643 71.9914L42 0L0.435791 71.9914C9.40753 67.1723 24.6747 64 42 64C59.3253 64 74.5925 67.1723 83.5643 71.9914Z"
        className={cn(
          'fill-black/60 dark:fill-white/40 hover:fill-black dark:hover:fill-white group-hover:fill-black dark:group-hover:fill-white',
          pathClassName,
        )}
      />
    </m.svg>
  );
};

/**
 * AttachmentHandler for multiple attachments.
 * If inside a Panel (from react-resizable-panels), the drag overlay is bounded.
 * Otherwise, it defaults to the full window overlay.
 */

const BASE_MENU_ITEMS = [
  {
    type: 'attachment',
    icon: 'mdi:image-multiple',
    label: 'Upload images and files',
  },
];

const FLOW_MENU_ITEM = {
  type: 'flow',
  icon: 'mdi:flowchart',
  label: 'Attach Workflow',
};

// Function to fetch altaner data
const fetchAltanerData = async (id, setFlowsCallback) => {
  try {
    // Fetch data from the API
    const response = await optimai.get(`/altaner/${id}/flows`);
    const data = response.data || response;
    if (data?.flows && Array.isArray(data.flows)) {
      setFlowsCallback(data.flows);
    } else {
      setFlowsCallback([]);
    }
  } catch (error) {
    console.error('Error fetching altaner data:', error);
    setFlowsCallback([]); // Set empty on error
  }
};

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
  // For drag-and-drop
  const [dragOver, setDragOver] = useState(false);
  const dragTimeoutRef = useRef(null);

  // State for flows and dialog
  const [flows, setFlows] = useState([]);
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);
  const [flowSearchTerm, setFlowSearchTerm] = useState('');

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

  // File input
  const fileInputRef = useRef(null);

  // AI Voice Input ref
  const voiceInputRef = useRef(null);

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [agentMenuAnchor, setAgentMenuAnchor] = useState(null);

  const [showSpeechInput, setShowSpeechInput] = useState(false);

  /** *************************************************************************
   * Multiple Attachments
   ***************************************************************************/
  const handleFileChange = useCallback(
    async (event) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const newAttachments = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const base64 = (await getBase64FromFile(file)).split(',')[1];
          newAttachments.push({
            file_content: base64,
            file_name: file.name,
            mime_type: file.type,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          });
        }
        // Append to existing attachments
        setAttachments((prev) => [...(prev || []), ...newAttachments]);

        // Reset the file input to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [setAttachments],
  );

  const handleDrop = useCallback(
    async (event) => {
      event.preventDefault();
      event.stopPropagation();
      setDragOver(false);

      const dtFiles = event.dataTransfer?.files;
      if (dtFiles && dtFiles.length > 0) {
        const newAttachments = [];
        for (let i = 0; i < dtFiles.length; i++) {
          const file = dtFiles[i];
          // Accept any file type
          const base64 = (await getBase64FromFile(file)).split(',')[1];
          newAttachments.push({
            file_content: base64,
            file_name: file.name,
            mime_type: file.type,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          });
        }
        // Update the attachments only if there are valid files
        if (newAttachments.length > 0) {
          setAttachments((prev) => [...(prev || []), ...newAttachments]);
        }
      }
    },
    [setAttachments],
  );

  // Handle menu open/close
  const handleMenuOpen = (event) => {
    event.preventDefault();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAgentMenuOpen = (event) => {
    event.preventDefault();
    setAgentMenuAnchor(event.currentTarget);
  };

  const handleAgentMenuClose = () => {
    setAgentMenuAnchor(null);
  };

  const handleAgentSelect = (agent) => {
    console.log('🎯 Agent selected:', agent);
    setSelectedAgent(agent);
    setAgentMenuAnchor(null);
  };

  // Simplified send message handler - no mention logic needed here
  const handleSendMessage = useCallback(() => {
    console.log('🚀 handleSendMessage called - calling onSendMessage');
    onSendMessage();
  }, [onSendMessage]);

  // Handle the new URL upload option
  const handleUrlUpload = useCallback(
    async (files) => {
      // Create an array of objects containing both the file and its upload promise
      const fileUploads = files.map((file) => ({
        file,
        uploadPromise: uploadRoomMedia(file).catch(() => null),
      }));

      // Wait for all uploads to complete
      const results = await Promise.all(fileUploads.map(({ uploadPromise }) => uploadPromise));

      // Create markdown with original filenames
      const markdownUrls = fileUploads
        .map(({ file }, index) => {
          const url = results[index];
          if (url) {
            return `\n![${file.name}](${url})\n`;
          }
          return '';
        })
        .filter(Boolean)
        .join('');

      // Insert URLs into editor
      if (editorRef?.current?.insertText) {
        editorRef.current.insertText(markdownUrls);
      }
      handleMenuClose();
    },
    [editorRef],
  );

  // Modified file input click handler
  const handleFileInputClick = useCallback(
    (type) => {
      handleMenuClose();
      if (type === 'attachment') {
        // Standard file input for attachments
        fileInputRef.current?.click();
      } else if (type === 'url') {
        // 'url' type
        // Create a temporary file input for URL uploads
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.multiple = true;
        // Allow all file types for URL uploads
        tempInput.accept = '*/*';
        tempInput.onchange = (e) => handleUrlUpload(Array.from(e.target.files));
        tempInput.click();
      } else if (type === 'flow') {
        // Open the flow selection dialog if flows are available
        if (flows && flows.length > 0) {
          setIsFlowDialogOpen(true);
        } else {
          // Handle case where flows are not loaded or empty
          console.warn('Workflows not available or empty. Cannot open selection dialog.');
          // Optionally, display a notification to the user here
        }
      }
    },
    [handleUrlUpload, flows],
  );

  const handleSpeechStart = useCallback(() => {
    console.log('Speech recognition started');
  }, []);

  const handleSpeechStop = useCallback((duration) => {
    console.log('Speech recognition stopped, duration:', duration);
    // Don't close the modal automatically when recording stops
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowSpeechInput(false);
  }, []);

  const handleTranscript = useCallback(
    (text) => {
      if (editorRef?.current?.insertText) {
        editorRef.current.insertText(text + ' ');
      }
    },
    [editorRef],
  );

  // Handle selection of a flow from the dialog
  const handleSelectFlow = useCallback(
    (flow) => {
      if (editorRef?.current?.insertText && flow) {
        // Format the text to be inserted - adjust as needed
        const flowText = `
Workflow Selected: ${flow.name} (ID: ${flow.id})
`;
        console.log('Inserting flow text:', flowText);
        editorRef.current.insertText(flowText);
      }
      setIsFlowDialogOpen(false); // Close the dialog
    },
    [editorRef],
  );

  // Filter flows based on search term
  const filteredFlows = flows.filter(
    (flow) =>
      flow.name.toLowerCase().includes(flowSearchTerm.toLowerCase()) ||
      (flow.description && flow.description.toLowerCase().includes(flowSearchTerm.toLowerCase())),
  );

  /** *************************************************************************
   * Drag/Drop Overlay
   * We either attach global event listeners or rely on panel bounding
   ***************************************************************************/
  useEffect(() => {
    // Not inside a Panel => handle global drag events
    if (!containerRef || !containerRef.current) {
      return;
    }
    const handleWindowDragOver = (event) => {
      event.preventDefault();
    };

    const handleWindowDragEnter = (event) => {
      event.preventDefault();
      clearTimeout(dragTimeoutRef.current);
      setDragOver(true);
    };

    const handleWindowDragLeave = (event) => {
      event.preventDefault();
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = setTimeout(() => {
        setDragOver(false);
      }, 1000);
    };

    const handleWindowDrop = (event) => {
      event.preventDefault();
      clearTimeout(dragTimeoutRef.current);
      setDragOver(false);
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
      clearTimeout(dragTimeoutRef.current);
    };
  }, [threadId]); // Note: Original code had threadId here, keeping it for now

  // The container into which we'll portal the overlay
  const overlayContainer = containerRef?.current;

  return (
    <div className="relative flex flex-col w-full">
      {/* Hidden File Input (multiple selection allowed) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*" // Accept all file types
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* BOTTOM ROW: Buttons */}
      <div className="flex items-center justify-between w-full">
        {/* LEFT: Attach button with menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMenuOpen}
            className="flex items-center justify-center p-1 rounded-full
                     bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800
                     text-gray-600 dark:text-gray-300 transition"
          >
            <Iconify
              icon="mdi:plus"
              className="text-xl"
            />
          </button>

          {/* Agent Selection Chip */}
          {agents.length > 1 && (
            <Chip
              avatar={
                selectedAgent ? (
                  <Avatar
                    src={selectedAgent.src}
                    alt={selectedAgent.name}
                    sx={{ width: 20, height: 20 }}
                  />
                ) : undefined
              }
              icon={!selectedAgent ? <Iconify icon="mdi:at" /> : undefined}
              label={
                selectedAgent
                  ? selectedAgent.name
                  : `${agents.length} agents`
              }
              size="small"
              variant="soft"
              color="default"
              onClick={handleAgentMenuOpen}
              onDelete={selectedAgent ? () => setSelectedAgent(null) : undefined}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              sx={{
                borderRadius: '12px',
                fontSize: '0.75rem',
                height: '28px',
                '& .MuiChip-icon': {
                  fontSize: '14px',
                  marginLeft: '4px',
                },
              }}
            />
          )}

          {/* Agent Menu */}
          <Popover
            open={Boolean(agentMenuAnchor)}
            anchorEl={agentMenuAnchor}
            onClose={handleAgentMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: {
                maxWidth: '250px',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <Box p={1}>
              <Typography
                variant="caption"
                sx={{ px: 1, py: 0.5, color: 'text.secondary' }}
              >
                Select an agent to mention
              </Typography>
              {agents.map((agent) => (
                <MenuItem
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent)}
                  sx={{
                    borderRadius: '8px',
                    margin: '2px 0',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <Avatar
                    src={agent.src}
                    alt={agent.name}
                    sx={{ width: 24, height: 24, marginRight: 1 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    {agent.name}
                  </Typography>
                </MenuItem>
              ))}
            </Box>
          </Popover>

          {/* Attachment Menu */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            slotProps={{
              paper: {
                className: 'bg-white/30 dark:bg-black/30 py-0 my-0',
              },
            }}
          >
            {displayMenuItems.map((item) => (
              <MenuItem
                key={item.type}
                onClick={() => handleFileInputClick(item.type)}
                className="flex flex-col items-start py-1 px-2 bg-white/30 dark:bg-black/30 hover:bg-white/60 dark:hover:bg-black/60 backdrop-blur-lg rounded-lg"
              >
                <div className="flex items-center gap-3 w-full">
                  <Iconify icon={item.icon} />
                  <div className="flex flex-col">
                    <span className="font-bold tracking-wide text-sm">{item.label}</span>
                  </div>
                </div>
              </MenuItem>
            ))}
          </Menu>
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

        {/* RIGHT: Speech Recognition and Send buttons */}
        <div className="flex items-center gap-2">
          <button
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
          </button>
          <SendButton
            onSendMessage={handleSendMessage}
            isDisabled={!isSendEnabled}
          />
        </div>
      </div>

      {/* Speech Input Modal */}
      {showSpeechInput &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] bg-gray-900/95 backdrop-blur-sm flex items-center justify-center"
            onClick={(e) => {
              // Close when clicking the backdrop
              if (e.target === e.currentTarget) {
                handleCloseModal();
              }
            }}
          >
            <div
              className="relative w-full max-w-md rounded-xl p-6 bg-gray-900/90 backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <AIVoiceInput
                ref={voiceInputRef}
                onTranscript={handleTranscript}
                onStart={handleSpeechStart}
                onStop={handleSpeechStop}
                threadId={threadId}
                visualizerBars={32}
              />

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseModal();
                  }}
                  className="px-6 py-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-medium flex items-center gap-2 transition-colors"
                >
                  <Iconify
                    icon="mdi:close"
                    className="text-lg"
                  />
                  <span>Cancel</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (voiceInputRef.current && voiceInputRef.current.stopRecording) {
                      voiceInputRef.current.stopRecording().then(() => {
                        setTimeout(() => handleCloseModal(), 500);
                      });
                    } else {
                      handleCloseModal();
                    }
                  }}
                  className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition-colors"
                >
                  <span>Send</span>
                  <AltanAnimatedSvg
                    size={16}
                    className="p-[2px] relative"
                    pathClassName=""
                  />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Flow Selection Dialog */}
      <Dialog
        open={isFlowDialogOpen}
        onClose={() => {
          setIsFlowDialogOpen(false);
          setFlowSearchTerm('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: 'dark:bg-gray-800' }}
      >
        <DialogTitle className="p-3 text-base font-semibold dark:text-gray-200">
          Select a Workflow
        </DialogTitle>
        <DialogContent
          dividers
          className="p-0"
        >
          {/* Search Input */}
          <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search workflows..."
              value={flowSearchTerm}
              onChange={(e) => setFlowSearchTerm(e.target.value)}
              className="[&_.MuiOutlinedInput-root]:rounded-full [&_.MuiOutlinedInput-root]:p-1 [&_.MuiOutlinedInput-input]:p-1.5 [&_.MuiOutlinedInput-input]:text-sm dark:[&_.MuiOutlinedInput-notchedOutline]:border-gray-600 dark:[&_.MuiInputBase-input::placeholder]:text-gray-400 dark:[&_.MuiInputBase-input]:text-gray-200"
            />
          </div>

          {/* Flow List */}
          <List
            dense
            className="p-0 max-h-72 overflow-y-auto"
          >
            {filteredFlows.length > 0 ? (
              filteredFlows.map((flow) => (
                <ListItem
                  key={flow.id}
                  disablePadding
                >
                  <ListItemButton
                    onClick={() => handleSelectFlow(flow)}
                    className="py-1 px-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ListItemText
                      primary={flow.name}
                      secondary={flow.description || 'No description'}
                      primaryTypographyProps={{
                        className: 'text-sm font-medium dark:text-gray-100',
                      }}
                      secondaryTypographyProps={{
                        className: 'text-xs text-gray-500 dark:text-gray-400',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <ListItem className="px-3">
                <ListItemText
                  primary={flows.length === 0 ? 'Loading workflows...' : 'No workflows found.'}
                  primaryTypographyProps={{
                    className: 'text-sm text-gray-500 dark:text-gray-400 italic',
                  }}
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>

      {/* DRAG-AND-DROP OVERLAY (Portal) */}
      {dragOver && overlayContainer
        ? createPortal(
            <div
              onDrop={handleDrop}
              className="absolute inset-0 flex items-center justify-center z-[999999] pointer-events-auto
                         bg-black/40 backdrop-blur-xl transition-all duration-300"
            >
              <div className="flex flex-col items-center justify-center text-center h-full w-full text-white">
                <div className="flex items-center justify-center bg-white rounded-full h-16 w-16 mb-6 shadow-lg bg-opacity-80">
                  <Iconify
                    icon="iconamoon:attachment-light"
                    className="text-2xl text-blue-500"
                  />
                </div>
                <h5 className="text-2xl font-bold mb-2 animate-pulse">Drop your images here</h5>
                <p className="text-white/75">Only image files are accepted for attachments</p>
              </div>
            </div>,
            overlayContainer,
          )
        : null}
    </div>
  );
};

export default memo(AttachmentHandler);
export { AltanAnimatedSvg };
