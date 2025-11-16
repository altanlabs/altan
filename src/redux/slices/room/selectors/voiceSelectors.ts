/**
 * Voice Selectors
 * Selectors for voice conversation state
 */
import { createSelector } from '@reduxjs/toolkit';

import type { RootState, VoiceConversationsState, VoiceConversation } from '../types/state';

export const selectVoiceConversations = (state: RootState): VoiceConversationsState =>
  state.room._voice.voiceConversations;

export const selectVoiceConversationByThreadId = (
  threadId: string,
): ReturnType<typeof createSelector> =>
  createSelector(
    [selectVoiceConversations],
    (voiceConversations: VoiceConversationsState): VoiceConversation | null =>
      voiceConversations.byThreadId[threadId] || null,
  );

export const selectIsVoiceActive = (
  threadId: string,
): ReturnType<typeof createSelector> =>
  createSelector(
    [selectVoiceConversations],
    (voiceConversations: VoiceConversationsState): boolean =>
      !!voiceConversations.byThreadId[threadId]?.isActive,
  );

export const selectIsVoiceConnecting = (state: RootState): boolean =>
  selectVoiceConversations(state).isConnecting;

