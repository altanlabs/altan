import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useParams, useHistory } from 'react-router';

import BaseLayout from './BaseLayout.jsx';
import LoadingFallback from '../../../components/LoadingFallback.jsx';
import HermesWebSocketProvider, { useHermesWebSocket } from '../../../providers/websocket/HermesWebSocketProvider.jsx';
import {
  deleteTableById,
  getBaseById,
  selectBaseById,
  updateTableById,
  loadAllTableRecords,
  preloadUsersForBase,
} from '../../../redux/slices/bases';
import { dispatch, useSelector } from '../../../redux/store';
import CreateBaseDialog from '../base/CreateBaseDialog.jsx';
import NoEntityPlaceholder from '../placeholders/NoEntityPlaceholder.jsx';
import CreateTableDialog from '../table/CreateTableDialog.jsx';

// const selectBasesError = (state) => state.bases.error;

// Create a more specific loading selector
const selectBaseLoading = (state, baseId) => state.bases.loadingStates?.[baseId] || false;
// Create a specific table loading selector
const selectTableLoading = (state, tableId) => state.bases.tableLoadingStates?.[tableId] || false;

function Base({
  ids = [],
  onNavigate,
  baseId: explicitBaseId,
  hideChat = true,
  //  ...props
}) {
  const { altanerId, altanerComponentId, tableId, viewId, baseId: routeBaseId } = useParams();
  const history = useHistory();
  const ws = useHermesWebSocket();

  const baseId = explicitBaseId || routeBaseId || ids[0];

  const baseSelector = useMemo(
    () => (state) => (baseId ? selectBaseById(state, baseId) : null),
    [baseId],
  );

  const base = useSelector(baseSelector);
  const isBaseLoading = useSelector((state) => selectBaseLoading(state, baseId));
  const isTableLoading = useSelector((state) => selectTableLoading(state, tableId));

  const [state, setState] = useState({
    activeTab: tableId,
    createTableOpen: false,
    createBaseOpen: false,
    isTableSwitching: false,
  });

  // Initialize base and handle navigation
  useEffect(() => {
    if (ids?.length > 0 && (!baseId || baseId === 'null')) {
      if (altanerId) {
        onNavigate?.(altanerComponentId, { baseId: ids[0] });
      }
    }
  }, [ids, baseId, altanerId, altanerComponentId, onNavigate]);

  const navigateToPath = useCallback(
    (newTableId, newViewId) => {
      // Set table switching state to true when navigation starts
      setState((prev) => ({
        ...prev,
        isTableSwitching: true,
        activeTab: newTableId,
      }));

      if (altanerId) {
        onNavigate?.(altanerComponentId, {
          baseId,
          tableId: newTableId,
          viewId: newViewId,
        });
      } else if (onNavigate) {
        onNavigate(null, {
          baseId,
          tableId: newTableId,
          viewId: newViewId,
        });
      } else {
        const currentSearch = window.location.search;
        history.push(`/bases/${baseId}/tables/${newTableId}/views/${newViewId}${currentSearch}`);
      }

      // Pre-fetch the table records to improve loading performance
      if (newTableId) {
        dispatch(loadAllTableRecords(newTableId));
      }
    },
    [altanerId, altanerComponentId, baseId, onNavigate, history],
  );

  // Load base data and handle initial navigation
  useEffect(() => {
    if (baseId) {
      dispatch(getBaseById(baseId)).then((response) => {
        const tables = response?.base?.tables?.items || [];

        // Preload users for this base to avoid redundant API calls
        // This runs in parallel with navigation, so it won't block the UI
        dispatch(preloadUsersForBase(baseId)).catch(() => {
          // Silently handle errors - user cache is an optimization, not critical
        });

        if (tables.length > 0) {
          const firstTable = tables[0];
          const firstView = firstTable.views?.items?.[0]?.id || 'default';

          if (!tableId) {
            navigateToPath(firstTable.id, firstView);
          } else if (!viewId) {
            const currentTable = tables.find((table) => table.id === tableId);
            const defaultView = currentTable?.views?.items?.[0]?.id || 'default';
            navigateToPath(tableId, defaultView);
          }
        }
      });
    }
  }, [baseId, tableId, viewId, navigateToPath]);

  // Clear table switching state when table or loading state changes
  useEffect(() => {
    if (state.isTableSwitching && !isTableLoading && tableId) {
      setState((prev) => ({ ...prev, isTableSwitching: false }));
    }
  }, [tableId, isTableLoading, state.isTableSwitching]);

  const handleDeleteTable = useCallback(
    (tableId) => {
      if (!tableId) return;

      dispatch(deleteTableById(baseId, tableId))
        .then(() => {
          if (tableId === state.activeTab) {
            const remainingTables = base?.tables?.items?.filter((t) => t.id !== tableId);
            if (remainingTables?.length > 0) {
              const nextTable = remainingTables[0];
              const nextView = nextTable.views?.items?.[0]?.id || 'default';
              navigateToPath(nextTable.id, nextView);
            } else {
              if (altanerId) {
                onNavigate?.(altanerComponentId, { baseId });
              } else {
                history.push(`/bases/${baseId}`);
              }
            }
          }
        })
        .catch(() => {
          // Error deleting table - silently handled
        });
    },
    [
      baseId,
      state.activeTab,
      base?.tables?.items,
      navigateToPath,
      altanerId,
      onNavigate,
      altanerComponentId,
      history,
    ],
  );

  useEffect(() => {
    if (tableId !== state.activeTab && !state.isTableSwitching) {
      setState((prev) => ({ ...prev, activeTab: tableId }));
    }
  }, [state.activeTab, tableId, state.isTableSwitching]);

  const handleTabChange = useCallback(
    (newTableId) => {
      if (newTableId === tableId) return; // Don't history.push if already on this tab

      const targetTable = base?.tables?.items?.find((table) => table.id === newTableId);
      const defaultView = targetTable?.views?.items?.[0]?.id || viewId || 'default';

      setState((prev) => ({
        ...prev,
        isTableSwitching: true,
      }));

      dispatch(loadAllTableRecords(newTableId));

      navigateToPath(newTableId, defaultView);
    },
    [base?.tables?.items, viewId, navigateToPath, tableId],
  );

  const handleOpenCreateTable = useCallback(
    () => setState((prev) => ({ ...prev, createTableOpen: true })),
    [],
  );

  const handleCloseCreateTable = useCallback(
    () => setState((prev) => ({ ...prev, createTableOpen: false })),
    [],
  );

  const handleRenameTable = useCallback(
    (tableId, newName) => {
      if (!tableId) return;
      try {
        dispatch(updateTableById(baseId, tableId, { name: newName }));
      } catch {
        // console.error('Error renaming table:', error);
      }
    },
    [baseId],
  );

  const handleOpenCreateBase = useCallback(
    () => setState((prev) => ({ ...prev, createBaseOpen: true })),
    [],
  );

  const handleCloseCreateBase = useCallback(
    () => setState((prev) => ({ ...prev, createBaseOpen: false })),
    [],
  );

  const shouldShowPlaceholder = base && base?.tables?.items.length === 0;

  // Subscribe to base updates
  useEffect(() => {
    if (!!baseId && ws?.isOpen) {
      console.log('🔔 Base: Subscribing to base updates:', {
        baseId,
        wsReadyState: ws.websocket?.readyState,
        isOpen: ws.isOpen,
      });
      ws.subscribe(`base:${baseId}`);
    }
  }, [ws?.isOpen, baseId]); // Only depend on ws.isOpen, not the entire ws object

  // Cleanup subscriptions and state
  useEffect(() => {
    return () => {
      setState({
        activeTab: null,
        createTableOpen: false,
        createBaseOpen: false,
        isTableSwitching: false,
      });
      if (!!ws?.isOpen && !!baseId) {
        ws.unsubscribe(`base:${baseId}`);
      }
    };
  }, [baseId]); // Only depend on baseId for cleanup

  if (isBaseLoading) {
    return <LoadingFallback />;
  }
  if (!baseId) {
    return (
      <>
        <CreateBaseDialog
          open={state.createBaseOpen}
          onClose={handleCloseCreateBase}
          altanerId={altanerId}
          altanerComponentId={altanerComponentId}
        />
        <NoEntityPlaceholder
          title="No bases available"
          description="Create your first base to get started"
          buttonMessage="Create base"
          onButtonClick={handleOpenCreateBase}
          videoUrl="https://www.youtube.com/watch?v=lHtdZgR3SYw"
        />
      </>
    );
  }

  return (
    <>
      {shouldShowPlaceholder ? (
        <NoEntityPlaceholder
          title="No tables found in this base"
          description="Create your first table to get started"
          buttonMessage="Create Table"
          onButtonClick={handleOpenCreateTable}
        />
      ) : (
        <BaseLayout
          baseId={baseId}
          tableId={tableId}
          handleTabChange={handleTabChange}
          handleOpenCreateTable={handleOpenCreateTable}
          handleDeleteTable={handleDeleteTable}
          handleRenameTable={handleRenameTable}
          state={state}
          isTableLoading={isTableLoading}
          viewId={viewId}
        />
      )}
      <CreateTableDialog
        baseId={baseId}
        open={state.createTableOpen}
        onClose={handleCloseCreateTable}
      />
    </>
  );
}

// Create a wrapper component that provides the HermesWebSocket
const BaseWithHermesWebSocket = memo(function BaseWithHermesWebSocket(props) {
  return (
    <HermesWebSocketProvider>
      <Base {...props} />
    </HermesWebSocketProvider>
  );
}, (prevProps, nextProps) => {
  return prevProps.ids === nextProps.ids && prevProps.onNavigate === nextProps.onNavigate;
});

export default BaseWithHermesWebSocket;
