import { createSlice } from '@reduxjs/toolkit';

import analytics from '../../lib/analytics';
import { optimai, optimai_room } from '../../utils/axios';

const initialState = {
  isLoading: false,
  error: null,
  agents: [],
  currentAgent: null,
  currentAgentDmRoomId: null,
  currentAgentCreatorRoomId: null,
  // New structure for multiple agent rooms
  agentRooms: {}, // { [agentId]: { agent, dmRoomId, creatorRoomId, loading } }
  voices: {
    items: [],
    loading: false,
    error: null,
    hasMore: false,
    nextPageToken: null,
    searchQuery: '',
  },
  rooms: {
    items: [],
    loading: false,
    error: null,
  },
};

const slice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    stopLoading(state) {
      state.isLoading = false;
    },

    setAgents(state, action) {
      state.agents = action.payload;
    },

    setAgent(state, action) {
      state.currentAgent = action.payload.agent;
      state.currentAgentDmRoomId = action.payload.dmRoomId;
      state.currentAgentCreatorRoomId = action.payload.creatorRoomId;
      state.isLoading = false;

      // Also store in agentRooms for multi-agent support
      if (action.payload.agent) {
        state.agentRooms[action.payload.agent.id] = {
          agent: action.payload.agent,
          dmRoomId: action.payload.dmRoomId,
          creatorRoomId: action.payload.creatorRoomId,
          loading: false,
        };
      }
    },

    // New actions for multi-agent support
    startLoadingAgentRoom(state, action) {
      const agentId = action.payload;
      if (!state.agentRooms[agentId]) {
        state.agentRooms[agentId] = { loading: true };
      } else {
        state.agentRooms[agentId].loading = true;
      }
    },

    setAgentRoom(state, action) {
      const { agentId, agent, dmRoomId, creatorRoomId } = action.payload;
      state.agentRooms[agentId] = {
        agent,
        dmRoomId,
        creatorRoomId,
        loading: false,
      };
    },

    removeAgentRoom(state, action) {
      const agentId = action.payload;
      delete state.agentRooms[agentId];
    },

    addAgent(state, action) {
      state.agents = [...state.agents, action.payload];
    },

    patchAgent(state, action) {
      const updatedAgent = action.payload;
      state.agents = state.agents.map((agent) =>
        agent.id === updatedAgent.id ? updatedAgent : agent,
      );
      if (state.currentAgent && state.currentAgent.id === updatedAgent.id) {
        state.currentAgent = updatedAgent;
      }
    },
    deleteAgent(state, action) {
      state.agents = state.agents.filter((agent) => agent.id !== action.payload);
    },
    // Voice actions
    startLoadingVoices(state) {
      state.voices.loading = true;
      state.voices.error = null;
    },
    loadVoicesSuccess(state, action) {
      const { items, hasMore, nextPageToken, searchQuery } = action.payload;

      let allVoices;
      if (searchQuery === state.voices.searchQuery) {
        // Merge and deduplicate
        const combined = [...state.voices.items, ...items];
        const uniqueVoices = combined.reduce((acc, voice) => {
          if (!acc.find((v) => v.voice_id === voice.voice_id)) {
            acc.push(voice);
          }
          return acc;
        }, []);
        allVoices = uniqueVoices;
      } else {
        allVoices = items;
      }

      state.voices.items = allVoices;
      state.voices.hasMore = hasMore;
      state.voices.nextPageToken = nextPageToken;
      state.voices.searchQuery = searchQuery;
      state.voices.loading = false;
    },
    loadVoicesError(state, action) {
      state.voices.loading = false;
      state.voices.error = action.payload;
    },
    // Room actions
    startLoadingRooms(state) {
      state.rooms.loading = true;
      state.rooms.error = null;
    },
    loadRoomsSuccess(state, action) {
      state.rooms.items = action.payload;
      state.rooms.loading = false;
    },
    loadRoomsError(state, action) {
      state.rooms.loading = false;
      state.rooms.error = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions

export const fetchAgentRoom = (agentId, setAsCurrent = true) => async (dispatch, getState) => {
  // Check if room is already cached
  const { agentRooms } = getState().agents;
  if (agentRooms[agentId] && agentRooms[agentId].dmRoomId) {
    // Already loaded, just set as current if requested
    if (setAsCurrent) {
      const roomData = agentRooms[agentId];
      dispatch(slice.actions.setAgent({
        agent: roomData.agent,
        dmRoomId: roomData.dmRoomId,
        creatorRoomId: roomData.creatorRoomId,
      }));
    }
    return Promise.resolve(agentRooms[agentId]);
  }

  if (setAsCurrent) {
    dispatch(slice.actions.startLoading());
  }
  dispatch(slice.actions.startLoadingAgentRoom(agentId));

  try {
    const agentRes = await optimai.get(`/agent/${agentId}`);
    const agent = agentRes.data.agent;

    if (agent) {
      const { account } = getState().general;

      // Fetch DM room
      const dmResponse = await optimai.get(`/agent/${agent.id}/dm?account_id=${account.id}`);

      // Fetch creator room - some agents don't have a creator room, so handle 404 gracefully
      let creatorRoomId = null;
      try {
        const creatorResponse = await optimai_room.get(
          `/external/agent_${agent.id}?account_id=${agent.account_id}&autocreate=true`,
        );
        creatorRoomId = creatorResponse.data.room.id;
      } catch {
        // If creator room doesn't exist (404) or any other error, just continue without it
        // creatorRoomId will remain null
      }

      const roomData = {
        agentId: agent.id,
        agent,
        dmRoomId: dmResponse.data.id,
        creatorRoomId,
      };

      // Store in agentRooms
      dispatch(slice.actions.setAgentRoom(roomData));

      // Also set as current if requested (for backwards compatibility)
      if (setAsCurrent) {
        dispatch(
          slice.actions.setAgent({
            agent,
            dmRoomId: dmResponse.data.id,
            creatorRoomId,
          }),
        );
      }

      return Promise.resolve(roomData);
    } else {
      throw new Error('Agent not found');
    }
  } catch (error) {
    if (setAsCurrent) {
      dispatch(slice.actions.hasError(error.toString()));
    }
    return Promise.reject(error);
  }
};

export const createAgent = (data) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  const { account } = getState().general;
  try {
    const response = await optimai.post(`/account/${account.id}/agent`, data);
    const { agent } = response.data;
    dispatch(slice.actions.addAgent(agent));

    // Track agent creation
    analytics.track('created_agent', {
      agent_id: agent.id,
      agent_type: data.meta_data?.agent_type || 'General Assistant',
      goal: data.meta_data?.goal || null,
      industry: data.meta_data?.industry || null,
      has_voice: !!data.voice,
      created_from: data.meta_data?.created_from || 'unknown',
    });

    return agent;
  } catch (e) {
    dispatch(slice.actions.hasError(e.toString()));
    return Promise.reject(e.toString());
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const updateAgent = (agentId, data) => async (dispatch) => {
  try {
    const response = await optimai.patch(`/agent/${agentId}`, data);
    const { agent } = response.data;
    dispatch(slice.actions.patchAgent(agent));

    // Track agent update
    analytics.track('updated_agent', {
      agent_id: agentId,
      updated_fields: Object.keys(data),
    });

    return Promise.resolve(agent);
  } catch (e) {
    if (e.response && e.response.data && e.response.data.detail) {
      return Promise.reject(e.response.data.detail);
    } else {
      return Promise.reject(e.message);
    }
  }
};

export const deleteAgent = (agentId) => async (dispatch) => {
  try {
    const response = await optimai.delete(`/agent/${agentId}`);
    dispatch(slice.actions.deleteAgent(agentId));
    return Promise.resolve(response);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const fetchVoices =
  (search = '', loadMore = false) =>
  async (dispatch, getState) => {
    const { voices } = getState().agents;

    if (!loadMore) {
      dispatch(slice.actions.startLoadingVoices());
    }

    try {
      const params = {};
      if (search) params.search = search;
      if (loadMore && voices.nextPageToken) {
        params.next_page_token = voices.nextPageToken;
      }

      const response = await optimai.get('/agent/list-voices', { params });

      dispatch(
        slice.actions.loadVoicesSuccess({
          items: response.data.voices,
          hasMore: response.data.has_more,
          nextPageToken: response.data.next_page_token || null,
          searchQuery: search,
        }),
      );
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      dispatch(slice.actions.loadVoicesError(errorMessage));
      throw errorMessage;
    }
  };

export const fetchAgentRooms = (agentId) => async (dispatch) => {
  dispatch(slice.actions.startLoadingRooms());
  try {
    const response = await optimai.get(`/agent/${agentId}/rooms`);
    dispatch(slice.actions.loadRoomsSuccess(response.data.rooms));
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message;
    dispatch(slice.actions.loadRoomsError(errorMessage));
    throw errorMessage;
  }
};

export const fetchAgentById = (agentId) => async (dispatch, getState) => {
  try {
    // Check if agent already exists in agents store
    const { agents } = getState().agents;
    const existingAgent = agents?.find((a) => a.id === agentId);
    if (existingAgent) {
      return Promise.resolve(existingAgent);
    }

    // Also check general store (legacy support)
    const { account } = getState().general;
    const existingInGeneral = account?.agents?.find((a) => a.id === agentId);
    if (existingInGeneral) {
      // Add to agents store for consistency
      dispatch(slice.actions.addAgent(existingInGeneral));
      return Promise.resolve(existingInGeneral);
    }

    // Fetch the agent
    const response = await optimai.get(`/agent/${agentId}`);
    const { agent } = response.data;

    // Add to agents store
    dispatch(slice.actions.addAgent(agent));

    return Promise.resolve(agent);
  } catch (e) {
    const errorMessage = e.response?.data?.detail || e.message;
    // eslint-disable-next-line no-console
    console.error(`Error fetching agent ${agentId}:`, errorMessage);
    return Promise.reject(errorMessage);
  }
};

export const { setAgents, resetVoices, removeAgentRoom } = slice.actions;

// Selectors
export const selectAllAgents = (state) => {
  const agentsFromAgentsStore = state.agents.agents || [];
  const agentsFromGeneralStore = state.general.account?.agents || [];

  // Merge both stores, preferring agents store (for fetched agents)
  return [
    ...agentsFromAgentsStore,
    ...agentsFromGeneralStore.filter(
      (a) => !agentsFromAgentsStore.find((agent) => agent.id === a.id),
    ),
  ];
};

// Selector for getting a specific agent's room data
export const selectAgentRoom = (agentId) => (state) => {
  return state.agents.agentRooms[agentId] || null;
};
