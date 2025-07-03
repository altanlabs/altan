import { Capacitor } from '@capacitor/core';
import { MenuItem, Typography, Menu, Alert } from '@mui/material';
import axios from 'axios';
import React, { memo, useState, useCallback, useEffect } from 'react';

import Iconify from '../../../components/iconify';
import { useLocales } from '../../../locales';
import { useVoiceConversation } from '../../../providers/voice/VoiceConversationProvider';

// Helper function to detect Capacitor native platform
const isCapacitorNative = () => {
  try {
    const result = Capacitor.isNativePlatform();
    console.log('⚡ [VoiceConversation] Capacitor Native Detection:', { result, platform: Capacitor.getPlatform() });
    return result;
  } catch (error) {
    console.log('⚡ [VoiceConversation] Capacitor not available:', error);
    return false;
  }
};

// Helper function to detect iOS
const isIOS = () => {
  const result = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
         (isCapacitorNative() && Capacitor.getPlatform() === 'ios');
  console.log('🍎 [VoiceConversation] iOS Detection:', { result, userAgent: navigator.userAgent, platform: navigator.platform, capacitorPlatform: isCapacitorNative() ? Capacitor.getPlatform() : 'none' });
  return result;
};

// Helper function to detect mobile browsers
const isMobile = () => {
  const result = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (isCapacitorNative() && ['ios', 'android'].includes(Capacitor.getPlatform()));
  console.log('📱 [VoiceConversation] Mobile Detection:', { result, userAgent: navigator.userAgent, capacitorPlatform: isCapacitorNative() ? Capacitor.getPlatform() : 'none' });
  return result;
};

// Helper function to check if browser supports required features
const checkBrowserSupport = () => {
  const issues = [];

  console.log('🔍 [VoiceConversation] Checking browser support...');

  // Skip strict browser checks for Capacitor native apps
  if (isCapacitorNative()) {
    console.log('⚡ [VoiceConversation] Capacitor native app detected, skipping browser compatibility checks');
    console.log('🔍 [VoiceConversation] Capacitor platform:', Capacitor.getPlatform());
    return []; // Assume Capacitor WebView supports required features
  }

  if (!navigator.mediaDevices) {
    issues.push('MediaDevices API not supported');
    console.error('❌ [VoiceConversation] MediaDevices API not supported');
  } else {
    console.log('✅ [VoiceConversation] MediaDevices API available');
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    issues.push('getUserMedia not supported');
    console.error('❌ [VoiceConversation] getUserMedia not supported');
  } else {
    console.log('✅ [VoiceConversation] getUserMedia available');
  }

  if (!window.AudioContext && !window.webkitAudioContext) {
    issues.push('Web Audio API not supported');
    console.error('❌ [VoiceConversation] Web Audio API not supported');
  } else {
    console.log('✅ [VoiceConversation] Web Audio API available');
  }

  console.log('🔍 [VoiceConversation] Browser support check complete:', { issues });
  return issues;
};

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
  console.log('🎤 [VoiceConversation] Component initialized with props:', {
    altanAgentId,
    elevenlabsId,
    agentName,
    initialLanguage,
    showLanguageSelector,
    displayAvatar,
    dynamicVariables,
  });

  const { currentLang, onChangeLang, allLangs, translate } = useLocales();
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
  const [fetchedAgent, setFetchedAgent] = useState(null);
  const [fetchingAgent, setFetchingAgent] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [browserCompatibilityError, setBrowserCompatibilityError] = useState(null);
  const [userInteractionRequired, setUserInteractionRequired] = useState(false);

  // Use prop language or fallback to current locale language
  const effectiveLanguage = currentLang.value || initialLanguage;

  const {
    isConnected,
    isConnecting,
    startConversation,
    stopConversation,
  } = useVoiceConversation();

  console.log('🎤 [VoiceConversation] Voice conversation state:', {
    isConnected,
    isConnecting,
    effectiveLanguage,
  });

  // Check browser compatibility on mount
  useEffect(() => {
    console.log('🔄 [VoiceConversation] Component mounted, checking compatibility...');

    const supportIssues = checkBrowserSupport();
    if (supportIssues.length > 0) {
      console.error('❌ [VoiceConversation] Browser compatibility issues found:', supportIssues);
      setBrowserCompatibilityError(`Browser compatibility issues: ${supportIssues.join(', ')}`);
      return;
    }

    // For iOS, show user interaction requirement message
    if (isIOS() || isMobile()) {
      console.log('📱 [VoiceConversation] Mobile/iOS detected, requiring user interaction');
      setUserInteractionRequired(true);
    }
  }, []);

  // Fetch agent data when altanAgentId is provided but elevenlabsId is not
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!altanAgentId || elevenlabsId) {
        console.log('⏭️ [VoiceConversation] Skipping agent fetch:', { altanAgentId, elevenlabsId });
        return; // Don't fetch if we don't have altanAgentId or if we already have elevenlabsId
      }

      console.log('🔄 [VoiceConversation] Fetching agent data for:', altanAgentId);
      setFetchingAgent(true);
      setFetchError(null);

      try {
        const response = await axios.get(`https://api.altan.ai/platform/agent/${altanAgentId}/public`);
        console.log('✅ [VoiceConversation] Agent data fetched successfully:', response.data.agent);
        setFetchedAgent(response.data.agent);
      } catch (error) {
        console.error('❌ [VoiceConversation] Failed to fetch agent:', error);
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
  const effectiveAgentName = agentName || fetchedAgent?.name;

  // Determine the effective avatar URL
  const effectiveAvatarUrl = fetchedAgent?.avatar_url;

  console.log('🎯 [VoiceConversation] Effective values:', {
    effectiveElevenlabsId,
    effectiveAgentName,
    effectiveAvatarUrl,
  });

  const handleLanguageMenuOpen = useCallback((event) => {
    console.log('🌐 [VoiceConversation] Language menu opened');
    setLanguageMenuAnchor(event.currentTarget);
  }, []);

  const handleLanguageMenuClose = useCallback(() => {
    console.log('🌐 [VoiceConversation] Language menu closed');
    setLanguageMenuAnchor(null);
  }, []);

  const handleLanguageChange = useCallback((langValue) => {
    console.log('🌐 [VoiceConversation] Language changed to:', langValue);
    onChangeLang(langValue);
    handleLanguageMenuClose();
  }, [onChangeLang, handleLanguageMenuClose]);

  // Enhanced start conversation with iOS-specific handling
  const handleStartConversation = useCallback(async () => {
    console.log('🚀 [VoiceConversation] Starting conversation...');

    try {
      // Reset user interaction requirement
      setUserInteractionRequired(false);

      // iOS-specific microphone permission check
      if (isIOS() || isMobile()) {
        console.log('📱 [VoiceConversation] iOS/Mobile detected, testing microphone access...');

        try {
          // Test microphone access first
          const testStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });

          console.log('✅ [VoiceConversation] Microphone test successful, audio tracks:', testStream.getAudioTracks().length);

          // If successful, stop the test stream
          testStream.getTracks().forEach(track => {
            console.log('🔇 [VoiceConversation] Stopping test track:', track.kind, track.id);
            track.stop();
          });

          // Small delay to ensure cleanup
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log('⏱️ [VoiceConversation] Test stream cleanup completed');
        } catch (micError) {
          console.error('❌ [VoiceConversation] Microphone access denied:', micError);
          const errorMessage = 'Microphone access is required for voice conversations. Please allow microphone access and try again.';
          setFetchError(errorMessage);
          onError?.(new Error(errorMessage));
          return;
        }
      }

      // Start the conversation with enhanced error handling
      console.log('🎤 [VoiceConversation] Starting conversation with ElevenLabs...');
      const success = await startConversation({
        agentId: effectiveElevenlabsId,
        dynamicVariables,
        overrides: {
          agent: {
            language: effectiveLanguage,
          },
        },
        onConnect: () => {
          console.log('✅ [VoiceConversation] Voice conversation connected!');
          setFetchError(null); // Clear any previous errors
          onConnect?.();
        },
        onDisconnect: () => {
          console.log('🔌 [VoiceConversation] Voice conversation ended!');
          onDisconnect?.();
        },
        onMessage: (message) => {
          console.log('💬 [VoiceConversation] Voice message received:', message);
          onMessage?.(message);
        },
        onError: (error) => {
          console.error('❌ [VoiceConversation] Voice conversation error:', error);

          // Handle iOS-specific errors
          if (error.message?.includes('capture failure') ||
              error.message?.includes('MediaStreamTrack ended')) {
            console.warn('🍎 [VoiceConversation] iOS Safari capture failure detected');
            setFetchError('Voice connection lost. This may be due to iOS Safari limitations. Please try again.');
            setUserInteractionRequired(true);
          } else if (error.message?.includes('Permission denied') ||
                     error.message?.includes('NotAllowedError')) {
            console.warn('🚫 [VoiceConversation] Permission denied error');
            setFetchError('Microphone access denied. Please allow microphone access in your browser settings.');
          } else {
            console.error('💥 [VoiceConversation] Unknown error:', error);
            setFetchError(`Voice conversation error: ${error.message || 'Unknown error'}`);
          }

          onError?.(error);
        },
      });

      if (!success) {
        console.warn('⚠️ [VoiceConversation] Conversation start failed, requiring user interaction');
        setUserInteractionRequired(true);
      } else {
        console.log('✅ [VoiceConversation] Conversation started successfully');
      }
    } catch (error) {
      console.error('💥 [VoiceConversation] Failed to start conversation:', error);
      setFetchError(`Failed to start conversation: ${error.message}`);
      setUserInteractionRequired(true);
      onError?.(error);
    }
  }, [effectiveElevenlabsId, effectiveLanguage, dynamicVariables, startConversation, onConnect, onDisconnect, onMessage, onError]);

  // Show browser compatibility error
  if (browserCompatibilityError) {
    console.log('❌ [VoiceConversation] Rendering browser compatibility error');
    return (
      <div className="flex flex-col items-center gap-4 py-6 max-w-4xl mx-auto">
        <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
          <Typography variant="body2">
            {browserCompatibilityError}
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Please try using a modern browser like Chrome, Firefox, or Safari.
          </Typography>
        </Alert>
      </div>
    );
  }

  // Show error if agent fetch failed
  if (fetchError) {
    console.log('❌ [VoiceConversation] Rendering fetch error:', fetchError);
    return (
      <div className="flex flex-col items-center gap-4 py-6 max-w-4xl mx-auto">
        <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
          <Typography variant="body2">{fetchError}</Typography>
          {(isIOS() || isMobile()) && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              iOS/Mobile tip: Make sure microphone permissions are enabled and try tapping the button again.
            </Typography>
          )}
        </Alert>
        {userInteractionRequired && (
          <button
            onClick={handleStartConversation}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Show loading state when fetching agent data
  if (fetchingAgent && altanAgentId && !elevenlabsId) {
    console.log('⏳ [VoiceConversation] Rendering loading state');
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

  console.log('🎨 [VoiceConversation] Rendering main component');

  return (
    <div className="flex flex-col items-center gap-4 py-6 max-w-4xl mx-auto">
      {/* iOS/Mobile Warning */}
      {(isIOS() || isMobile()) && userInteractionRequired && !isConnected && (
        <Alert severity="info" sx={{ width: '100%', maxWidth: 500, mb: 2 }}>
          <Typography variant="body2">
            {isIOS() ? 'iOS Safari' : 'Mobile'} requires user interaction to access microphone.
            Tap the button below to enable voice conversation.
          </Typography>
        </Alert>
      )}

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
                    console.warn('🖼️ [VoiceConversation] Avatar image failed to load:', effectiveAvatarUrl);
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
            onClick={() => {
              console.log('🛑 [VoiceConversation] Stop conversation button clicked');
              stopConversation();
            }}
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
