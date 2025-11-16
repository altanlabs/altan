import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// utils
import { optimai } from '../../utils/axios';
import { AppThunk } from '../store';

// ----------------------------------------------------------------------

// Types
interface Tool {
  id: string;
  [key: string]: unknown;
}

interface SpaceTool {
  id: string;
  tool?: Tool;
  [key: string]: unknown;
}

interface ToolItems {
  items: SpaceTool[];
}

interface ChildSpace {
  id: string;
  [key: string]: unknown;
}

interface SpaceChildren {
  items?: ChildSpace[];
}

interface Space {
  id: string;
  name?: string;
  position?: number;
  account_id?: string;
  parent_id?: string | null;
  is_personal?: boolean;
  created_by?: string;
  tools?: ToolItems;
  children?: SpaceChildren;
  breadcrumbs?: string[];
  [key: string]: unknown;
}

interface SpacesState {
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  current: Space | null;
  spaces: Record<string, Space>;
  breadcrumbs?: string[];
}

const initialState: SpacesState = {
  isLoading: false,
  error: null,
  initialized: false,
  current: null,
  spaces: {},
  breadcrumbs: [],
};

const slice = createSlice({
  name: 'spaces',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
      state.initialized = true;
    },
    hasError(state, action: PayloadAction<string>) {
      const error = action.payload;
      state.error = error;
      state.isLoading = false;
    },
    clearState(state) {
      state.isLoading = false;
      state.error = null;
      state.initialized = false;
      state.current = null;
      state.spaces = {};
      state.breadcrumbs = [];
    },
    addCurrentTool(state, action: PayloadAction<SpaceTool>) {
      const tool = action.payload;
      if (!!state.current && state.current.id !== 'root') {
        if (!state.current.tools) {
          state.current.tools = {
            items: [tool],
          };
        } else {
          state.current.tools.items.push(tool);
        }
      }
    },
    deleteCurrentTool(state, action: PayloadAction<string>) {
      const toolId = action.payload;
      if (!!state.current && state.current.id !== 'root' && state.current.tools) {
        state.current.tools.items = state.current.tools.items.filter((tool) => tool.id !== toolId);
      }
    },
    updateCurrentTool(state, action: PayloadAction<Tool>) {
      const updatedTool = action.payload;
      if (!!state.current && state.current.id !== 'root' && state.current.tools) {
        const toolIndex = state.current.tools.items.findIndex(
          (tool) => tool.tool?.id === updatedTool.id
        );
        if (toolIndex !== -1) {
          state.current.tools.items[toolIndex].tool = {
            ...state.current.tools.items[toolIndex].tool,
            ...updatedTool,
          };
        }
      }
    },
    setCurrentSpace(state, action: PayloadAction<Space>) {
      const space = action.payload;
      
      // Initialize breadcrumbs if not exists
      if (!state.breadcrumbs) {
        state.breadcrumbs = [];
      }
      
      if (space.id === 'root') {
        state.breadcrumbs = [];
      }
      
      const indexOfSpaceId = state.breadcrumbs.indexOf(space.id);
      if (indexOfSpaceId !== -1) {
        state.breadcrumbs.length = indexOfSpaceId + 1;
      } else if (state.current?.parent_id === space.id) {
        state.breadcrumbs[state.breadcrumbs.length - 1] = space.id;
      } else {
        state.breadcrumbs.push(space.id);
      }
      
      if (!!space.children?.items) {
        space.children.items.forEach((sp) => {
          const childId = sp.id;
          if (!(childId in state.spaces)) {
            state.spaces[childId] = sp;
          }
        });
      }
      
      if (!(space.id in state.spaces)) {
        state.spaces[space.id] = space;
      }
      
      if (!!state.current) {
        state.spaces[state.current.id] = state.current;
      }
      
      state.current = space;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  updateCurrentTool,
  setCurrentSpace,
  stopLoading: stopSpacesLoading,
  clearState: clearSpacesState,
} = slice.actions;

// GRAPH QUERIES -------------------------------------------------------

const SPACE_GQ = {
  '@fields': [
    '@base@exc:date_creation',
    'name',
    'position',
    'account_id',
    'parent_id',
    'is_personal',
    'created_by',
  ],
  '@filter': { is_deleted: { _eq: 'false' } },
  tools: {
    '@fields': 'id',
    tool: {
      '@fields': '@all@exc:action_type_id',
      action_type: {
        '@fields': ['id', 'name', 'description'],
        connection_type: {
          '@fields': ['id', 'icon', 'name'],
          external_app: {
            '@fields': ['id', 'icon', 'name'],
          },
        },
      },
    },
  },
};

// ----------------------------------------------------------------------

export const getSpace =
  (spaceId: string): AppThunk =>
  async (dispatch, getState) => {
    const { current } = getState().spaces;
    if (current?.id !== spaceId) {
      const response = await optimai.post(`/space/${spaceId}/gq`, SPACE_GQ);
      const space = response.data;
      dispatch(slice.actions.setCurrentSpace(space));
    }
  };

export const createToolLink =
  (tool_id: string): AppThunk =>
  async (dispatch, getState) => {
    const { current } = getState().spaces;
    if (!tool_id) return Promise.reject('cannot add tool from invalid tool');
    if (!current || current.id === 'root')
      return Promise.reject('cannot add tool in invalid space');
    const response = await optimai.post(`/space/${current.id}/tools/${tool_id}`);
    const { space_tool } = response.data;
    dispatch(slice.actions.addCurrentTool(space_tool));
    return Promise.resolve('success');
  };

export const deleteToolLink =
  (linkId: string, toolId: string, spaceId: string): AppThunk =>
  async (dispatch, getState) => {
    const { current } = getState().spaces;
    if (!current || current.id === 'root')
      return Promise.reject('cannot delete tool link in invalid space');
    if (!linkId) return Promise.reject('cannot delete invalid tool');
    try {
      await optimai.delete(`/space/${spaceId}/tools/${toolId}`);
      dispatch(slice.actions.deleteCurrentTool(linkId));
      return Promise.resolve('success');
    } catch (e: unknown) {
      console.error(`error: could not delete knowledge link: ${e}`);
      return Promise.reject(e);
    }
  };

