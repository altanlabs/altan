import { useCallback } from 'react';

import { useVoiceConversation as useVoiceProvider } from '../../../providers/voice/VoiceConversationProvider';
import {
  startVoiceConversation,
  stopVoiceConversation,
  setVoiceConversationConnecting,
  selectIsVoiceActive,
  selectIsVoiceConnecting,
  selectMembers,
  sendMessage,
  sendAgentMessage,
} from '../../../redux/slices/room';
import { useSelector, dispatch } from '../../../redux/store';
import { optimai_room } from '../../../utils/axios';
import { useSnackbar } from '../../snackbar';
import useLocales from '../../../locales/useLocales';

// Utility function to update thread voice status
const updateThreadVoiceStatus = async (threadId, voiceMode) => {
  try {
    console.log(
      `🎤 [updateThreadVoiceStatus] Setting voice mode to ${voiceMode} for thread ${threadId}`,
    );
    await optimai_room.patch(`/thread/${threadId}/voice-status`, {
      voice_mode: voiceMode,
      expires_in: 3600, // 1 hour expiration
    });
    console.log(`✅ [updateThreadVoiceStatus] Successfully updated voice status to ${voiceMode}`);
  } catch (error) {
    console.error('❌ [updateThreadVoiceStatus] Failed to update voice status:', error);
    // Don't throw error to prevent blocking voice conversation flow
  }
};

export const useVoiceConversationHandler = (threadId) => {
  const { enqueueSnackbar } = useSnackbar();
  const { currentLang } = useLocales();
  const members = useSelector(selectMembers);
  const isVoiceActive = useSelector((state) => selectIsVoiceActive(threadId)(state));
  const isVoiceConnecting = useSelector(selectIsVoiceConnecting);
  const { startConversation, stopConversation, conversation } = useVoiceProvider();

  // Get voice enabled agent logic
  const getVoiceEnabledAgent = useCallback(
    (agents, selectedAgent) => {
      console.log('🔍 [useVoiceConversation] Debugging agent structure:', {
        agents,
        members: members.byId,
        selectedAgent,
      });

      // Filter agents with voice capabilities (elevenlabs_id)
      const voiceAgents = agents.filter((agent) => {
        const originalMember = members.byId[agent.id];
        console.log('🔍 [useVoiceConversation] Checking agent:', {
          agentId: agent.id,
          originalMember,
          memberPath: originalMember?.member,
          agentPath: originalMember?.member?.agent,
          elevenlabsId: originalMember?.member?.agent?.elevenlabs_id,
          fullOriginalMember: JSON.stringify(originalMember, null, 2),
        });
        const elevenlabsId = originalMember?.member?.agent?.elevenlabs_id;
        // Also check if elevenlabs_id is directly on the agent object
        const directElevenlabsId = agent.elevenlabs_id;
        const finalElevenlabsId = elevenlabsId || directElevenlabsId;

        console.log('🔍 [useVoiceConversation] ElevenLabs ID check:', {
          pathElevenlabsId: elevenlabsId,
          directElevenlabsId,
          finalElevenlabsId,
        });

        return !!finalElevenlabsId;
      });

      console.log('🔍 [useVoiceConversation] Voice enabled agents:', voiceAgents);

      if (voiceAgents.length === 0) {
        console.warn('🔍 [useVoiceConversation] No voice-enabled agents found');
        return null;
      }

      if (voiceAgents.length === 1) {
        console.log('✅ [useVoiceConversation] Auto-selecting single voice agent:', voiceAgents[0]);
        return voiceAgents[0];
      }

      // Multiple agents - check if selected agent has voice
      if (selectedAgent) {
        const selectedHasVoice = voiceAgents.find((agent) => agent.id === selectedAgent.id);
        if (selectedHasVoice) {
          console.log('✅ [useVoiceConversation] Using selected voice agent:', selectedHasVoice);
          return selectedHasVoice;
        }
      }

      console.log('⚠️ [useVoiceConversation] Multiple voice agents available, none selected');
      return null;
    },
    [members],
  );

  // Handle voice messages
  const handleVoiceMessage = useCallback(
    (message, targetAgent) => {
      console.log('🎯 [useVoiceConversation] handleVoiceMessage called with threadId:', threadId);
      if (!threadId) {
        console.error('❌ [useVoiceConversation] No threadId provided, exiting');
        return;
      }

      console.log('🎙️ [useVoiceConversation] RAW MESSAGE FROM ELEVENLABS:', {
        rawMessage: message,
        messageType: message?.type,
        messageKeys: Object.keys(message || {}),
        fullMessageStructure: JSON.stringify(message, null, 2),
        currentThreadId: threadId,
      });

      try {
        // Handle the actual ElevenLabs message format: { source: 'user'|'ai', message: 'content' }
        if (message.source === 'user') {
          console.log('🗣️ [useVoiceConversation] Processing user transcript...');

          const transcript = message.message;
          console.log('🔍 [useVoiceConversation] Extracted transcript:', {
            transcript,
            transcriptType: typeof transcript,
            transcriptLength: transcript?.length,
            trimmedLength: transcript?.trim()?.length,
            passesCheck: !!transcript?.trim(),
          });

          if (transcript?.trim()) {
            dispatch(
              sendMessage({
                threadId,
                content: transcript,
                attachments: [],
              }),
            );
          } else {
            console.warn('⚠️ [useVoiceConversation] User transcript failed validation:', {
              transcript,
            });
          }
        } else if (message.source === 'ai') {
          const response = message.message;

          if (response?.trim()) {
            // Get the actual agent ID from the original member data (same place as elevenlabs_id)
            const originalMember = members.byId[targetAgent.id];
            const actualAgentId = originalMember?.member?.agent?.id;
            console.log('🤖 [useVoiceConversation] Sending agent response as agent message:', {
              response,
              threadId,
              agentId: actualAgentId,
              targetAgentId: targetAgent.id,
              originalMember: originalMember,
              timestamp: new Date().toISOString(),
            });
            dispatch(
              sendAgentMessage({
                threadId,
                content: response,
                attachments: [],
                agentId: actualAgentId,
              }),
            );
          } else {
            console.warn('⚠️ [useVoiceConversation] Agent response failed validation:', {
              response,
            });
          }
        } else {
          console.log('🔄 [useVoiceConversation] Unknown message source:', message.source);
        }
      } catch (error) {
        console.error('❌ [useVoiceConversation] Error handling voice message:', error);
      }
    },
    [threadId],
  );

  // Start voice call
  const startVoiceCall = useCallback(
    async (agents, selectedAgent) => {
      console.log('agents', agents);
      console.log('selectedAgent', selectedAgent);
      const targetAgent = getVoiceEnabledAgent(agents, selectedAgent);
      console.log('targetAgent', targetAgent);
      if (!targetAgent) {
        enqueueSnackbar(
          agents.length === 0
            ? 'No agents available for voice conversation'
            : 'Please select an agent with voice capabilities',
          { variant: 'warning' },
        );
        return;
      }

      // Get elevenlabs_id from original member data or directly from agent
      const originalMember = members.byId[targetAgent.id];
      const elevenlabsId = originalMember?.member?.agent?.elevenlabs_id || targetAgent.elevenlabs_id;

      if (!elevenlabsId) {
        enqueueSnackbar('Selected agent does not have voice capabilities', { variant: 'error' });
        return;
      }

      try {
        dispatch(setVoiceConversationConnecting({ threadId, isConnecting: true }));

        // Prepare language overrides for elevenlabs
        const languageOverrides = {};
        const agentVoiceConfig = originalMember?.member?.agent?.voice;

        // Use current UI language for the conversation
        const uiLanguage = currentLang.value;
        console.log('🌍 [useVoiceConversation] Setting voice language to:', uiLanguage);

        // Check if agent has language-specific presets
        const languagePresets = agentVoiceConfig?.meta_data?.language_presets;
        if (languagePresets && languagePresets[uiLanguage]) {
          console.log('🔧 [useVoiceConversation] Found language preset for:', uiLanguage);
          languageOverrides.overrides = languagePresets[uiLanguage].overrides;
        } else {
          // Fallback to setting language in agent overrides
          languageOverrides.overrides = {
            agent: {
              language: uiLanguage,
            },
            tts: {
              meta_data: {
                language: uiLanguage,
              },
            },
          };
          console.log(
            '🔧 [useVoiceConversation] Using fallback language override for:',
            uiLanguage,
          );
        }

        // Start ElevenLabs conversation with language overrides
        await startConversation({
          agentId: elevenlabsId,
          ...languageOverrides,
          onConnect: () => {
            dispatch(
              startVoiceConversation({
                threadId,
                agentId: targetAgent.id,
                elevenlabsId,
              }),
            );
            // Update thread voice status to active
            updateThreadVoiceStatus(threadId, true);
          },
          onDisconnect: () => {
            dispatch(stopVoiceConversation({ threadId }));
            // Update thread voice status to inactive
            updateThreadVoiceStatus(threadId, false);
          },
          onMessage: (message) => {
            handleVoiceMessage(message, targetAgent);
          },
          onError: (error) => {
            enqueueSnackbar(`Voice conversation error: ${error.message}`, { variant: 'error' });
            dispatch(stopVoiceConversation({ threadId }));
          },
        });
      } catch (error) {
        enqueueSnackbar(`Failed to start voice conversation: ${error.message}`, {
          variant: 'error',
        });
        dispatch(stopVoiceConversation({ threadId }));
      }
    },
    [
      threadId,
      getVoiceEnabledAgent,
      startConversation,
      enqueueSnackbar,
      members,
      handleVoiceMessage,
      currentLang,
    ],
  );

  // Stop voice call
  const stopVoiceCall = useCallback(() => {
    console.log('🎤 [useVoiceConversation] Stopping voice conversation');

    try {
      stopConversation();
    } catch (error) {
      console.error('🎤 [useVoiceConversation] Error ending voice session:', error);
    }

    dispatch(stopVoiceConversation({ threadId }));
    // Update thread voice status to inactive
    updateThreadVoiceStatus(threadId, false);
  }, [threadId, stopConversation]);

  return {
    isVoiceActive,
    isVoiceConnecting,
    conversation,
    startVoiceCall,
    stopVoiceCall,
    getVoiceEnabledAgent,
  };
};
