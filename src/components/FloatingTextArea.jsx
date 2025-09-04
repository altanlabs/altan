import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import { memo, useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import AttachmentHandler from './attachment/AttachmentHandler.jsx';
import AuthorizationRequests from './AuthorizationRequests.jsx';
import CreditWallet from './CreditWallet.jsx';
// import AssistantInputMenu from './AssistantInputMenu';
import Editor from './editor/Editor.tsx';
import Iconify from './iconify/Iconify.jsx';
import FileUpload from './room/thread/FileUpload.jsx';
import MessageMinified from './room/thread/MessageMinified.jsx';
import { useSnackbar } from './snackbar';
import TodoWidget from './TodoWidget.jsx';
import useLocales from '../locales/useLocales';
import { useVoiceConversation } from '../providers/voice/VoiceConversationProvider';
import { checkObjectsEqual } from '../redux/helpers/memoize';
import {
  createThread,
  makeSelectMessage,
  selectMe,
  selectMembers,
  selectMessagesById,
  selectRoomState,
  sendMessage,
  setThreadRespond,
  selectIsVoiceActive,
} from '../redux/slices/room';
import { selectTasksByThread } from '../redux/slices/tasks';
import { dispatch, useSelector } from '../redux/store.js';
import { optimai_room } from '../utils/axios.js';
import { getMemberDetails } from './room/utils.js';

const handleCancelReply = (threadId) => dispatch(setThreadRespond({ messageId: null, threadId }));

// Selector to get respond
const selectRespond = createSelector([selectRoomState], (roomState) => roomState.thread.respond, {
  memoizeOptions: {
    resultEqualityCheck: checkObjectsEqual,
  },
});

// Combined selector to get replyTo
const makeSelectReplyTo = () =>
  createSelector(
    [selectMessagesById, selectRespond, (state, threadId) => threadId],
    (messages, respond, threadId) =>
      !!threadId && !!respond[threadId] && messages[respond[threadId]],
    {
      memoizeOptions: {
        resultEqualityCheck: checkObjectsEqual,
      },
    },
  );

// iOS detection utility
const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

const FloatingTextArea = ({
  threadId,
  // messages = null,
  messageId = null,
  mode = 'standard',
  containerRef = null,
  roomId = null,
  mobileActiveView = 'chat',
  onMobileToggle = null,
  renderCredits = false,
}) => {
  const { altanerId } = useParams();
  const me = useSelector(selectMe);
  const replyToSelector = useMemo(makeSelectReplyTo, []);
  const replyTo = useSelector((state) => replyToSelector(state, threadId));
  const messageSelector = useMemo(makeSelectMessage, []);
  const selectedMessage = useSelector((state) => messageSelector(state, messageId));
  const tasks = useSelector(selectTasksByThread(threadId));
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Check if we have tasks to show (only in altaner context)
  const hasTasks = altanerId && tasks && tasks.length > 0;

  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const [editorEmpty, setEditorEmpty] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const editorRef = useRef({});

  // Voice conversation hooks
  const isVoiceActive = useSelector((state) => selectIsVoiceActive(threadId)(state));
  const { conversation } = useVoiceConversation();

  // Get agents from room members
  const members = useSelector(selectMembers);
  const agents = Object.values(members.byId || {})
    .filter((member) => member?.member?.member_type === 'agent')
    .map((member) => getMemberDetails(member));

  const isSendEnabled = !!(!editorEmpty || attachments?.length);
  const isViewer = useMemo(() => {
    const viewer = !me || (!!me && ['viewer', 'listener'].includes(me.role));
    return viewer;
  }, [me]);
  const sendContent = useCallback(
    (content) => {
      if (content.trim() || (attachments && attachments.length > 0)) {
        // Handle selected agent mention
        let finalContent = content;
        if (selectedAgent) {
          const mentionText = `**[@${selectedAgent.name}](/member/${selectedAgent.id})**`;
          finalContent = mentionText + (content ? '\n' + content : '');

          // Clear selected agent after sending
          setSelectedAgent(null);
        }

        // Create a clean attachments array without `preview`
        const sanitizedAttachments = attachments.map(({ preview, ...rest }) => rest);

        dispatch(
          !messageId
            ? sendMessage({ threadId, content: finalContent, attachments: sanitizedAttachments })
            : createThread({ content: finalContent, attachments: sanitizedAttachments }),
        ).catch((e) => enqueueSnackbar(e, { variant: 'error' }));

        if (isVoiceActive && conversation) {
          try {
            conversation.sendUserMessage(finalContent);
          } catch (error) {
            console.error('❌ [TEXT_TO_VOICE] FloatingTextArea failed:', error);
          }
        }

        // Clear attachments after sending
        setAttachments([]);
      }
    },
    [attachments, messageId, threadId, enqueueSnackbar, selectedAgent, setSelectedAgent],
  );

  // Removes a single attachment by index
  const handleRemoveAttachment = useCallback(
    (index) => {
      setAttachments((prev) => prev.filter((_, i) => i !== index));
    },
    [setAttachments],
  );

  const handleJoinRoom = useCallback(async () => {
    setIsJoining(true);
    setJoinError(null);
    try {
      const response = await optimai_room.get(`/${roomId}/join`);
      // If the response indicates failure, throw an error
      if (!response?.data?.success) {
        throw new Error('You must be part of the workspace!');
      }
    } catch (error) {
      setJoinError(error.message);
    } finally {
      setIsJoining(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.sendContent = sendContent;
    }
  }, [sendContent]);

  // Keyboard detection for iOS
  useEffect(() => {
    if (!isIOS()) return;

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        setIsKeyboardOpen(viewportHeight < windowHeight * 0.8);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);

      return () => {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      };
    }
  }, []);

  return (
    <>
      {!!(replyTo || selectedMessage) && !isViewer && (
        <div className="relative w-full max-w-[500px] mx-16 xl:mx-10 lg:mx-7 md:mx-7 sm:mx-4 rounded-t-xl p-2 backdrop-blur-lg flex flex-col bg-white/80 dark:bg-gray-900/80">
          <Typography
            variant="caption"
            noWrap
          >
            Replying to
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            width="100%"
          >
            <div className="w-full pr-4">
              <MessageMinified
                message={replyTo || selectedMessage}
                minimal
              />
            </div>
            <Iconify
              sx={{
                cursor: 'pointer',
                position: 'absolute',
                right: 5,
                top: 9,
                opacity: 0.5,
              }}
              icon="mdi:close-circle-outline"
              onClick={() => handleCancelReply(threadId)}
            />
          </Stack>
        </div>
      )}
      {!isViewer && (mode === 'standard' || mode === 'mobile') && (
        <FileUpload threadId={threadId} />
      )}
      {isViewer ? (
        <div className="flex flex-col items-center space-y-3 mb-4 text-center">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Iconify
              icon="mdi:eye-outline"
              width={20}
            />
            <span className="text-sm font-medium">Read-only mode</span>
          </div>
          {joinError ? (
            <div className="bg-red-100 dark:bg-red-900/75 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg">
              Unauthorized: {joinError}
            </div>
          ) : (
            <button
              onClick={handleJoinRoom}
              disabled={isJoining}
              className={`${
                isJoining
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-75'
                  : 'bg-gray-800 dark:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-300'
              } text-white dark:text-gray-900 px-6 py-2 rounded-lg transition-colors flex items-center gap-2`}
            >
              {isJoining ? (
                <>
                  <span className="animate-spin text-sm">⟳</span>
                  <span>Joining...</span>
                </>
              ) : (
                'Join Room'
              )}
            </button>
          )}
        </div>
      ) : (
        <>
          <AuthorizationRequests />

          {/* Todo Widget integrated with text field */}
          <TodoWidget threadId={threadId} mode={mode} />

          <div
            className={`relative flex flex-col gap-2 transition-colors duration-200 ${
              mode === 'mobile'
                ? 'w-full max-w-full bg-white/95 dark:bg-[#1c1c1c]/95 backdrop-blur-xl rounded-t-2xl border-t border-gray-200/50 dark:border-gray-700/50'
                : `w-full max-w-[700px] mx-auto pb-2 pt-3 ${
                  hasTasks ? 'rounded-b-3xl border-x border-b' : 'rounded-3xl border'
                } bg-white/90 dark:bg-[#1c1c1c] hover:bg-white/95 dark:hover:bg-[#1c1c1c] focus-within:bg-white/95 dark:focus-within:bg-[#1c1c1c] backdrop-blur-lg border-gray-200/30 dark:border-gray-700/30`
            }`}
            style={
              mode === 'mobile'
                ? {
                    padding: '12px 12px 0 12px',
                    paddingBottom: isIOS()
                      ? isKeyboardOpen
                        ? '4px'
                        : '14px'
                      : 'max(10px, env(safe-area-inset-bottom))',
                    transform: 'translate3d(0, 0, 0)',
                    WebkitTransform: 'translate3d(0, 0, 0)',
                    willChange: 'transform',
                    WebkitBackdropFilter: 'blur(20px)',
                  }
                : undefined
            }
          >
            {renderCredits && <CreditWallet />}
            {attachments?.length > 0 && (
              <div className="flex w-full overflow-x-auto space-x-3 px-4">
                {attachments.map((attachment, index) => {
                  const isImage = attachment.mime_type?.startsWith('image/');
                  const isPDF = attachment.mime_type === 'application/pdf';
                  const isVideo = attachment.mime_type?.startsWith('video/');
                  const isAudio = attachment.mime_type?.startsWith('audio/');
                  const isDocument = [
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain',
                  ].includes(attachment.mime_type);
                  const isSpreadsheet = [
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  ].includes(attachment.mime_type);
                  const isCSV =
                    attachment.mime_type === 'text/csv' ||
                    attachment.file_name?.toLowerCase().endsWith('.csv');

                  const getFileIcon = () => {
                    if (isPDF) return 'mdi:file-pdf-box';
                    if (isVideo) return 'mdi:video';
                    if (isAudio) return 'mdi:music';
                    if (isDocument) return 'mdi:file-document';
                    if (isSpreadsheet || isCSV) return 'mdi:file-excel';
                    return 'mdi:file';
                  };

                  return (
                    <div
                      key={`${attachment.file_name}_${index}`}
                      className="relative h-14 min-w-[200px] max-w-[280px] flex-shrink-0 rounded-lg overflow-hidden group cursor-pointer bg-gray-50 dark:bg-gray-800/50 shadow-sm border border-gray-200 dark:border-gray-700"
                      title={attachment.file_name}
                    >
                      {/* Preview Content */}
                      {isImage ? (
                        <div className="flex items-center h-full">
                          <div className="w-12 h-12 ml-3 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={attachment.preview}
                              alt={attachment.file_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full items-center justify-center hidden">
                              <Iconify
                                icon="mdi:image-broken-variant"
                                className="text-xl text-gray-600 dark:text-gray-300"
                              />
                            </div>
                          </div>
                          <div className="flex-1 px-3 min-w-0">
                            <span className="text-sm text-gray-700 dark:text-gray-200 truncate block font-medium">
                              {attachment.file_name}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center h-full">
                          <div className="w-12 h-12 ml-3 flex items-center justify-center">
                            <Iconify
                              icon={getFileIcon()}
                              className="text-2xl text-gray-600 dark:text-gray-300"
                            />
                          </div>
                          <div className="flex-1 px-3 min-w-0">
                            <span className="text-sm text-gray-700 dark:text-gray-200 truncate block font-medium">
                              {attachment.file_name}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/50 transition-colors"></div>

                      {/* Remove Button (hover) */}
                      <Tooltip title={translate('room.removeFile')}>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleRemoveAttachment(index)}
                          size="small"
                          color="error"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            opacity: 0,
                            transition: 'opacity 0.2s ease-in-out',
                            zIndex: 20,
                            '&:hover': {
                              backgroundColor: 'rgba(220, 38, 38, 0.8)',
                              color: 'white',
                            },
                            '.group:hover &': {
                              opacity: 1,
                            },
                          }}
                        >
                          <Iconify
                            icon="mdi:close"
                            width={16}
                            height={16}
                          />
                        </IconButton>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex flex-col w-full relative py-1 px-4">
              <div>
                <Editor
                  key={`${threadId}_${messageId}`}
                  threadId={threadId}
                  disabled={isViewer}
                  editorRef={editorRef}
                  placeholder={translate('room.askAnything')}
                  setEditorEmpty={setEditorEmpty}
                  setAttachments={setAttachments}
                  autoFocus={false}
                />
              </div>
            </div>
            {!isViewer && (mode === 'standard' || mode === 'mobile') && (
              <div className="px-4">
                <AttachmentHandler
                  isSendEnabled={isSendEnabled}
                  onSendMessage={editorRef.current.sendMessage}
                  attachments={attachments}
                  threadId={threadId}
                  setAttachments={setAttachments}
                  containerRef={containerRef}
                  editorRef={editorRef}
                  mode={mode}
                  mobileActiveView={mobileActiveView}
                  onMobileToggle={onMobileToggle}
                  selectedAgent={selectedAgent}
                  setSelectedAgent={setSelectedAgent}
                  agents={agents}
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default memo(FloatingTextArea);
