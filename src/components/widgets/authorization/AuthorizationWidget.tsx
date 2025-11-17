import React, { memo, useEffect, useMemo } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import {
  selectAccountConnectionsByType,
  selectAccountConnectionsLoading,
  selectAccountConnectionsInitialized,
  getConnections,
  selectConnectionTypes,
} from '../../../redux/slices/connections';
import { selectAccount, selectCustomConnectionTypes } from '../../../redux/slices/general/index';
import { useSelector, dispatch } from '../../../redux/store';
import CreateConnection from '../../tools/CreateConnection';
import { useAuthorization } from './hooks/useAuthorization';
import { ConnectionSelector, AuthorizedState, LoadingState } from './components';
import type { AuthorizationWidgetProps } from './types';

// Combine connection types selector (reused from original)
const selectAllConnectionTypes = createSelector(
  [selectConnectionTypes, selectCustomConnectionTypes],
  (conns, myConns) => [...conns, ...(myConns ?? [])],
);

const AuthorizationWidget: React.FC<AuthorizationWidgetProps> = ({
  connectionTypeId,
  threadId,
}) => {
  const account = useSelector(selectAccount);
  const accountId = account?.id;
  const connectionsLoading = useSelector(selectAccountConnectionsLoading);
  const connectionsInitialized = useSelector(selectAccountConnectionsInitialized);
  const allConnectionTypes = useSelector(selectAllConnectionTypes);
  const connectionsByType = useSelector(selectAccountConnectionsByType(connectionTypeId));

  const connectionType = useMemo(
    () => allConnectionTypes?.find((type) => type.id === connectionTypeId),
    [allConnectionTypes, connectionTypeId],
  );

  const {
    isAuthorized,
    selectedConnectionId,
    showCreateNew,
    handleSelectConnection,
    handleCreateNew,
    handleClearAuthorization,
    setShowCreateNew,
  } = useAuthorization({
    connectionTypeId,
    threadId,
    connectionsByType,
    connectionType,
  });

  // Load connections on mount
  useEffect(() => {
    if (accountId && !connectionsInitialized && !connectionsLoading) {
      dispatch(getConnections(accountId));
    }
  }, [accountId, connectionsInitialized, connectionsLoading]);

  // Show creation form
  if (showCreateNew) {
    return (
      <div className="px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-950">
        <CreateConnection
          id={connectionTypeId}
          accountId={accountId}
          popup={false}
          setIsCreatingNewConnection={setShowCreateNew}
        />
      </div>
    );
  }

  // Show loading state
  if (connectionsLoading) {
    return <LoadingState />;
  }

  // Show authorized state
  if (isAuthorized) {
    return (
      <AuthorizedState
        authData={isAuthorized}
        onClear={handleClearAuthorization}
      />
    );
  }

  // Show selection form
  return (
    <div className="px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-950">
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
        Authorize {connectionType?.name || 'Connection'}
      </p>
      <ConnectionSelector
        connections={connectionsByType || []}
        connectionType={connectionType}
        selectedConnectionId={selectedConnectionId}
        onSelectConnection={handleSelectConnection}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
};

export default memo<AuthorizationWidgetProps>(
  AuthorizationWidget,
  (prevProps, nextProps) => {
    return (
      prevProps.connectionTypeId === nextProps.connectionTypeId &&
      prevProps.threadId === nextProps.threadId
    );
  },
);

