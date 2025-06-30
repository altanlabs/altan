import { MenuItem, Typography, Menu } from '@mui/material';
import axios from 'axios';
import React, { memo, useState, useCallback, useEffect } from 'react';

import Iconify from '../../../components/iconify';
import { useLocales } from '../../../locales';
import { useVoiceConversation } from '../../../providers/voice/VoiceConversationProvider';

const VoiceConversation = ({
  altanAgentId = null,
  elevenlabsId = null,
  agentName = null,
  initialLanguage = null,
  showLanguageSelector = true,
  displayAvatar = false,
  dynamicVariables = {},
  onConnect,
  onDisconnect,
  onMessage,
  onError,
}) => {
  const { currentLang, onChangeLang, allLangs, translate } = useLocales();
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
  const [fetchedAgent, setFetchedAgent] = useState(null);
  const [fetchingAgent, setFetchingAgent] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Use prop language or fallback to current locale language
  const effectiveLanguage = currentLang.value || initialLanguage;

  const {
    isConnected,
    isConnecting,
    startConversation,
    stopConversation,
  } = useVoiceConversation();

  // Fetch agent data when altanAgentId is provided but elevenlabsId is not
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!altanAgentId || elevenlabsId) {
        return; // Don't fetch if we don't have altanAgentId or if we already have elevenlabsId
      }

      setFetchingAgent(true);
      setFetchError(null);

      try {
        const response = await axios.get(`https://api.altan.ai/platform/agent/${altanAgentId}/public`);
        setFetchedAgent(response.data.agent);
      } catch (error) {
        console.error('Failed to fetch agent:', error);
        setFetchError('Failed to load agent information');
      } finally {
        setFetchingAgent(false);
      }
    };

    fetchAgentData();
  }, [altanAgentId, elevenlabsId]);

  // Determine the effective elevenlabsId to use
  const effectiveElevenlabsId = elevenlabsId || fetchedAgent?.elevenlabs_id || 'agent_01jy1hqg8jehq8v9zd7j9qxa2a';

  // Determine the effective agent name to use
  const effectiveAgentName = agentName || fetchedAgent?.name ;

  // Determine the effective avatar URL
  const effectiveAvatarUrl = fetchedAgent?.avatar_url;

  const handleLanguageMenuOpen = useCallback((event) => {
    setLanguageMenuAnchor(event.currentTarget);
  }, []);

  const handleLanguageMenuClose = useCallback(() => {
    setLanguageMenuAnchor(null);
  }, []);

  const handleLanguageChange = useCallback((langValue) => {
    onChangeLang(langValue);
    handleLanguageMenuClose();
  }, [onChangeLang, handleLanguageMenuClose]);

  const handleStartConversation = useCallback(() => {
    startConversation({
      agentId: effectiveElevenlabsId,
      dynamicVariables,
      overrides: {
        agent: {
          language: effectiveLanguage,
        },
      },
      onConnect: () => {
        console.log('Voice conversation connected!');
        onConnect?.();
      },
      onDisconnect: () => {
        console.log('Voice conversation ended!');
        onDisconnect?.();
      },
      onMessage: (message) => {
        console.log('Voice message received:', message);
        onMessage?.(message);
      },
      onError: (error) => {
        console.error('Voice conversation error:', error);
        onError?.(error);
      },
    });
  }, [effectiveElevenlabsId, effectiveLanguage, dynamicVariables, startConversation, onConnect, onDisconnect, onMessage, onError]);

  // Show error if agent fetch failed
  if (fetchError) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 max-w-4xl mx-auto">
        <div className="text-red-500 text-center">
          <Typography variant="body2">{fetchError}</Typography>
        </div>
      </div>
    );
  }

  // Show loading state when fetching agent data
  if (fetchingAgent && altanAgentId && !elevenlabsId) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Loading skeleton for call button */}
          <div className="relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium backdrop-blur-md bg-gray-200/80 dark:bg-gray-700/80 p-1.5 h-auto border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-full transition-all duration-300 animate-pulse">
            <span className="me-1.5 w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
            <span className="pe-2.5 mx-auto text-gray-400 dark:text-gray-500">
              Loading
            </span>
          </div>

          {/* Loading skeleton for language selector */}
          {showLanguageSelector && (
            <div className="relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium backdrop-blur-md bg-gray-200/80 dark:bg-gray-700/80 p-1.5 h-auto border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-full transition-all duration-300 animate-pulse">
              <span className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6 max-w-4xl mx-auto">

      {/* Compact Language Switcher + Call Button Row */}
      <div className="flex items-center gap-3">
        {/* Call Button */}
        {!isConnected ? (
          <button
            onClick={handleStartConversation}
            disabled={isConnecting || fetchingAgent}
            className="relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-ring disabled:pointer-events-auto disabled:opacity-50 group backdrop-blur-md bg-white/80 dark:bg-[#1c1c1c] p-1.5 h-auto border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-full hover:bg-white/70 dark:hover:bg-gray-900/70 active:bg-white/70 dark:active:bg-gray-900/70 transition-all duration-300"
          >
            <span className="me-1.5 w-8 h-8 bg-gray-900 dark:bg-white rounded-full text-white dark:text-gray-900 flex items-center justify-center transition-all duration-300">
              {displayAvatar && effectiveAvatarUrl ? (
                <img
                  src={effectiveAvatarUrl}
                  alt={effectiveAgentName}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to SVG if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ display: displayAvatar && effectiveAvatarUrl ? 'none' : 'block' }}
              >
                <path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2"></path>
              </svg>
            </span>
            <span className="pe-2.5 mx-auto text-gray-900 dark:text-white">
              {fetchingAgent
                ? translate('voice.loading')
                : isConnecting
                  ? translate('voice.connecting')
                  : translate('voice.speakTo', { agentName: effectiveAgentName })}
            </span>
          </button>
        ) : (
          <button
            onClick={stopConversation}
            className="relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-ring disabled:pointer-events-auto disabled:opacity-50 group backdrop-blur-md bg-red-500/90 dark:bg-red-600/90 p-1.5 h-auto border border-red-400/50 dark:border-red-500/50 shadow-lg rounded-full hover:bg-red-600/90 dark:hover:bg-red-700/90 active:bg-red-600/90 dark:active:bg-red-700/90 transition-all duration-300"
          >
            <span className="me-1.5 w-8 h-8 bg-white/20 rounded-full text-white flex items-center justify-center transition-all duration-300">
              <Iconify
                icon="mdi:stop-circle"
                sx={{ width: 16, height: 16 }}
              />
            </span>
            <span className="pe-2.5 mx-auto text-white">{translate('voice.endConversation')}</span>
          </button>
        )}

        {/* Minimal Flag Selector - Matching Button Style */}
        {showLanguageSelector && (
          <>
            <button
              onClick={handleLanguageMenuOpen}
              className="relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-ring group backdrop-blur-md bg-white/80 dark:bg-[#1c1c1c] p-1.5 h-auto border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-full hover:bg-white/70 dark:hover:bg-gray-900/70 active:bg-white/70 dark:active:bg-gray-900/70 transition-all duration-300"
            >
              <span className="w-8 h-8 flex items-center justify-center">
                <Iconify
                  icon={currentLang.icon}
                  sx={{ width: 20, height: 20 }}
                />
              </span>
            </button>

            <Menu
              anchorEl={languageMenuAnchor}
              open={Boolean(languageMenuAnchor)}
              onClose={handleLanguageMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: { minWidth: 140 },
              }}
            >
              {allLangs.map((lang) => (
                <MenuItem
                  key={lang.value}
                  selected={lang.value === currentLang.value}
                  onClick={() => handleLanguageChange(lang.value)}
                  sx={{
                    py: 0.75,
                    px: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Iconify
                    icon={lang.icon}
                    sx={{ width: 18, height: 18 }}
                  />
                  <Typography variant="body2">{lang.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(VoiceConversation);
