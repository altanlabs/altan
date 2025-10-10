import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useParams, useHistory } from 'react-router';

import BaseLayout from './BaseLayout.jsx';
import LoadingFallback from '../../../components/LoadingFallback.jsx';
import HermesWebSocketProvider, {
  useHermesWebSocket,
} from '../../../providers/websocket/HermesWebSocketProvider.jsx';
import {
  deleteTableById,
  getBaseById,
  selectBaseById,
  loadTableRecords,
  preloadUsersForBase,
} from '../../../redux/slices/bases';
import { dispatch, useSelector } from '../../../redux/store';
import CreateBaseDialog from '../base/CreateBaseDialog.jsx';
import NoEntityPlaceholder from '../placeholders/NoEntityPlaceholder.jsx';
import CreateTableDialog from '../table/CreateTableDialog.jsx';
import { Typography } from '@mui/material';

// const selectBasesError = (state) => state.bases.error;

// Create a more specific loading selector
const selectBaseLoading = (state, baseId) => state.bases.loadingStates?.[baseId] || false;
// Create a specific table loading selector
const selectTableLoading = (state, tableId) => state.bases.tableLoadingStates?.[tableId] || false;

function Base({
  ids = [],
  onNavigate,
  baseId: explicitBaseId,
}) {
  const { altanerId, altanerComponentId, tableId, viewId: urlViewId, baseId: routeBaseId } = useParams();
  const history = useHistory();
  const ws = useHermesWebSocket();

  const baseId = explicitBaseId || routeBaseId || ids[0];
  // Default to "default" view if not in URL
  const viewId = urlViewId || 'default';

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
    activeSection: 'overview', // Default to overview
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
    (newTableId) => {
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
        });
      } else if (onNavigate) {
        onNavigate(null, {
          baseId,
          tableId: newTableId,
        });
      } else {
        const currentSearch = window.location.search;
        history.push(`/bases/${baseId}/tables/${newTableId}${currentSearch}`);
      }

      // Pre-fetch the table records to improve loading performance
      if (newTableId) {
        console.log('🔍 Base: Pre-fetching table records for table', newTableId);
        dispatch(loadTableRecords(newTableId, { limit: 50 }));
      }
    },
    [altanerId, altanerComponentId, baseId, onNavigate, history],
  );

  // Load base data
  useEffect(() => {
    if (baseId) {
      dispatch(getBaseById(baseId));
      // Preload users for this base to avoid redundant API calls
      dispatch(preloadUsersForBase(baseId)).catch(() => {
        // Silently handle errors - user cache is an optimization, not critical
      });
    }
  }, [baseId]);

  // Handle initial navigation once base and tables are loaded
  useEffect(() => {
    if (!base || !base.tables?.items || base.tables.items.length === 0) return;

    const tables = base.tables.items;
    const firstTable = tables[0];

    // Only navigate if we don't have a tableId yet
    if (!tableId) {
      // Use simplified URL without viewId
      if (altanerId) {
        onNavigate?.(altanerComponentId, { baseId, tableId: firstTable.id });
      } else {
        const currentSearch = window.location.search;
        history.push(`/bases/${baseId}/tables/${firstTable.id}${currentSearch}`);
      }
    }
    // Note: viewId is now optional - we use "default" internally without it being in the URL
    // Note: Record loading is handled by Table.jsx component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base?.tables?.items?.length, baseId]);

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
              navigateToPath(nextTable.id);
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

      setState((prev) => ({
        ...prev,
        isTableSwitching: true,
      }));

      dispatch(loadTableRecords(newTableId, { limit: 50 }));

      navigateToPath(newTableId);
    },
    [navigateToPath, tableId],
  );

  const handleOpenCreateTable = useCallback(
    () => setState((prev) => ({ ...prev, createTableOpen: true })),
    [],
  );

  const handleCloseCreateTable = useCallback(
    () => setState((prev) => ({ ...prev, createTableOpen: false })),
    [],
  );

  const handleImportTable = useCallback(
    (targetTableId) => {
      if (!targetTableId) return;

      // If we're already on the target table, trigger import directly
      if (targetTableId === tableId) {
        // This will be handled by GridView when it receives the import trigger
        setState((prev) => ({ ...prev, triggerImport: Date.now() }));
      } else {
        // Navigate to the target table first, then trigger import
        const targetTable = base?.tables?.items?.find((table) => table.id === targetTableId);
        const defaultView = targetTable?.views?.items?.[0]?.id || 'default';

        setState((prev) => ({
          ...prev,
          isTableSwitching: true,
          pendingImport: targetTableId,
        }));

        dispatch(loadTableRecords(targetTableId, { limit: 50 }));
        navigateToPath(targetTableId, defaultView);
      }
    },
    [tableId, base?.tables?.items, navigateToPath],
  );


  const handleCloseCreateBase = useCallback(
    () => setState((prev) => ({ ...prev, createBaseOpen: false })),
    [],
  );

  const handleSectionChange = useCallback((section) => {
    setState((prev) => ({ ...prev, activeSection: section }));
  }, []);

  const shouldShowPlaceholder = base && base?.tables?.items?.length === 0;

  // Subscribe to base updates
  useEffect(() => {
    if (!!baseId && ws?.isOpen) {
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

  // Show loading skeleton while base or tables are loading
  // Show loading if:
  // 1. Base is loading from API
  // 2. Base exists but tables haven't loaded yet AND still loading (waiting for pg-meta)
  // If loading is done but no tables, render anyway (could be 503/stopped instance or empty base)
  const isLoadingSchema = baseId && (!base || (!base.tables && isBaseLoading));

  if (isBaseLoading || isLoadingSchema) {
    return <LoadingFallback />;
  }

  return (
    <>
      <BaseLayout
        baseId={baseId}
        tableId={tableId}
        handleTabChange={handleTabChange}
        handleOpenCreateTable={handleOpenCreateTable}
        handleDeleteTable={handleDeleteTable}
        handleImportTable={handleImportTable}
        state={state}
        isTableLoading={isTableLoading}
        viewId={viewId}
        triggerImport={state.triggerImport}
        activeSection={state.activeSection}
        onSectionChange={handleSectionChange}
      />
      <CreateTableDialog
        baseId={baseId}
        open={state.createTableOpen}
        onClose={handleCloseCreateTable}
      />
    </>
  );
}

// Create a wrapper component that provides the HermesWebSocket
const BaseWithHermesWebSocket = memo(
  function BaseWithHermesWebSocket(props) {
    return (
      <HermesWebSocketProvider>
        <Base {...props} />
      </HermesWebSocketProvider>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.ids === nextProps.ids && prevProps.onNavigate === nextProps.onNavigate;
  },
);

export default BaseWithHermesWebSocket;
