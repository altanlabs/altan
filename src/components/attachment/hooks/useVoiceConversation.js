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
import { useSnackbar } from '../../snackbar';

export const useVoiceConversationHandler = (threadId) => {
  const { enqueueSnackbar } = useSnackbar();
  const members = useSelector(selectMembers);
  const isVoiceActive = useSelector((state) => selectIsVoiceActive(threadId)(state));
  const isVoiceConnecting = useSelector(selectIsVoiceConnecting);
  const { startConversation, stopConversation, conversation } = useVoiceProvider();

  // Get voice enabled agent logic
  const getVoiceEnabledAgent = useCallback(
    (agents, selectedAgent) => {
      console.log('🔍 [useVoiceConversation] Getting voice enabled agent');
      console.log('🔍 [useVoiceConversation] Available agents:', agents);
      console.log('🔍 [useVoiceConversation] Selected agent:', selectedAgent);
      console.log('🔍 [useVoiceConversation] Members state:', members);

      // Filter agents with voice capabilities (elevenlabs_id)
      const voiceAgents = agents.filter((agent) => {
        const originalMember = members.byId[agent.id];
        const elevenlabsId = originalMember?.member?.agent?.elevenlabs_id;

        console.log('🔍 [useVoiceConversation] Checking agent voice capability:', {
          agentId: agent?.id,
          agentName: agent?.name,
          originalMember,
          elevenlabsId,
          transformedAgent: agent,
        });
        return !!elevenlabsId;
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
            console.log('✅ [useVoiceConversation] Sending user transcript as message:', {
              transcript,
              threadId,
              timestamp: new Date().toISOString(),
            });
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
          console.log('🤖 [useVoiceConversation] Processing agent response...');

          const response = message.message;
          console.log('🔍 [useVoiceConversation] Extracted response:', {
            response,
            responseType: typeof response,
            responseLength: response?.length,
            trimmedLength: response?.trim()?.length,
            passesCheck: !!response?.trim(),
          });

          if (response?.trim()) {
            // Get the actual agent ID from the original member data (same place as elevenlabs_id)
            const originalMember = members.byId[targetAgent.id];
            const actualAgentId = originalMember?.member?.agent?.id;

            console.log('✅ [useVoiceConversation] Sending agent response as agent message:', {
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
      const targetAgent = getVoiceEnabledAgent(agents, selectedAgent);

      if (!targetAgent) {
        enqueueSnackbar(
          agents.length === 0
            ? 'No agents available for voice conversation'
            : 'Please select an agent with voice capabilities',
          { variant: 'warning' },
        );
        return;
      }

      // Get elevenlabs_id from original member data
      const originalMember = members.byId[targetAgent.id];
      const elevenlabsId = originalMember?.member?.agent?.elevenlabs_id;

      if (!elevenlabsId) {
        enqueueSnackbar('Selected agent does not have voice capabilities', { variant: 'error' });
        return;
      }

      console.log('🎤 [useVoiceConversation] Starting voice conversation with agent:', {
        agentId: targetAgent.id,
        agentName: targetAgent.name,
        elevenlabsId,
        originalMember,
        threadId: threadId,
      });

      try {
        dispatch(setVoiceConversationConnecting({ threadId, isConnecting: true }));

        // Start ElevenLabs conversation
        await startConversation({
          agentId: elevenlabsId,
          onConnect: () => {
            console.log('🎤 [useVoiceConversation] Voice conversation connected');
            dispatch(
              startVoiceConversation({
                threadId,
                agentId: targetAgent.id,
                elevenlabsId,
              }),
            );
          },
          onDisconnect: () => {
            console.log('🎤 [useVoiceConversation] Voice conversation disconnected');
            dispatch(stopVoiceConversation({ threadId }));
          },
                  onMessage: (message) => {
          console.log('🎤 [useVoiceConversation] Voice message received:', message);
          console.log('🎤 [useVoiceConversation] Active conversation details:', {
            conversationId: conversation?.getId?.(),
            status: conversation?.status,
            isSpeaking: conversation?.isSpeaking,
          });
          handleVoiceMessage(message, targetAgent);
        },
          onError: (error) => {
            console.error('🎤 [useVoiceConversation] Voice conversation error:', error);
            enqueueSnackbar(`Voice conversation error: ${error.message}`, { variant: 'error' });
            dispatch(stopVoiceConversation({ threadId }));
          },
        });
      } catch (error) {
        console.error('🎤 [useVoiceConversation] Failed to start voice conversation:', error);
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
