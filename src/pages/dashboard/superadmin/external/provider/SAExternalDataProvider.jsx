import { useSnackbar } from 'notistack';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  fetchActionTypes,
  fetchApps,
  fetchConnectionTypes,
  fetchConnections,
  fetchFullAction,
} from '../helpers/api';

const ExternalDataContext = createContext(null);

export const useExternalData = () => useContext(ExternalDataContext);

// const getDefaultValues = (allProperties, toolParameters) => {
//   const defaultValues = {};

//   Object.entries(allProperties).forEach(([key, schema]) => {
//     const defaultValue = schema.default || '';
//     defaultValues[key] = toolParameters[key] || defaultValue;
//   });

//   return defaultValues;
// };

const initialValues = {
  available: {},
  loading: {},
  selected: {},
  initialized: {},
};

export const SAExternalDataProvider = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState({});
  const [apps, setApps] = useState({
    available: [],
    loading: false,
    selected: {},
    initialized: false,
  });
  const [connectionTypes, setConnectionTypes] = useState(initialValues);
  const [connections, setConnections] = useState(initialValues);
  const [actionTypes, setActionTypes] = useState(initialValues);
  const [externalDevApps, setExternalDevApps] = useState(initialValues);
  const [selectedResource, setSelectedResource] = useState(null);

  const availableApps = useMemo(() => apps.available, [apps.available]);

  const selectedAppAtIndex = useCallback(
    (index) => apps.available.find((a) => a.id === apps.selected[index]),
    [apps.available, apps.selected],
  );

  const selectedConnectionTypeAtIndex = useCallback(
    (index) => {
      const selectedApp = selectedAppAtIndex(index);
      const selectedConnectionTypeId = connectionTypes.selected[index];
      if (!selectedApp || !selectedConnectionTypeId) {
        return null;
      }
      return connectionTypes.available[selectedApp.id].find(
        (a) => a.id === selectedConnectionTypeId,
      );
    },
    [connectionTypes.available, connectionTypes.selected, selectedAppAtIndex],
  );

  const selectedConnectionAtIndex = useCallback(
    (index) => {
      const selectedConnectionType = selectedConnectionTypeAtIndex(index);
      const selectedConnectionId = connections.selected[index];
      if (!selectedConnectionType || !selectedConnectionId) {
        return null;
      }
      return connections.available[selectedConnectionType.id].find(
        (a) => a.id === selectedConnectionId,
      );
    },
    [connections.available, connections.selected, selectedConnectionTypeAtIndex],
  );

  const selectedActionAtIndex = useCallback(
    (index) => {
      const selectedConnectionType = selectedConnectionTypeAtIndex(index);
      const selectedActionId = actionTypes.selected[index];
      if (!selectedConnectionType || !selectedActionId) {
        return null;
      }
      return actionTypes.available[selectedConnectionType.id].find(
        (a) => a.id === selectedActionId,
      );
    },
    [actionTypes.available, actionTypes.selected, selectedConnectionTypeAtIndex],
  );

  const setDataAtIndex = useCallback(
    (index, data) => setData((prev) => ({ ...prev, [index]: data })),
    [setData],
  );
  const clearDataAtIndex = useCallback(
    (index) => setData((prev) => ({ ...prev, [index]: undefined })),
    [setData],
  );
  const hasDataAtIndex = useCallback((index) => data[index] !== undefined, [data]);

  const connectionTypesAtIndex = useCallback(
    (index) => {
      const selectedApp = selectedAppAtIndex(index);
      if (!selectedApp) {
        return {
          loading: false,
          available: [],
        };
      }
      return {
        loading: connectionTypes.loading[selectedApp.id] ?? false,
        available: connectionTypes.available[selectedApp.id] ?? [],
      };
    },
    [connectionTypes.available, connectionTypes.loading, selectedAppAtIndex],
  );

  const connectionsAtIndex = useCallback(
    (index) => {
      const selectedConnectionType = selectedConnectionTypeAtIndex(index);
      if (!selectedConnectionType) {
        return {
          loading: false,
          available: [],
        };
      }
      return {
        loading: connections.loading[selectedConnectionType.id] ?? false,
        available: connections.available[selectedConnectionType.id] ?? [],
      };
    },
    [connections.available, connections.loading, selectedConnectionTypeAtIndex],
  );

  const actionsAtIndex = useCallback(
    (index) => {
      const selectedConnection = selectedConnectionAtIndex(index);
      const selectedConnectionType = selectedConnectionTypeAtIndex(index);
      if (!selectedConnection || !selectedConnectionType) {
        return {
          loading: false,
          available: [],
        };
      }
      return {
        loading: actionTypes.loading[selectedConnectionType.id] ?? false,
        available: actionTypes.available[selectedConnectionType.id] ?? [],
      };
    },
    [
      actionTypes.available,
      actionTypes.loading,
      selectedConnectionAtIndex,
      selectedConnectionTypeAtIndex,
    ],
  );

  const fetchData = useCallback(
    async (action, setter, state, parentId) => {
      try {
        if (state.loading[parentId] || state.initialized[parentId] || !parentId) {
          return;
        }
        setter((prev) => ({ ...prev, loading: true }));
        const data = await action(parentId);
        setter((prev) => ({ ...prev, available: { ...prev.available, [parentId]: data } }));
      } catch (error) {
        enqueueSnackbar('There was an error fetching the data.', { variant: 'error' });
        console.error(error.toString());
      } finally {
        setter((prev) => ({ ...prev, loading: false, initialized: true }));
      }
    },
    [enqueueSnackbar],
  );

  const selectAppAtIndex = useCallback(
    (index, id) => {
      setApps((prev) => ({ ...prev, selected: { ...prev.selected, [index]: id } }));
      fetchData(fetchConnectionTypes, setConnectionTypes, connectionTypes, id);
      setConnectionTypes((prev) => ({
        ...prev,
        selected: { ...prev.selected, [index]: undefined },
      }));
      setConnections((prev) => ({ ...prev, selected: { ...prev.selected, [index]: undefined } }));
      setActionTypes((prev) => ({ ...prev, selected: { ...prev.selected, [index]: undefined } }));
    },
    [fetchData, connectionTypes],
  );
  const selectConnectionTypeAtIndex = useCallback(
    (index, id) => {
      setConnectionTypes((prev) => ({ ...prev, selected: { ...prev.selected, [index]: id } }));
      fetchData(fetchConnections, setConnections, connections, id);
      setConnections((prev) => ({ ...prev, selected: { ...prev.selected, [index]: undefined } }));
      setActionTypes((prev) => ({ ...prev, selected: { ...prev.selected, [index]: undefined } }));
    },
    [fetchData, connections],
  );
  const selectConnectionAtIndex = useCallback(
    (index, id) => {
      setConnections((prev) => ({ ...prev, selected: { ...prev.selected, [index]: id } }));
      const selectedConnectionType = selectedConnectionTypeAtIndex(index);
      fetchData(fetchActionTypes, setActionTypes, actionTypes, selectedConnectionType.id);
      setActionTypes((prev) => ({ ...prev, selected: { ...prev.selected, [index]: undefined } }));
    },
    [selectedConnectionTypeAtIndex, fetchData, actionTypes],
  );
  const selectActionAtIndex = useCallback(
    (index, id) => {
      setActionTypes((prev) => ({ ...prev, selected: { ...prev.selected, [index]: id } }));
      const selectedConnectionType = selectedConnectionTypeAtIndex(index);
      const tempSelectedAction = actionTypes.available[selectedConnectionType.id].find(
        (a) => a.id === id,
      );
      if (tempSelectedAction?.id && !tempSelectedAction.hasFullDetails) {
        try {
          fetchFullAction(tempSelectedAction.id).then((updatedAction) =>
            setActionTypes((prev) => {
              const availableActionsFromAtIndex = prev.available[selectedConnectionType.id];
              const index = availableActionsFromAtIndex.findIndex(
                (a) => a.id === tempSelectedAction.id,
              );
              return {
                ...prev,
                available: {
                  ...prev.available,
                  [selectedConnectionType.id]: [
                    ...availableActionsFromAtIndex.slice(0, index),
                    updatedAction,
                    ...availableActionsFromAtIndex.slice(index + 1),
                  ],
                },
              };
            }),
          );
        } catch (e) {
          enqueueSnackbar('Could not fetch full action details', { variant: 'error' });
        }
      }
    },
    [selectedConnectionTypeAtIndex, actionTypes.available, enqueueSnackbar],
  );

  useEffect(() => {
    if (!apps.initialized && !apps.loading) {
      setApps((prev) => ({ ...prev, loading: true }));
      fetchApps()
        .then((res) => setApps((prev) => ({ ...prev, available: res })))
        .catch((e) => {
          enqueueSnackbar('There was an error fetching the data.', { variant: 'error' });
          console.error(e.toString());
        })
        .finally(() => setApps((prev) => ({ ...prev, loading: false, initialized: true })));
    }
  }, []);

  const memoized = useMemo(
    () => ({
      data,
      availableApps,
      connectionTypesAtIndex,
      connectionsAtIndex,
      actionsAtIndex,
      setDataAtIndex,
      clearDataAtIndex,
      hasDataAtIndex,
      selectedAppAtIndex,
      selectedConnectionTypeAtIndex,
      selectedConnectionAtIndex,
      selectedActionAtIndex,
      selectAppAtIndex,
      selectConnectionTypeAtIndex,
      selectConnectionAtIndex,
      selectActionAtIndex,
    }),
    [
      actionsAtIndex,
      availableApps,
      clearDataAtIndex,
      connectionTypesAtIndex,
      connectionsAtIndex,
      data,
      hasDataAtIndex,
      selectActionAtIndex,
      selectAppAtIndex,
      selectConnectionAtIndex,
      selectConnectionTypeAtIndex,
      selectedActionAtIndex,
      selectedAppAtIndex,
      selectedConnectionAtIndex,
      selectedConnectionTypeAtIndex,
      setDataAtIndex,
    ],
  );

  return <ExternalDataContext.Provider value={memoized}>{children}</ExternalDataContext.Provider>;
};
