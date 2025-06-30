import { createSlice } from '@reduxjs/toolkit';

import { optimai } from '../../utils/axios';

const initialState = {
  isLoading: false,
  error: null,
  agents: [],
  currentAgent: null,
  currentAgentDmRoomId: null,
  voices: {
    items: [],
    loading: false,
    error: null,
    hasMore: false,
    nextPageToken: null,
    searchQuery: '',
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
      state.isLoading = false;
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
  },
});

// Reducer
export default slice.reducer;

// Actions

export const fetchAgentDetails = (agentId) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    const agentRes = await optimai.get(`/agent/${agentId}`);
    const agent = agentRes.data.agent;

    if (agent) {
      const { account } = getState().general;
      const dmResponse = await optimai.get(
        `/agent/${agent.id}/dm?account_id=${account.id}`,
      );

      dispatch(
        slice.actions.setAgent({
          agent,
          dmRoomId: dmResponse.data.id,
        }),
      );
    } else {
      throw new Error('Agent not found');
    }
  } catch (error) {
    dispatch(slice.actions.hasError(error.toString()));
  }
};

export const createAgent = (data) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  const { account } = getState().general;
  try {
    const response = await optimai.post(`/account/${account.id}/agent`, data);
    const { agent } = response.data;
    dispatch(slice.actions.addAgent(agent));
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
    console.error(`error: could not delete agent ${agentId}: ${e}`);
    return Promise.reject(e);
  }
};

export const fetchVoices = (search = '', loadMore = false) => async (dispatch, getState) => {
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

    dispatch(slice.actions.loadVoicesSuccess({
      items: response.data.voices,
      hasMore: response.data.has_more,
      nextPageToken: response.data.next_page_token || null,
      searchQuery: search,
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message;
    dispatch(slice.actions.loadVoicesError(errorMessage));
    throw errorMessage;
  }
};

export const { setAgents, resetVoices } = slice.actions;
