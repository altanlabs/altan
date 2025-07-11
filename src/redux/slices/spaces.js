import { createSlice } from '@reduxjs/toolkit';

// utils
import { optimai, optimai_root } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  initialized: false,
  current: null,
  breadcrumbs: [], // ids
  spaces: {}, // spaces dict
  navigation: {
    origin: null, // element selected before opening nav
    current: null, // space in navigation
    active: false,
    mode: 'links',
  },
  dialogs: {
    settings: {
      current: null,
      active: false,
    },
    delete: {
      current: null,
      active: false,
    },
  },
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
    hasError(state, action) {
      const error = action.payload;
      state.error = error;
      state.isLoading = false;
    },
    clearState(state) {
      state.isLoading = false;
      state.error = null;
      state.initialized = false;
      state.current = null;
      state.breadcrumbs = [];
      state.spaces = {};
      state.navigation = {
        current: null,
        active: false,
        origin: null,
        mode: 'links',
      };
      state.dialogs = {
        settings: {
          current: null,
          active: false,
        },
        delete: {
          current: null,
          active: false,
        },
      };
    },
    addCurrentSubspace(state, action) {
      const space = action.payload;
      if (!!state.current) {
        state.current.children.items.push(space);
        state.spaces[space.id] = space;
      }
    },
    deleteCurrentSubspace(state, action) {
      const spaceId = action.payload;
      if (!!state.current)
        state.current.children.items = state.current.children.items.filter(
          (space) => space.id !== spaceId,
        );
      if (spaceId in state.spaces) delete state.spaces[spaceId];
      // TODO: delete space.children.items.spaces recursively from state.spaces
    },
    deleteCurrentSpace(state) {
      const current = state.current;
      if (!current || current.id === 'root') return;
      if (current.id in state.spaces) delete state.spaces[current.id];
      if (!!current.parent_id && current.parent_id in state.spaces)
        state.spaces[current.parent_id].children.items = state.spaces[
          current.parent_id
        ].children.items.filter((s) => s.id !== current.id);
      else if ('root' in state.spaces)
        state.spaces['root'].children.items = state.spaces['root'].children.items.filter(
          (s) => s.id !== current.id,
        );
      // TODO: delete current.children.items.spaces recursively from state.spaces
      state.breadcrumbs.pop();
    },
    updateWidgetPositions(state, action) {
      const changes = action.payload;
      if (state.current && state.current.widgets.items) {
        changes.forEach((change) => {
          const widget = state.current.widgets.items.find((w) => w.id === change.widget_id);
          if (widget) {
            widget.position = change.new_position;
          }
        });
        // After updating positions, re-sort the array to reflect changes
        state.current.widgets.items.sort((a, b) => a.position - b.position);
      }
    },
    updateCurrentSubspace(state, action) {
      const { spaceId, name } = action.payload;
      if (!!state.current) {
        const index = state.current.children.items.findIndex((space) => space.id === spaceId);
        if (index === -1) return;
        const space = state.current.children.items[index];
        space.name = name;
        state.current.children.items[index] = space;
        if (spaceId in state.spaces) state.spaces[spaceId].name = name;
      }
    },
    updateTranslations(state, action) {
      const { spaceId, translations } = action.payload;
      const spaces = state.spaces;
      if (!!spaces[spaceId]) {
        spaces[spaceId].meta_data.translations = translations;
      }
    },
    updateCurrentWidget(state, action) {
      const widget = action.payload;
      if (!!state.current) {
        const index = state.current.widgets.items.findIndex((wl) => wl.widget.id === widget.id);
        if (index === -1) return;
        state.current.widgets.items[index].widget = widget;
      }
    },
    updateCurrentWidgetPosition(state, action) {
      const { layoutId, position } = action.payload;
      if (!!state.current) {
        const index = state.current.widgets.items.findIndex((wl) => wl.id === layoutId);
        if (index === -1) return;
        state.current.widgets.items[index].position = position;
      }
    },
    addCurrentLink(state, action) {
      const link = action.payload;
      if (!!state.current && state.current.id !== 'root') {
        if (!state.current.links) {
          state.current.links = {
            items: [link],
          };
        } else {
          state.current.links.items.push(link);
        }
      }
    },
    addCurrentWidget(state, action) {
      const widget = action.payload;
      if (!!state.current && state.current.id !== 'root') {
        if (!state.current.widgets) {
          state.current.widgets = {
            items: [widget],
          };
        } else {
          state.current.widgets.items.push(widget);
        }
      }
    },
    addCurrentKnowledge(state, action) {
      const file = action.payload;
      if (!!state.current && state.current.id !== 'root') {
        if (!state.current.knowledge) {
          state.current.knowledge = {
            items: [file],
          };
        } else {
          state.current.knowledge.items.push(file);
        }
      }
    },
    addCurrentResource(state, action) {
      const resource = action.payload;
      if (!!state.current && state.current.id !== 'root') {
        if (!state.current.resources) {
          state.current.resources = {
            items: [resource],
          };
        } else {
          state.current.resources.items.push(resource);
        }
      }
    },
    addCurrentTool(state, action) {
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
    deleteCurrentTool(state, action) {
      const toolId = action.payload;
      if (!!state.current && state.current.id !== 'root') {
        state.current.tools.items = state.current.tools.items.filter((tool) => tool.id !== toolId);
      }
    },
    deleteCurrentKnowledge(state, action) {
      const fileId = action.payload;
      if (!!state.current && state.current.id !== 'root') {
        state.current.knowledge.items = state.current.knowledge.items.filter(
          (file) => file.id !== fileId,
        );
      }
    },
    deleteCurrentResource(state, action) {
      const resourceId = action.payload;
      if (!!state.current && state.current.id !== 'root') {
        state.current.resources.items = state.current.resources.items.filter(
          (r) => r.id !== resourceId,
        );
      }
    },
    deleteCurrentLink(state, action) {
      const linkId = action.payload;
      if (!!state.current && state.current.id !== 'root') {
        state.current.links.items = state.current.links.items.filter((l) => l.id !== linkId);
      }
    },
    deleteWidgetFromSpace(state, action) {
      const widgetId = action.payload;
      if (!!state.current && state.current.id !== 'root') {
        state.current.widgets.items = state.current.widgets.items.filter(
          (layout) => layout.widget.id !== widgetId,
        );
      }
    },
    setCurrentSpace(state, action) {
      const space = action.payload;
      if (space.id === 'root') state.breadcrumbs = [];
      const indexOfSpaceId = state.breadcrumbs.indexOf(space.id);
      if (indexOfSpaceId !== -1) state.breadcrumbs.length = indexOfSpaceId + 1;
      else if (state.current?.parent_id === space.id)
        state.breadcrumbs[state.breadcrumbs.length - 1] = space.id;
      else state.breadcrumbs.push(space.id);
      space.children.items?.forEach((sp) => {
        const childId = sp.id;
        if (!(childId in state.spaces)) state.spaces[childId] = sp;
      });
      if (!(space.id in state.spaces)) state.spaces[space.id] = space;
      if (!!state.current) state.spaces[state.current.id] = state.current;
      state.current = space;
    },
    setCurrentSpaceById(state, action) {
      const spaceId = action.payload;
      if (spaceId === 'root') state.breadcrumbs = [];
      if (!(spaceId in state.spaces)) return;
      const indexOfSpaceId = state.breadcrumbs.indexOf(spaceId);
      if (indexOfSpaceId !== -1) state.breadcrumbs.length = indexOfSpaceId + 1;
      else if (state.current.parent_id === spaceId)
        state.breadcrumbs[state.breadcrumbs.length - 1] = spaceId;
      else state.breadcrumbs.push(spaceId);
      if (!!state.current) state.spaces[state.current.id] = state.current;
      state.current = state.spaces[spaceId];
    },
    setNavigationActive(state, action) {
      const payload = action.payload;
      const origin = !!payload ? payload.origin : null;
      const mode = !!payload ? payload.mode : 'links';
      state.navigation = {
        active: true,
        current: 'root',
        origin: origin,
        mode: mode,
      };
    },
    setNavigationHidden(state) {
      state.navigation = {
        active: false,
        current: null,
        origin: null,
        mode: 'links',
      };
    },
    setDialogActive(state, action) {
      const { dialog, item } = action.payload;
      // const { id, type } = item;
      state.dialogs[dialog] = {
        current: item,
        active: true,
      };
    },
    setDialogHidden(state, action) {
      const dialog = action.payload;
      state.dialogs[dialog] = {
        current: null,
        active: false,
      };
    },
    setNavigationSpaceById(state, action) {
      state.navigation = {
        active: true,
        current: action.payload,
        mode: state.navigation.mode,
        origin: state.navigation.origin,
      };
    },
    setNavigationSpace(state, action) {
      const space = action.payload;
      if (!(space.id in state.spaces)) state.spaces[space.id] = space;
      state.navigation = {
        active: true,
        current: space.id,
        mode: state.navigation.mode,
        origin: state.navigation.origin,
      };
    },
    moveSubspace(state, action) {
      const { spaceId, destination } = action.payload;
      const spaceIndex = state.current.children.items.findIndex((s) => s.id === spaceId);
      if (spaceIndex === -1) return;
      let space = state.current.children.items[spaceIndex];
      if ('parent' in space) space.parent_id = destination;
      else space = { parent: destination, ...space };
      state.current.children.items.spaces.splice(spaceIndex, 1);
      state.spaces[state.current.id] = state.current;
      if (!!state.spaces[destination]) state.spaces[destination].children.items.push(space);
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  setDialogActive,
  setDialogHidden,
  setNavigationActive,
  setNavigationHidden,
  updateCurrentWidget,
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
  links: {
    '@fields': ['@base@exc:date_creation', 'position'],
    reference: {
      '@fields': ['@base@exc:date_creation', 'name'],
      '@filter': { is_deleted: { _eq: 'false' } },
    },
  },
  children: {
    '@fields': [
      '@base@exc:date_creation',
      'name',
      'position',
      '$count:children,links,knowledge,widgets',
    ],
  },
  creator: {
    '@fields': '@all',
    user: {
      '@fields': '@all@exc:meta_data',
    },
    agent: {
      '@fields': '@all',
    },
  },
  // "widgets": {
  //   "@fields": ["id", "position"],
  //   "widget": {
  //     "@fields": ["@base@exc:date_creation", "type"],
  //     "media": {
  //       "@fields": ["id", "position"],
  //       "media": {
  //         "@fields": ["id", "file_name", "mime_type", "description"]
  //       }
  //     },
  //     "attributes": {
  //       "@fields": ["id", "position", "is_required"],
  //       "attribute": {
  //         "@fields": "@all@exc:date_creation,account_id"
  //       }
  //     }
  //   }
  // },
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
  resources: {
    '@fields': 'id',
    resource: {
      '@fields': '@all@exc:resource_type_id,connection_id',
      resource_type: {
        '@fields': ['id', 'name', 'description', 'details'],
      },
    },
  },
  knowledge: {
    '@fields': ['id', 'position'],
    knowledge: {
      '@fields': '@base',
      file: {
        '@fields': '@base',
        chunks: {
          '@fields': '@base@exc:date_creation',
        },
      },
    },
  },
};

// ----------------------------------------------------------------------

export const getRootSpaces =
  (mode = 'space') =>
  async (dispatch, getState) => {
    try {
      const { account, user } = getState().general;
      if (!account || !user) throw new Error('undefined account');
      const filterPersonalSpaces = !!user.member
        ? {
            '@or': [{ is_personal: { _eq: 'null' } }, { created_by: { _eq: user.member.id } }],
          }
        : { is_personal: { _eq: 'null' } };
      const response = await optimai.post(`/account/${account.id}/gq`, {
        spaces: {
          '@fields': [
            '@base@exc:date_creation',
            'name',
            'position',
            'parent_id',
            'is_personal',
            '$count:children,links,knowledge,widgets',
          ],
          '@filter': {
            '@and': [
              { is_deleted: { _eq: 'false' } },
              { parent_id: { _eq: 'null' } },
              filterPersonalSpaces,
            ],
          },
        },
      });
      const { spaces } = response.data;
      const space = {
        id: 'root',
        name: 'Root',
        account_id: account.id,
        parent: null,
        children: spaces,
      };
      dispatch(
        mode === 'space'
          ? slice.actions.setCurrentSpace(space)
          : slice.actions.setNavigationSpace(space),
      );
      return Promise.resolve('success');
    } catch (e) {
      console.error(`error: could not get root spaces: ${e.message}`);
      return Promise.reject(e);
    }
  };

export const createSpaceRoot =
  ({ name, is_personal = false, privacy = null }) =>
  async (dispatch, getState) => {
    const { account } = getState().general;
    if (!account) throw new Error('undefined account');
    const response = await optimai.post(`/account/${account.id}/spaces`, {
      name,
      privacy,
      is_personal,
    });
    const { space } = response.data;
    dispatch(slice.actions.addCurrentSubspace(space));
    return Promise.resolve('success');
  };

export const getSpace =
  (spaceId, mode = 'space') =>
  async (dispatch, getState) => {
    const { current } = getState().spaces;
    if (current?.id != spaceId) {
      const response = await optimai.post(`/space/${spaceId}/gq`, SPACE_GQ);
      const space = response.data;
      dispatch(
        mode === 'space'
          ? slice.actions.setCurrentSpace(space)
          : slice.actions.setNavigationSpace(space),
      );
    }
  };

export const createSpace =
  ({ name, privacy = null }) =>
  async (dispatch, getState) => {
    const { current } = getState().spaces;
    if (!name) return Promise.reject('cannot create subspace with invalid name');
    if (!current || current.id === 'root')
      return Promise.reject('cannot create subspace in invalid space');
    const response = await optimai.post(`/space/${current.id}/child`, { name, privacy });
    const { space } = response.data;
    dispatch(slice.actions.addCurrentSubspace(space));
    return Promise.resolve('success');
  };

export const createSpaceLink =
  ({ id: space_id, name }) =>
  async (dispatch, getState) => {
    const { current } = getState().spaces;
    if (!space_id) return Promise.reject('cannot create link from invalid space');
    if (!current || current.id === 'root')
      return Promise.reject('cannot create link in invalid space');
    const response = await optimai.post(`/space/${current.id}/link/${space_id}`);
    const { link } = response.data;
    dispatch(slice.actions.addCurrentLink(link));
  };

export const createKnowledgeLink = (fileId) => async (dispatch, getState) => {
  const { id: account_id } = getState().general.account;
  const { current } = getState().spaces;
  if (!fileId) return Promise.reject('cannot create knowledge link from invalid file');
  if (!current || current.id === 'root')
    return Promise.reject('cannot create knowledge link in invalid space');
  const response = await optimai.post(`/space/${current.id}/knowledge/${fileId}`);
  const { knowledge, accfiles } = response.data;
  // console.log(knowledge)
  dispatch(slice.actions.addCurrentKnowledge(knowledge.knowledge));

  await optimai_root.post('/odysseus/sc/train/', { files: accfiles, account_id });
  return Promise.resolve('success');
};

export const createResourceLink = (resource_id) => async (dispatch, getState) => {
  const { current } = getState().spaces;
  if (!resource_id) return Promise.reject('cannot create knowledge link from invalid file');
  if (!current || current.id === 'root')
    return Promise.reject('cannot create knowledge link in invalid space');
  const response = await optimai.post(`/space/${current.id}/resource/${resource_id}`);
  const { space_resource } = response.data;
  dispatch(slice.actions.addCurrentResource(space_resource));
  return Promise.resolve('success');
};

export const createToolLink = (tool_id) => async (dispatch, getState) => {
  const { current } = getState().spaces;
  if (!tool_id) return Promise.reject('cannot add tool from invalid tool');
  if (!current || current.id === 'root') return Promise.reject('cannot addd tool in invalid space');
  const response = await optimai.post(`/space/${current.id}/tools/${tool_id}`);
  const { space_tool } = response.data;
  dispatch(slice.actions.addCurrentTool(space_tool));
  return Promise.resolve('success');
};

export const updateSpace = (spaceId, name) => async (dispatch, getState) => {
  if (!spaceId) return Promise.reject('cannot delete invalid space');
  await optimai.patch(`/space/${spaceId}`, { name });
  dispatch(slice.actions.updateCurrentSubspace({ spaceId, name }));
  return Promise.resolve('success');
};

export const updateWidgetSpaceLayout = (changes) => async (dispatch, getState) => {
  const { current } = getState().spaces;
  if (!current || current.id === 'root')
    return Promise.reject('cannot create knowledge link in invalid space');
  try {
    await optimai.patch(`/space/${current.id}/widget-positions`, { changes });
    dispatch(slice.actions.updateWidgetPositions(changes));
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not update space: ${e}`);
    return Promise.reject(e);
  }
};

export const moveSpace = (spaceId, targetSpaceId) => async (dispatch, getState) => {
  if (!spaceId) return Promise.reject('cannot delete invalid space');
  await optimai.patch(`/space/${spaceId}/move/${targetSpaceId}`);
  dispatch(slice.actions.moveSubspace({ spaceId, destination: targetSpaceId }));
  return Promise.resolve('success');
};

export const upadateSpaceTranslations = (spaceId, translations) => async (dispatch, getState) => {
  if (!spaceId) return Promise.reject('cannot delete invalid space');
  try {
    await optimai.patch(`/space/${spaceId}/translations`, { translations });
    dispatch(slice.actions.updateTranslations({ spaceId, translations: translations }));
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not move space: ${e}`);
    return Promise.reject(e);
  }
};

export const deleteSpace = (spaceId) => async (dispatch, getState) => {
  const { current } = getState().spaces;
  if (!spaceId) return Promise.reject('cannot delete invalid space');
  try {
    await optimai.delete(`/graph/spaces/${spaceId}`);
    dispatch(
      spaceId === current.id
        ? slice.actions.deleteCurrentSpace()
        : slice.actions.deleteCurrentSubspace(spaceId),
    );
    return Promise.resolve(spaceId === current.id);
  } catch (e) {
    console.error(`error: could not delete space: ${e}`);
    return Promise.reject(e);
  }
};

export const deleteSpaceLink = (linkId) => async (dispatch, getState) => {
  if (!linkId) return Promise.reject('cannot delete invalid link');
  try {
    await optimai.delete(`/graph/space-link/${linkId}`);
    dispatch(slice.actions.deleteCurrentLink(linkId));
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not delete space link: ${e}`);
    return Promise.reject(e);
  }
};

export const deleteKnowledgeLink = (linkId) => async (dispatch, getState) => {
  const { current } = getState().spaces;
  if (!current || current.id === 'root')
    return Promise.reject('cannot delete knowledge link in invalid space');
  if (!linkId) return Promise.reject('cannot delete invalid knowledge');
  try {
    await optimai.delete(`/graph/space-knowledge/${linkId}`);
    dispatch(slice.actions.deleteCurrentKnowledge(linkId));
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not delete knowledge link: ${e}`);
    return Promise.reject(e);
  }
};

export const deleteResourceLink = (linkId) => async (dispatch, getState) => {
  const { current } = getState().spaces;
  if (!current || current.id === 'root')
    return Promise.reject('cannot delete knowledge link in invalid space');
  if (!linkId) return Promise.reject('cannot delete invalid knowledge');
  try {
    await optimai.delete(`/space/${current.id}/resource/${linkId}`);
    dispatch(slice.actions.deleteCurrentResource(linkId));
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not delete knowledge link: ${e}`);
    return Promise.reject(e);
  }
};

export const deleteToolLink = (linkId, toolId, spaceId) => async (dispatch, getState) => {
  const { current } = getState().spaces;
  if (!current || current.id === 'root')
    return Promise.reject('cannot delete tool link in invalid space');
  if (!linkId) return Promise.reject('cannot delete invalid tool');
  try {
    await optimai.delete(`/space/${spaceId}/tools/${toolId}`);
    dispatch(slice.actions.deleteCurrentTool(linkId));
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not delete knowledge link: ${e}`);
    return Promise.reject(e);
  }
};

export const createWidget =
  ({ type, meta_data }) =>
  async (dispatch, getState) => {
    const { current } = getState().spaces;
    if (!current || current.id === 'root')
      return Promise.reject('cannot create widget in invalid space');
    try {
      const response = await optimai.post(`/space/${current.id}/widget`, {
        widget_type: type,
        meta_data,
      });
      const { layout } = response.data;
      dispatch(slice.actions.addCurrentWidget(layout));
      return Promise.resolve('success');
    } catch (e) {
      console.error(`error: could create widget: ${e}`);
      return Promise.reject(e);
    }
  };

export const addExistingWidgetToSpace =
  ({ widgetId }) =>
  async (dispatch, getState) => {
    const { current } = getState().spaces;
    if (!widgetId) return Promise.reject('cannot add unexisting widget');
    if (!current || current.id === 'root')
      return Promise.reject('cannot add widget to invalid space');
    try {
      const response = await optimai.post(`/space/${current.id}/widget/${widgetId}`);
      const { layout } = response.data;
      dispatch(slice.actions.addCurrentWidget(layout));
      return Promise.resolve('success');
    } catch (e) {
      console.error(`error: could add widget: ${e}`);
      return Promise.reject(e);
    }
  };

export const deleteWidgetFromSpace = (widgetId) => async (dispatch, getState) => {
  const { current } = getState().spaces;
  if (!widgetId) return Promise.reject('cannot delete invalid widget from space');
  try {
    await optimai.delete(`/space/${current.id}/widget/${widgetId}`);
    dispatch(slice.actions.deleteWidgetFromSpace(widgetId));
    return Promise.resolve(true);
  } catch (e) {
    console.error(`error: could not delete widget from space: ${e}`);
    return Promise.reject(e);
  }
};

export const deleteWidget =
  ({ widgetId }) =>
  async (dispatch, getState) => {
    if (!widgetId) return Promise.reject('cannot delete invalid space');
    try {
      await optimai.delete(`/widget/${widgetId}`);
      return Promise.resolve(true);
    } catch (e) {
      console.error(`error: could not delete widget: ${e}`);
      return Promise.reject(e);
    }
  };

export const createSpaceDomain = (data) => async (dispatch, getState) => {
  const { id: accountId } = getState().general.account;
  try {
    const res = await optimai.post(`/odysseus/${accountId}/token/create`);
    const { oatk } = res.data;

    const response = await optimai_root.post('/odysseus/wp/space/domain', data, {
      headers: {
        Authorization: `Bearer ${oatk}`,
      },
    });

    console.log('Oddysseus response', response);
    return Promise.resolve(response.data);
  } catch (e) {
    console.error(`error: could not scrape page: ${e}`);
    return Promise.reject(e);
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};
