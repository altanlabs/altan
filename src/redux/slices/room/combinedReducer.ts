/**
 * Room Reducer
 * Combines all domain slices using combineReducers
 * Each slice manages its own state independently under a prefixed key
 */
import { combineReducers } from '@reduxjs/toolkit';

import lifecycleReducer from './slices/lifecycleSlice';
import type lifecycleReducerType from './slices/lifecycleSlice';
import membersReducer from './slices/membersSlice';
import type membersReducerType from './slices/membersSlice';
import messagePartsReducer from './slices/messagePartsSlice';
import type messagePartsReducerType from './slices/messagePartsSlice';
import messagesReducer from './slices/messagesSlice';
import type messagesReducerType from './slices/messagesSlice';
import coreRoomReducer from './slices/roomSlice';
import type coreRoomReducerType from './slices/roomSlice';
import tabsReducer from './slices/tabsSlice';
import type tabsReducerType from './slices/tabsSlice';
import threadsReducer from './slices/threadsSlice';
import type threadsReducerType from './slices/threadsSlice';
import uiReducer from './slices/uiSlice';
import type uiReducerType from './slices/uiSlice';
import voiceReducer from './slices/voiceSlice';
import type voiceReducerType from './slices/voiceSlice';

/**
 * Combined room reducer with nested structure
 * State shape: { _room, _messages, _messageParts, _threads, _members, _tabs, _voice, _lifecycle, _ui }
/**
 * Access via selectors that understand the nested structure
 *
 * Exporting explicitly-typed combined reducer to resolve private type errors.
 */

export interface CombinedRoomState {
  _room: ReturnType<typeof coreRoomReducerType>;
  _messages: ReturnType<typeof messagesReducerType>;
  _messageParts: ReturnType<typeof messagePartsReducerType>;
  _threads: ReturnType<typeof threadsReducerType>;
  _members: ReturnType<typeof membersReducerType>;
  _tabs: ReturnType<typeof tabsReducerType>;
  _voice: ReturnType<typeof voiceReducerType>;
  _lifecycle: ReturnType<typeof lifecycleReducerType>;
  _ui: ReturnType<typeof uiReducerType>;
}

const combinedRoomReducer = combineReducers({
  _room: coreRoomReducer,
  _messages: messagesReducer,
  _messageParts: messagePartsReducer,
  _threads: threadsReducer,
  _members: membersReducer,
  _tabs: tabsReducer,
  _voice: voiceReducer,
  _lifecycle: lifecycleReducer,
  _ui: uiReducer,
});

export default combinedRoomReducer as (state: CombinedRoomState | undefined, action: unknown) => CombinedRoomState;
