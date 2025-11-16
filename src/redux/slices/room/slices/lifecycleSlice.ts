/**
 * Lifecycle Slice
 * Manages activation and response lifecycles, and running responses
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type {
  ActivationLifecyclesState,
  ResponseLifecyclesState,
  LifecycleEventPayload,
} from '../types/state';

interface LifecycleState {
  activationLifecycles: ActivationLifecyclesState;
  responseLifecycles: ResponseLifecyclesState;
  runningResponses: Record<string, string>;
}

const initialState: LifecycleState = {
  // Activation and response lifecycle tracking
  activationLifecycles: {
    byId: {},
    activeByThread: {},
  },
  responseLifecycles: {
    byId: {},
    activeByThread: {},
  },
  runningResponses: {},
};

const lifecycleSlice = createSlice({
  name: 'room/lifecycle',
  initialState,
  reducers: {
    addRunningResponse: (state, action: PayloadAction<{ id: string; llm_response_id: string }>) => {
      const { id, llm_response_id } = action.payload;
      state.runningResponses[id] = llm_response_id;
    },

    deleteRunningResponse: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      if (id in state.runningResponses) {
        delete state.runningResponses[id];
      }
    },

    // Activation lifecycle management (before response starts)
    addActivationLifecycle: (state, action: PayloadAction<LifecycleEventPayload>) => {
      const { response_id, agent_id, thread_id, event_type, event_data, timestamp } =
        action.payload;

      if (!state.activationLifecycles.byId[response_id]) {
        // Create new activation lifecycle
        state.activationLifecycles.byId[response_id] = {
          response_id,
          agent_id,
          thread_id,
          status: 'acknowledged',
          events: [],
          created_at: timestamp || new Date().toISOString(),
          updated_at: timestamp || new Date().toISOString(),
        };

        // Add to active activations for thread
        if (!state.activationLifecycles.activeByThread[thread_id]) {
          state.activationLifecycles.activeByThread[thread_id] = [];
        }
        state.activationLifecycles.activeByThread[thread_id].push(response_id);
      }

      const lifecycle = state.activationLifecycles.byId[response_id];

      // Add event to timeline
      lifecycle.events.push({
        type: event_type,
        data: event_data,
        timestamp: timestamp || new Date().toISOString(),
      });

      // Update status based on event
      lifecycle.status = event_type.replace('activation.', '');
      lifecycle.updated_at = timestamp || new Date().toISOString();
    },

    completeActivationLifecycle: (
      state,
      action: PayloadAction<{ response_id: string; thread_id: string }>,
    ) => {
      const { response_id, thread_id } = action.payload;

      // Remove from active activations
      if (state.activationLifecycles.activeByThread[thread_id]) {
        state.activationLifecycles.activeByThread[thread_id] =
          state.activationLifecycles.activeByThread[thread_id].filter((id) => id !== response_id);

        // Clean up empty arrays
        if (state.activationLifecycles.activeByThread[thread_id].length === 0) {
          delete state.activationLifecycles.activeByThread[thread_id];
        }
      }

      // Mark as completed
      if (state.activationLifecycles.byId[response_id]) {
        state.activationLifecycles.byId[response_id].completed_at = new Date().toISOString();
      }
    },

    discardActivationLifecycle: (
      state,
      action: PayloadAction<{ response_id: string; thread_id: string }>,
    ) => {
      const { response_id, thread_id } = action.payload;

      // Remove from active activations completely
      if (state.activationLifecycles.activeByThread[thread_id]) {
        state.activationLifecycles.activeByThread[thread_id] =
          state.activationLifecycles.activeByThread[thread_id].filter((id) => id !== response_id);

        // Clean up empty arrays
        if (state.activationLifecycles.activeByThread[thread_id].length === 0) {
          delete state.activationLifecycles.activeByThread[thread_id];
        }
      }

      // Mark as discarded
      if (state.activationLifecycles.byId[response_id]) {
        state.activationLifecycles.byId[response_id].discarded = true;
        state.activationLifecycles.byId[response_id].discarded_at = new Date().toISOString();
      }
    },

    cleanupActivationLifecycles: (state, action: PayloadAction<{ olderThan?: number } | undefined>) => {
      const { olderThan = 300000 } = action.payload || {}; // 5 minutes default
      const cutoff = Date.now() - olderThan;

      Object.keys(state.activationLifecycles.byId).forEach((response_id) => {
        const lifecycle = state.activationLifecycles.byId[response_id];
        if (lifecycle.completed_at || lifecycle.discarded_at) {
          const timestamp = lifecycle.completed_at || lifecycle.discarded_at || '';
          const completedTime = new Date(timestamp).getTime();
          if (completedTime < cutoff) {
            delete state.activationLifecycles.byId[response_id];
          }
        }
      });
    },

    // Response lifecycle management (after response starts)
    addResponseLifecycle: (state, action: PayloadAction<LifecycleEventPayload>) => {
      const { response_id, agent_id, thread_id, event_type, event_data, timestamp } =
        action.payload;

      if (!state.responseLifecycles.byId[response_id]) {
        // Create new response lifecycle
        state.responseLifecycles.byId[response_id] = {
          response_id,
          agent_id,
          thread_id,
          status: 'started',
          events: [],
          created_at: timestamp || new Date().toISOString(),
          updated_at: timestamp || new Date().toISOString(),
        };

        // Add to active responses for thread
        if (!state.responseLifecycles.activeByThread[thread_id]) {
          state.responseLifecycles.activeByThread[thread_id] = [];
        }
        state.responseLifecycles.activeByThread[thread_id].push(response_id);
      }

      const lifecycle = state.responseLifecycles.byId[response_id];

      // Add event to timeline
      lifecycle.events.push({
        type: event_type,
        data: event_data,
        timestamp: timestamp || new Date().toISOString(),
      });

      // Update status based on event
      lifecycle.status = event_type.replace('response.', '');

      // Set message_id when response starts
      if (
        event_type === 'response.started' &&
        event_data &&
        typeof event_data === 'object' &&
        'message_id' in event_data
      ) {
        lifecycle.message_id = event_data.message_id as string;
      }

      lifecycle.updated_at = timestamp || new Date().toISOString();
    },

    completeResponseLifecycle: (
      state,
      action: PayloadAction<{
        response_id: string;
        thread_id: string;
        message_id?: string;
        status?: string;
      }>,
    ) => {
      const { response_id, thread_id } = action.payload;

      // Remove from active responses
      if (state.responseLifecycles.activeByThread[thread_id]) {
        state.responseLifecycles.activeByThread[thread_id] =
          state.responseLifecycles.activeByThread[thread_id].filter((id) => id !== response_id);

        // Clean up empty arrays
        if (state.responseLifecycles.activeByThread[thread_id].length === 0) {
          delete state.responseLifecycles.activeByThread[thread_id];
        }
      }

      // Keep completed responses for a while (they'll be cleaned up later)
      if (state.responseLifecycles.byId[response_id]) {
        state.responseLifecycles.byId[response_id].completed_at = new Date().toISOString();
      }
    },

    cleanupResponseLifecycles: (state, action: PayloadAction<{ olderThan?: number } | undefined>) => {
      const { olderThan = 300000 } = action.payload || {}; // 5 minutes default
      const cutoff = Date.now() - olderThan;

      Object.keys(state.responseLifecycles.byId).forEach((response_id) => {
        const lifecycle = state.responseLifecycles.byId[response_id];
        if (lifecycle.completed_at) {
          const completedTime = new Date(lifecycle.completed_at).getTime();
          if (completedTime < cutoff) {
            delete state.responseLifecycles.byId[response_id];
          }
        }
      });
    },
  },
});

export const {
  addRunningResponse,
  deleteRunningResponse,
  addActivationLifecycle,
  completeActivationLifecycle,
  discardActivationLifecycle,
  cleanupActivationLifecycles,
  addResponseLifecycle,
  completeResponseLifecycle,
  cleanupResponseLifecycles,
} = lifecycleSlice.actions;

export default lifecycleSlice.reducer;

