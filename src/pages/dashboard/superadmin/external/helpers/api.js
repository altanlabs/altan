import { optimai, optimai_integration } from '../../../../../utils/axios';

const fetchApps = async () => {
  try {
    const response = await optimai.post('/graph/external-apps/multiple', {
      '@fields': ['@base', 'name', 'description', 'icon'],
    });
    return Promise.resolve(response.data.items);
  } catch (e) {
    return Promise.reject(e);
  }
};

const fetchConnectionTypes = async (appId) => {
  const response = await optimai.post('/graph/external-apps', {
    '@fields': 'id',
    connection_types: {
      '@fields': ['@base', 'name', 'description', 'icon', 'auth_type', 'details', 'app_id'],
    },
    '@filter': {
      id: {
        _eq: appId,
      },
    },
  });
  return response.data.externalapp.connection_types.items;
};

const fetchConnections = async (connTypeId) => {
  const response = await optimai.post('/graph/connection-types', {
    '@fields': 'id',
    connections: {
      '@fields': '@all',
      account: {
        '@fields': ['id', 'name'],
        company: {
          '@fields': ['id', 'name', 'logo_url'],
        },
      },
    },
    '@filter': {
      id: {
        _eq: connTypeId,
      },
    },
  });
  const connections = response.data.connectiontype.connections.items;
  const transformedConnections = connections.map((connection) => ({
    ...connection,
    name: `${connection.name} · ${connection.account.company?.name || connection.account.name}`,
    icon: connection.account.company?.logo_url,
  }));
  return transformedConnections;
};

const fetchActionTypes = async (connTypeId) => {
  const response = await optimai.post('/graph/connection-types', {
    '@fields': 'id',
    actions: {
      '@fields': '@all',
    },
    '@filter': {
      id: {
        _eq: connTypeId,
      },
    },
  });
  const actions = response.data.connectiontype.actions.items;
  const transformedActions = actions.map((action) => ({
    ...action,
    icon: `tabler:http-${action.method.toLowerCase()}`,
  }));
  return transformedActions;
};

const fetchFullAction = async (actionTypeId) => {
  const response = await optimai_integration.get(`/action/${actionTypeId}`);
  const action = response.data.action_type;
  return Promise.resolve({
    ...action,
    icon: `tabler:http-${action.method.toLowerCase()}`,
    hasFullDetails: true,
  });
};

const executeAction = async (connectionId, actionId, parameters = {}) => {
  try {
    const response = await optimai_integration.post(
      `/connection/${connectionId}/actions/${actionId}/execute`,
      parameters,
    );
    const { success, data } = response.data;
    if (!success) {
      return Promise.reject(data);
    }
    return Promise.resolve(data);
  } catch (e) {
    return Promise.reject(e);
  }
};

const fetchResourceType = async (resourceTypeId) => {
  try {
    const response = await optimai_integration.get(`/resource-type/${resourceTypeId}`);
    return Promise.resolve(response.data.resource_type);
  } catch (e) {
    return Promise.reject(e);
  }
};

export {
  fetchActionTypes,
  fetchApps,
  fetchConnections,
  fetchConnectionTypes,
  fetchResourceType,
  fetchFullAction,
  executeAction,
};
