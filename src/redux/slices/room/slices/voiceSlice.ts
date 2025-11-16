/**
 * Voice Slice
 * Manages voice conversation state
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { VoiceConversationsState, StartVoiceConversationPayload } from '../types/state';

interface VoiceState {
  voiceConversations: VoiceConversationsState;
}

const initialState: VoiceState = {
  voiceConversations: {
    byThreadId: {},
    isConnecting: false,
  },
};

const voiceSlice = createSlice({
  name: 'room/voice',
  initialState,
  reducers: {
    startVoiceConversation: (state, action: PayloadAction<StartVoiceConversationPayload>) => {
      const { threadId, agentId, elevenlabsId, conversation } = action.payload;
      state.voiceConversations.byThreadId[threadId] = {
        isActive: true,
        agentId,
        elevenlabsId,
        conversation,
        startedAt: new Date().toISOString(),
      };
      state.voiceConversations.isConnecting = false;
    },

    setVoiceConversationConnecting: (
      state,
      action: PayloadAction<{ threadId: string; isConnecting: boolean }>,
    ) => {
      const { threadId, isConnecting } = action.payload;
      state.voiceConversations.isConnecting = isConnecting;
      if (isConnecting && !state.voiceConversations.byThreadId[threadId]) {
        state.voiceConversations.byThreadId[threadId] = {
          isActive: false,
          agentId: null,
          elevenlabsId: null,
          conversation: null,
        };
      }
    },

    stopVoiceConversation: (state, action: PayloadAction<{ threadId: string }>) => {
      const { threadId } = action.payload;
      if (state.voiceConversations.byThreadId[threadId]) {
        delete state.voiceConversations.byThreadId[threadId];
      }
      state.voiceConversations.isConnecting = false;
    },

    updateVoiceConversation: (
      state,
      action: PayloadAction<{ threadId: string; updates: Partial<any> }>,
    ) => {
      const { threadId, updates } = action.payload;
      if (state.voiceConversations.byThreadId[threadId]) {
        Object.assign(state.voiceConversations.byThreadId[threadId], updates);
      }
    },
  },
});

export const {
  startVoiceConversation,
  setVoiceConversationConnecting,
  stopVoiceConversation,
  updateVoiceConversation,
} = voiceSlice.actions;

export default voiceSlice.reducer;

