import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useExternalData } from './SAExternalDataProvider';
// import { useSnackbar } from 'notistack';
import IconRenderer from '../../../../../components/icons/IconRenderer';
import { useMultiTab } from '../../providers/MultiTabProvider';
import {
  // fetchActionTypes,
  // fetchApps,
  // fetchConnectionTypes,
  // fetchConnections,
  executeAction,
  // fetchFullAction
} from '../helpers/api';

const ExternalSettingsContext = createContext(null);

export const useExternalSettings = () => useContext(ExternalSettingsContext);

const getDefaultValues = (allProperties, toolParameters) => {
  const defaultValues = {};

  Object.entries(allProperties).forEach(([key, schema]) => {
    const defaultValue = !!schema.default && !schema['x-extra'] ? schema.default : null;
    defaultValues[key] = toolParameters[key] || defaultValue;
  });

  return defaultValues;
};

export const SAExternalSettingsProvider = ({ index, children }) => {
  // const { enqueueSnackbar } = useSnackbar();
  const {
    availableApps,
    connectionTypesAtIndex,
    connectionsAtIndex,
    actionsAtIndex,
    setDataAtIndex,
    clearDataAtIndex,
    selectedAppAtIndex,
    selectedConnectionTypeAtIndex,
    selectedConnectionAtIndex,
    selectedActionAtIndex,
    selectAppAtIndex,
    selectConnectionTypeAtIndex,
    selectConnectionAtIndex,
    selectActionAtIndex,
  } = useExternalData();
  const [actionExecution, setActionExecution] = useState({
    loading: false,
    result: null,
    error: false,
  });

  const { setTab } = useMultiTab();

  const selectedApp = useMemo(() => selectedAppAtIndex(index), [selectedAppAtIndex, index]);
  const selectedConnectionType = useMemo(
    () => selectedConnectionTypeAtIndex(index),
    [selectedConnectionTypeAtIndex, index],
  );
  const selectedConnection = useMemo(
    () => selectedConnectionAtIndex(index),
    [selectedConnectionAtIndex, index],
  );
  const selectedAction = useMemo(
    () => selectedActionAtIndex(index),
    [selectedActionAtIndex, index],
  );
  const setSelectedApp = useCallback(
    (data) => selectAppAtIndex(index, data),
    [selectAppAtIndex, index],
  );
  const setSelectedConnectionType = useCallback(
    (data) => selectConnectionTypeAtIndex(index, data),
    [selectConnectionTypeAtIndex, index],
  );
  const setSelectedConnection = useCallback(
    (data) => selectConnectionAtIndex(index, data),
    [selectConnectionAtIndex, index],
  );
  const setSelectedAction = useCallback(
    (data) => selectActionAtIndex(index, data),
    [selectActionAtIndex, index],
  );
  const connectionTypes = useMemo(
    () => connectionTypesAtIndex(index),
    [connectionTypesAtIndex, index],
  );
  const connections = useMemo(() => connectionsAtIndex(index), [connectionsAtIndex, index]);
  const actions = useMemo(() => actionsAtIndex(index), [actionsAtIndex, index]);

  useEffect(() => {
    if (!selectedApp) return; // Ensure there's at least an app selected

    // Determine the icon: ConnectionType icon if available, otherwise App icon
    const icon = selectedConnectionType?.icon || selectedApp.icon;

    // Construct the label
    const parts = [
      selectedConnectionType?.name,
      selectedApp?.name,
      selectedConnection ? `(${selectedConnection.name})` : null,
    ].filter(Boolean); // Filter out null or undefined values
    const label = parts.join(' · ');

    // Construct the tooltip as a ReactNode
    const tooltip = (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <IconRenderer icon={selectedApp.icon} />
          <span>{selectedApp.name}</span>
        </div>
        {selectedConnectionType && (
          <div className="flex items-center space-x-2">
            <IconRenderer icon={selectedConnectionType.icon} />

            <span>{selectedConnectionType.name}</span>
          </div>
        )}
        {selectedConnection && (
          <div className="flex items-center space-x-2">
            <IconRenderer icon={selectedConnection.icon} />
            <span>{selectedConnection.name}</span>
          </div>
        )}
        {selectedAction && <span>{selectedAction.name}</span>}
      </div>
    );

    // Update the tab
    setTab(index, { icon, label, tooltip });
  }, [index, selectedApp, selectedConnectionType, selectedConnection, selectedAction, setTab]);

  const { allProperties, allRequired } = useMemo(() => {
    if (!selectedAction) {
      return {
        allProperties: {},
        allRequired: [],
      };
    }
    const properties = {
      ...(selectedAction?.headers?.properties || {}),
      ...(selectedAction?.path_params?.properties || {}),
      ...(selectedAction?.query_params?.properties || {}),
      ...(selectedAction?.body?.properties || {}),
    };
    const required = [
      ...(selectedAction?.headers?.required || []),
      ...(selectedAction?.path_params?.required || []),
      ...(selectedAction?.query_params?.required || []),
      ...(selectedAction?.body?.required || []),
    ];
    return {
      allProperties: properties,
      allRequired: required,
    };
  }, [selectedAction]);

  const defaultValues = getDefaultValues(allProperties, {});
  const toolParametersMethods = useForm({
    defaultValues: defaultValues,
  });

  const { watch, reset } = toolParametersMethods;

  const onResetActionExecution = useCallback(() => {
    clearDataAtIndex(index);
    setActionExecution({
      loading: false,
      result: null,
      error: false,
    });
  }, [setActionExecution, clearDataAtIndex, index]);

  const onActionExecute = useCallback(() => {
    if (!selectedConnection || !selectedAction) {
      return;
    }
    const parameters = watch();
    const cleanedParameters = Object.fromEntries(
      Object.entries(parameters ?? {}).filter(([_, value]) => ![null, undefined].includes(value)),
    );
    setActionExecution((prev) => ({ ...prev, loading: true }));
    executeAction(selectedConnection.id, selectedAction.id, cleanedParameters)
      .then((response) => setActionExecution((prev) => ({ ...prev, result: response })))
      .catch((error) => setActionExecution((prev) => ({ ...prev, result: error, error: true })))
      .finally(() => setActionExecution((prev) => ({ ...prev, loading: false })));
  }, [selectedConnection, selectedAction, watch]);

  useEffect(() => {
    reset();
    onResetActionExecution();
  }, [selectedAction?.id]);

  useEffect(() => {
    return () => {
      setSelectedApp(undefined);
    };
  }, []);

  const memoized = useMemo(
    () => ({
      apps: availableApps,
      connectionTypes,
      connections,
      actionTypes: actions,
      // selectedResource,
      actionExecution,
      selectedApp,
      selectedConnectionType,
      selectedConnection,
      selectedAction,
      toolParametersMethods,
      allRequired,
      allProperties,
      setSelectedApp,
      setSelectedConnectionType,
      setSelectedConnection,
      setSelectedAction,
      setActionExecution,
      onResetActionExecution,
      onActionExecute,
      setTableData: (data) => setDataAtIndex(index, data),
    }),
    [
      actionExecution,
      actions,
      allProperties,
      allRequired,
      availableApps,
      connectionTypes,
      connections,
      index,
      onActionExecute,
      onResetActionExecution,
      selectedAction,
      selectedApp,
      selectedConnection,
      selectedConnectionType,
      setDataAtIndex,
      setSelectedAction,
      setSelectedApp,
      setSelectedConnection,
      setSelectedConnectionType,
      toolParametersMethods,
    ],
  );

  return (
    <ExternalSettingsContext.Provider value={memoized}>{children}</ExternalSettingsContext.Provider>
  );
};
