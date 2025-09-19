import { IconButton, Menu, MenuItem, Typography, Button, Box } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import React, { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useHistory, useParams } from 'react-router-dom';

import ThreadMessages from './ThreadMessages.jsx';
import useResponsive from '../../../hooks/useResponsive';
import useLocales from '../../../locales/useLocales';
import { useWebSocket } from '../../../providers/websocket/WebSocketProvider.jsx';
import { checkObjectsEqual } from '../../../redux/helpers/memoize';
import {
  fetchThread,
  makeSelectThread,
  readThread,
  selectRoom,
  selectThreadDrawerDetails,
  makeSelectSortedThreadMessageIds,
  sendMessage,
  selectMembers,
  selectIsVoiceActive,
  selectIsVoiceConnecting,
} from '../../../redux/slices/room';
import { selectTasksExpanded } from '../../../redux/slices/tasks';
import { dispatch, useSelector } from '../../../redux/store.js';
import { useVoiceConversationHandler } from '../../attachment/hooks/useVoiceConversation.js';
import FloatingTextArea from '../../FloatingTextArea.jsx';
import Iconify from '../../iconify/Iconify.jsx';
import { getMemberDetails } from '../utils.js';

const makeSelectThreadById = () =>
  createSelector(
    [makeSelectThread()],
    (thread) => {
      if (!thread) {
        return thread;
      }
      return {
        is_main: thread.is_main,
        name: thread.name,
        id: thread.id,
      };
    },
    {
      memoizeOptions: {
        resultEqualityCheck: checkObjectsEqual,
      },
    },
  );

const Thread = ({
  mode = 'main',
  tId = null,
  containerRef = null,
  hideInput = false,
  title = null,
  description = null,
  suggestions = [],
  renderCredits = false,
  renderFeedback = false,
}) => {
  const { gateId } = useParams();
  const history = useHistory();
  const { isOpen } = useWebSocket();
  const [lastThreadId, setLastThreadId] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);

  const room = useSelector(selectRoom);
  const drawer = useSelector(selectThreadDrawerDetails);
  const isMobile = useResponsive('down', 'md');
  const { translate, currentLang, allLangs, onChangeLang } = useLocales();

  // Voice-related selectors and hooks
  const members = useSelector(selectMembers);
  const isVoiceActive = useSelector((state) => selectIsVoiceActive(tId || drawer.current)(state));
  const isVoiceConnecting = useSelector(selectIsVoiceConnecting);
  const { startVoiceCall, stopVoiceCall } = useVoiceConversationHandler(tId || drawer.current);

  // Get agents from room members for voice functionality
  const agents = Object.values(members.byId || {})
    .filter((member) => member?.member?.member_type === 'agent')
    .map((member) => getMemberDetails(member));

  const threadSelector = useMemo(makeSelectThreadById, []);
  const thread = useSelector((state) =>
    threadSelector(state, mode === 'drawer' ? drawer.current : tId),
  );
  const todoExpanded = useSelector(selectTasksExpanded(tId || drawer.current));
  const threadId = thread?.id;
  // Debug logging for padding calculation
  const calculatedPaddingBottom = isMobile
    ? '120px'
    : !hideInput
      ? todoExpanded
        ? '300px'
        : '120px'
      : '0px';
  const isCreation = mode === 'drawer' && drawer.isCreation;
  const messageId = mode === 'drawer' && isCreation ? drawer.messageId : null;

  // Check if voice is enabled
  const isVoiceEnabled = room?.policy?.voice_enabled;

  // Language menu handlers
  const handleLanguageMenuOpen = useCallback((event) => {
    setLanguageMenuAnchor(event.currentTarget);
  }, []);

  const handleLanguageMenuClose = useCallback(() => {
    setLanguageMenuAnchor(null);
  }, []);

  const handleLanguageChange = useCallback(
    (langValue) => {
      onChangeLang(langValue);
      handleLanguageMenuClose();

      // If voice is currently active, restart the call with the new language
      if (isVoiceActive && agents.length > 0) {
        // Stop current call and restart with new language
        stopVoiceCall();
        // Add a small delay to ensure cleanup is complete before restarting
        setTimeout(() => {
          startVoiceCall(agents, agents[0]);
        }, 1000);
      }
    },
    [onChangeLang, handleLanguageMenuClose, isVoiceActive, agents, stopVoiceCall, startVoiceCall],
  );

  // Voice call handler
  const handleStartVoiceCall = useCallback(() => {
    if (agents.length > 0) {
      startVoiceCall(agents, agents[0]); // Use first available agent
    }
  }, [agents, startVoiceCall]);

  // INITIALIZATION LOGIC
  useEffect(() => {
    if (!!threadId && threadId !== lastThreadId && !isCreation && !!isOpen) {
      setLastThreadId(threadId);
      setHasLoaded(false); // Reset loading state

      dispatch(fetchThread({ threadId }))
        .then((response) => {
          if (!response) {
            history.replace('/404');
          } else {
            // Set hasLoaded immediately when thread is fetched successfully
            // The ThreadMessages component will handle its own loading state
            setHasLoaded(true);
          }
        })
        .catch((error) => {
          console.error('🧵 Error fetching thread:', error);
          history.replace('/404');
        });
    } else if (!threadId || isCreation) {
      console.log('🧵 No threadId or in creation mode, setting hasLoaded to true immediately');
      // If no threadId or in creation mode, mark as loaded immediately
      // so empty state can show
      setHasLoaded(true);
    } else {
    }
  }, [threadId, isCreation, isOpen]);

  const helmetName = thread?.is_main
    ? room?.name || 'Room'
    : `${thread?.name || 'Thread'} | ${room?.name || 'Room'}`;

  // Get message IDs to check if the thread has messages
  const messagesIdsSelector = useMemo(makeSelectSortedThreadMessageIds, []);
  const messageIds = useSelector((state) => messagesIdsSelector(state, threadId));
  const hasMessages = messageIds && messageIds.length > 0;

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion) => {
      if (threadId) {
        dispatch(
          sendMessage({
            threadId,
            content: suggestion,
            attachments: [],
          }),
        );
      }
    },
    [threadId],
  );

  // Determine empty state message based on voice status
  const getEmptyStateTitle = () => {
    if (isVoiceConnecting) {
      return translate('room.startTalking') || 'Start talking...';
    }
    return title || translate('room.howCanIHelp');
  };

  return (
    <>
      <Helmet>
        <title>
          {helmetName} |{' '}
        </title>
      </Helmet>
      {/* Main container with flex layout for proper centering in empty state */}
      <div
        className="h-full"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          ...(!hasMessages
            ? {
                justifyContent: 'center',
                alignItems: 'center',
              }
            : {}),
        }}
      >
        {/* Thread messages container - always show unless explicitly no messages in main mode */}
        <div
          style={{
            height: mode === 'drawer' ? 'calc(100% - 100px)' : '100%',
            overflowY: 'auto',
            position: 'relative',
            width: '100%',
            // Add bottom padding: always on mobile (fixed FloatingTextArea), or on desktop when input shown
            // Extra padding when TodoWidget is expanded
            paddingBottom: calculatedPaddingBottom,
            // Only hide if we're certain there are no messages AND not in drawer mode
            ...(!hasMessages ? { display: 'none' } : {}),
          }}
          className="no-scrollbar"
        >
          <ThreadMessages
            mode={mode}
            tId={tId}
            hasLoaded={hasLoaded}
            setHasLoaded={setHasLoaded}
            renderFeedback={renderFeedback}
          />
        </div>

        {/* Centered content for empty state (mobile and desktop) */}
        {!hasMessages && (
          <div className="text-center mb-8 flex-shrink-0 max-w-2xl mx-auto px-4">
            <h1 className="text-3xl font-normal text-gray-800 dark:text-gray-200 mb-4">
              {getEmptyStateTitle()}
            </h1>
            {description && !isVoiceConnecting && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{description}</p>
            )}

            {/* Voice Mode UI - Language Selector and Voice Shortcut */}
            {isVoiceEnabled && !isVoiceConnecting && (
              <div className="flex items-center justify-center gap-4 mb-6">
                {/* Language Selector */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    onClick={handleLanguageMenuOpen}
                    sx={{
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Iconify
                      icon={currentLang.icon}
                      sx={{ width: 20, height: 20 }}
                    />
                  </IconButton>

                  <Menu
                    anchorEl={languageMenuAnchor}
                    open={Boolean(languageMenuAnchor)}
                    onClose={handleLanguageMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                  >
                    {allLangs.map((option) => (
                      <MenuItem
                        key={option.value}
                        selected={option.value === currentLang.value}
                        onClick={() => handleLanguageChange(option.value)}
                        sx={{
                          py: 1,
                          px: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Iconify
                          icon={option.icon}
                          sx={{ borderRadius: 0.65, width: 24, height: 24 }}
                        />
                        <Typography variant="body2">{option.label}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>

                {/* Voice Call Shortcut */}
                {!isVoiceActive && (
                  <Button
                    onClick={handleStartVoiceCall}
                    variant="soft"
                    color="inherit"
                    startIcon={<Iconify icon="mdi:microphone" />}
                    sx={{
                      borderRadius: 3,
                      px: 2,
                      py: 1,
                    }}
                  >
                    {translate('voice.startCall') || 'Start Voice'}
                  </Button>
                )}
              </div>
            )}

            {/* Connecting State */}
            {isVoiceConnecting && (
              <div className="flex justify-center mb-6">
                <Button
                  variant="outlined"
                  disabled
                  startIcon={<div className="animate-spin">⟳</div>}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                  }}
                >
                  {translate('voice.connecting') || 'Connecting...'}
                </Button>
              </div>
            )}

            {suggestions && suggestions.length > 0 && !isVoiceConnecting && (
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input container - always at bottom of viewport */}
        <div
          className={`${
            isMobile ? 'fixed bottom-0 left-0 right-0 z-50' : 'absolute bottom-0 left-0 right-0'
          } flex items-center flex-col overflow-hidden transition-all duration-300${
            !isMobile ? ' px-2 py-2' : ''
          }`}
          style={{
            ...(isMobile ? { backgroundColor: 'transparent' } : {}),
          }}
        >
          {!hideInput && (
            <FloatingTextArea
              threadId={threadId}
              messageId={isCreation ? messageId || 'orphan_thread' : null}
              containerRef={containerRef}
              roomId={room?.id}
              mode={isMobile ? 'mobile' : 'standard'}
              renderCredits={renderCredits}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default memo(Thread);
