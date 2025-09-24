/* eslint-disable react/display-name */
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { GridChartsModule } from '@ag-grid-enterprise/charts';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { LicenseManager } from '@ag-grid-enterprise/core';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';
import { useTheme } from '@mui/material';
import { debounce, maxBy } from 'lodash-es';
import { memo, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { createColumnDefs } from './columns/index.js';
import AttachmentEditor from './editors/AttachmentEditor';
import JsonEditor from './editors/JsonEditor';
import ReferenceField from './editors/ReferenceField';
import EmptyTableState from './EmptyTableState';
import useOptimizedRowData from './helpers/useOptimizedRowData.jsx';
import { useWebSocketIntegration } from './helpers/useWebSocketIntegration.js';
import createFieldContextMenuItems from './menu/fieldContextMenu';
import createRecordContextMenuItems from './menu/recordContextMenu';
import { headerHeight, defaultColDef } from './utils/settings.js';
import {
  queryTableRecords,
  selectDatabaseQuickFilter,
  selectDatabaseSearching,
  loadTableRecords,
  importCSVToTable,
} from '../../../../redux/slices/bases';
import { selectAccount } from '../../../../redux/slices/general';
import { createMedia } from '../../../../redux/slices/media';
import { dispatch, useSelector } from '../../../../redux/store';
import Iconify from '../../../iconify';
import CreateFieldDialog from '../../fields/CreateFieldDialog.jsx';
import EditFieldDrawer from '../../fields/EditFieldDrawer.jsx';
import ImportCSVDrawer from '../../import/ImportCSVDrawer';
import CreateRecordDialog from '../../records/CreateRecordDialog';
import EditRecordDialog from '../../records/EditRecordDialog';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1]; // Remove data:type;base64, prefix
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowGroupingModule,
  GridChartsModule,
  MenuModule,
  ClipboardModule,
  RangeSelectionModule,
  RichSelectModule,
  StatusBarModule,
  SideBarModule,
  ColumnsToolPanelModule,
  FiltersToolPanelModule,
]);

// Register custom editors
const components = {
  JsonEditor: JsonEditor,
  ReferenceField: ReferenceField,
  AttachmentEditor: AttachmentEditor,
};

LicenseManager.setLicenseKey(
  'Altan_Products[v3][][0102]_MjA4MjY3MjAwMDAwMA==b79026526b81b3a5d7175371f58a75bd',
);

export const GridView = memo(
  ({
    table,
    fields,
    records,
    onAddRecord,
    onUpdateRecord,
    onDeleteRecords,
    onDuplicateRecord,
    triggerImport,
  }) => {
    const theme = useTheme();
    const gridRef = useRef();
    const history = useHistory();
    const location = useLocation();
  const members = useSelector((state) => selectAccount(state)?.members || []);
  const quickFilterText = useSelector(selectDatabaseQuickFilter);
  const isSearching = useSelector(selectDatabaseSearching);
    const [showFieldDialog, setShowFieldDialog] = useState(false);
    const [localRowData, setLocalRowData] = useState([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showImportDrawer, setShowImportDrawer] = useState(false);
    const [editRecordId, setEditRecordId] = useState(null);
    const [editField, setEditField] = useState(null);
  const [isReady, setIsReady] = useState(false);

    // Use ref for cols to avoid unnecessary re-renders
    const colsRef = useRef([]);

    // Track record creation to avoid duplicates by maintaining a set of recently added IDs
    const recentlyAddedRecordIds = useRef(new Set());

    // Track initial grid setup to prevent flushSync issues
    const initialGridSetupComplete = useRef(false);

  // Use ref for tracking when component is mounted to avoid updates during unmount
  const isMounted = useRef(true);

  // Use optimized row data hook
  const optimizedRowData = useOptimizedRowData(records, fields, recentlyAddedRecordIds.current);

  // Calculate max width for email fields
    const getEmailColumnWidths = useCallback(
      (rowData) => {
        if (!rowData?.length) return {};

        const emailFields = fields.filter((field) => field.type === 'email');
        if (!emailFields.length) return {};

        const widths = {};

        emailFields.forEach((field) => {
          const fieldName = field.db_field_name;
          const maxLength = maxBy(rowData, (row) => {
            const value = row[fieldName];
            return value ? value.toString().length : 0;
          });

          if (maxLength) {
            // Approximate width based on character count (8px per character is a good estimate)
            const charWidth = 8;
            const padding = 24; // Add some padding
            widths[fieldName] = Math.min(
              Math.max(maxLength * charWidth + padding, 200), // Min width 200px
              600, // Max width 600px to prevent extremely wide columns
            );
          }
        });

        return widths;
      },
      [fields],
    );

    // Calculate email column widths when data changes
    const emailColumnWidths = useMemo(
      () => getEmailColumnWidths(optimizedRowData),
      [optimizedRowData, getEmailColumnWidths],
    );

    // High-frequency async transaction manager for real-time updates
    const asyncTransactionManager = useRef({
      pendingUpdates: new Map(),
      pendingAdds: [],
      pendingRemoves: [],
      isProcessing: false,
      transactionCount: 0,
    });

    // Apply async transactions for high-frequency updates
    const applyAsyncTransaction = useCallback(
      (transaction, callback) => {
        if (!gridRef.current?.api || !isMounted.current) {
          callback?.(null);
          return;
        }

        try {
          gridRef.current.api.applyTransactionAsync(
            {
              ...transaction,
              suppressFlash: true,
              suppressVerticalScroll: true,
            },
            (result) => {
              asyncTransactionManager.current.transactionCount++;
              callback?.(result);
            }
          );
        } catch (error) {
          console.error('Error applying async transaction:', error);
          callback?.(null);
        }
      },
      []
    );

    // Handle record updates using async transactions
    const handleRecordUpdate = useCallback(
      (recordId, changes, isHighFrequency = false) => {
        if (!isMounted.current || !gridRef.current?.api) return;

        const manager = asyncTransactionManager.current;

        if (isHighFrequency) {
          // For high-frequency updates, batch them
          manager.pendingUpdates.set(recordId, { ...changes, id: recordId });
        } else {
          // For single updates, apply immediately with async transaction
          applyAsyncTransaction({
            update: [{ ...changes, id: recordId }]
          });
        }
      },
      [applyAsyncTransaction]
    );

    // Handle record additions using async transactions
    const handleRecordAdd = useCallback(
      (record, isHighFrequency = false) => {
        if (!isMounted.current || !gridRef.current?.api) return;

        const manager = asyncTransactionManager.current;

        if (isHighFrequency) {
          // For high-frequency adds, batch them
          manager.pendingAdds.push(record);
        } else {
          // For single adds, apply immediately with async transaction
          applyAsyncTransaction({
            add: [record]
          });
        }
      },
      [applyAsyncTransaction]
    );

    // Handle record deletions using async transactions
    const handleRecordDelete = useCallback(
      (recordIds, isHighFrequency = false) => {
        if (!isMounted.current || !gridRef.current?.api) return;

        const manager = asyncTransactionManager.current;
        const ids = Array.isArray(recordIds) ? recordIds : [recordIds];

        if (isHighFrequency) {
          // For high-frequency deletes, batch them
          manager.pendingRemoves.push(...ids.map(id => ({ id })));
        } else {
          // For single deletes, apply immediately with async transaction
          applyAsyncTransaction({
            remove: ids.map(id => ({ id }))
          });
        }
      },
      [applyAsyncTransaction]
    );

    // WebSocket integration for real-time updates
    const {
      handleWebSocketUpdate,
      handleWebSocketAdd,
      handleWebSocketDelete,
      forceFlush: flushWebSocketUpdates,
      clearUpdateFlags,
      getBufferStats,
    } = useWebSocketIntegration(
      table?.id,
      handleRecordUpdate,
      handleRecordAdd,
      handleRecordDelete,
    );

    // Flush pending high-frequency transactions
    const flushPendingTransactions = useCallback(() => {
      if (!gridRef.current?.api || !isMounted.current) return;

      const manager = asyncTransactionManager.current;
      if (manager.isProcessing) return;

      const hasUpdates = manager.pendingUpdates.size > 0;
      const hasAdds = manager.pendingAdds.length > 0;
      const hasRemoves = manager.pendingRemoves.length > 0;

      if (!hasUpdates && !hasAdds && !hasRemoves) return;

      manager.isProcessing = true;

      const transaction = {};
      
      if (hasUpdates) {
        transaction.update = Array.from(manager.pendingUpdates.values());
        manager.pendingUpdates.clear();
      }
      
      if (hasAdds) {
        transaction.add = [...manager.pendingAdds];
        manager.pendingAdds.length = 0;
      }
      
      if (hasRemoves) {
        transaction.remove = [...manager.pendingRemoves];
        manager.pendingRemoves.length = 0;
      }

      applyAsyncTransaction(transaction, () => {
        manager.isProcessing = false;
      });
    }, [applyAsyncTransaction]);

    // Auto-flush pending transactions every 100ms for high-frequency updates
    useEffect(() => {
      const interval = setInterval(() => {
        flushPendingTransactions();
      }, 100);

      return () => {
        clearInterval(interval);
        // Flush any remaining transactions on cleanup
        if (gridRef.current?.api) {
          try {
            gridRef.current.api.flushAsyncTransactions();
          } catch (error) {
            console.error('Error flushing async transactions:', error);
          }
        }
      };
    }, [flushPendingTransactions]);

    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);

    // Use AG-Grid's built-in client-side filtering - much simpler and no server loops

    // Simplified initial data loading logic
    useEffect(() => {
      if (!Array.isArray(records) || !Array.isArray(fields) || !isMounted.current) return;

      // Set local row data first
      setLocalRowData(optimizedRowData);
    }, [optimizedRowData, records, fields]);

    // Separate effect for handling ready state
    useEffect(() => {
      if (!isReady && Array.isArray(records) && Array.isArray(fields) && localRowData?.length > 0) {
        // Use requestAnimationFrame to ensure we're outside React's rendering phase
        requestAnimationFrame(() => {
          if (isMounted.current) {
            setIsReady(true);
          }
        });
      }
    }, [isReady, records, fields, localRowData]);

    const handleExpandRecord = useCallback(
      (recordId) => {
        setEditRecordId(recordId);
        history.push(`${location.pathname}/records/${recordId}`);
      },
      [history, location.pathname],
    );

    const getContextMenuItems = useCallback(
      (params) => {
        const selectedNodes = params.api.getSelectedNodes();
        const currentNode = params.node;

        return createRecordContextMenuItems({
          selectedNodes,
          currentNode,
          params,
          handlers: {
            onDuplicateRecord,
            onDeleteRecords,
            handleExpandRecord,
            onAddRecord,
            onUpdateRecord,
          },
        });
      },
      [onDeleteRecords, onDuplicateRecord, handleExpandRecord, onAddRecord, onUpdateRecord],
    );

    const getCommonFieldMenuItems = useCallback((field, params) => {
      return createFieldContextMenuItems(field, params, setEditField, table?.id);
    }, [table?.id]);

    const onGridReady = useCallback((params) => {
      gridRef.current = params;
      initialGridSetupComplete.current = true;
      // Remove all immediate API calls that cause flushSync issues
      // Grid will work fine without these optimizations
    }, []);

    // Modified handler for cell value changes
    const onCellValueChanged = useCallback(
      async (params) => {
        if (!isMounted.current || !params?.data) return;

        try {
          if (params.data.id === '+') {
            const fieldsPayload = {};
            Object.entries(params.data).forEach(([key, value]) => {
              if (key !== 'id' && value !== '' && value !== null && value !== undefined) {
                fieldsPayload[key] = value;
              }
            });

            if (Object.keys(fieldsPayload).length > 0) {
              const result = await onAddRecord({ records: [{ fields: fieldsPayload }] });
              if (result?.records?.[0] && gridRef.current?.api) {
                // Use async transaction for the new record
                handleRecordAdd(result.records[0]);
                // Also update the local row data to reflect the change from '+' to actual record
                const updatedRowData = localRowData.map(row => 
                  row.id === '+' ? result.records[0] : row
                );
                setLocalRowData(updatedRowData);
              }
            }
          } else {
            const changes = { [params.column.colId]: params.newValue };
            try {
              const updatedRecord = await onUpdateRecord(params.data.id, changes);
              if (updatedRecord && gridRef.current?.api) {
                // Use async transaction for the update
                handleRecordUpdate(params.data.id, { ...params.data, ...changes });
              }
            } catch {
              // console.error('Error updating record');
              if (gridRef.current?.api) {
                // Revert the change using async transaction
                handleRecordUpdate(params.data.id, {
                  ...params.data,
                  [params.column.colId]: params.oldValue,
                });
              }
            }
          }
        } catch {
          // console.error('Error in cell value change handler');
        }
      },
      [onAddRecord, onUpdateRecord, handleRecordUpdate],
    );

    const onCellKeyPress = useCallback(
      (e) => {
        if (e.event.key === 'Enter' && e.data.id === '+') {
          onCellValueChanged(e);
        }
      },
      [onCellValueChanged],
    );

    const columnDefs = useMemo(() => {
      const defs = createColumnDefs({
        fields,
        table,
        members,
        handleExpandRecord,
        setShowFieldDialog: () => setShowFieldDialog(true),
        getCommonFieldMenuItems,
        onEditField: setEditField, // Add direct edit field handler
        // Add email column widths to column definitions
        getAdditionalColumnProps: (field) => {
          if (field.type === 'email' && emailColumnWidths[field.db_field_name]) {
            return {
              width: emailColumnWidths[field.db_field_name],
              suppressSizeToFit: true, // Prevent auto-resizing
            };
          }
          return {};
        },
      });

      // Add checkbox selection to the first column
      if (defs.length > 0) {
        const firstCol = defs[0];
        defs[0] = {
          ...firstCol,
          // Enable checkbox selection for regular rows
          checkboxSelection: true,
          // Enable the header checkbox
          headerCheckboxSelection: true,
          // Only filter checked rows when filtering
          headerCheckboxSelectionFilteredOnly: true,
          // Don't allow selecting the '+' row
          checkboxSelectionDisabled: (params) => params.data?.id === '+',
          // Make the column a bit wider to fit the checkbox
          width: (firstCol.width || 100) + 20,
        };
      }

      // Store the latest columns in a ref to avoid continuous rerenders
      colsRef.current = defs;
      return defs;
    }, [
      fields,
      table,
      members,
      handleExpandRecord,
      setShowFieldDialog,
      getCommonFieldMenuItems,
      setEditField,
      emailColumnWidths,
    ]);

    // Keep track of which record-IDs we’ve already fetched
    const fetchedRef = useRef(new Map());

    // Extract reference fields when the table schema changes
    const referenceFields = useMemo(() => {
      if (!table?.fields?.items) return [];
      return table.fields.items.filter((field) => {
        return (
          field.type === 'reference' &&
          field.options &&
          field.options.reference_options &&
          field.options.reference_options.foreign_table
        );
      });
    }, [table?.fields?.items]);

    // Only dispatch queries for *new* related IDs
    const fetchRelatedRecords = useCallback(
      (recordsToProcess) => {
        if (!referenceFields.length || !recordsToProcess || !recordsToProcess.length) return;

        const toDispatch = new Map();

        recordsToProcess.forEach((rec) => {
          referenceFields.forEach((field) => {
            const opts = field.options && field.options.reference_options;
            const foreignTableId = opts && opts.foreign_table;
            const raw = rec[field.db_field_name];
            if (!foreignTableId || !raw) return;

            const ids = Array.isArray(raw) ? raw : [raw];
            ids.forEach((id) => {
              if (!id) return;

              // Initialize our fetched‐tracker for this table
              if (!fetchedRef.current.has(foreignTableId)) {
                fetchedRef.current.set(foreignTableId, new Set());
              }
              const already = fetchedRef.current.get(foreignTableId);

              // If we haven’t fetched it yet, queue it
              if (!already.has(id)) {
                if (!toDispatch.has(foreignTableId)) {
                  toDispatch.set(foreignTableId, new Set());
                }
                toDispatch.get(foreignTableId).add(id);
                already.add(id);
              }
            });
          });
        });

        // Dispatch one batched query per foreignTableId
        toDispatch.forEach((idSet, foreignTableId) => {
          if (idSet.size) {
            dispatch(
              queryTableRecords(foreignTableId, {
                filter: { id: { in: Array.from(idSet) } },
              }),
            );
          }
        });
      },
      [referenceFields],
    );

    // Create a stable debounced function just once
    const debouncedFetch = useRef(
      debounce((recordsArr) => fetchRelatedRecords(recordsArr), 250),
    ).current;

    useEffect(() => {
      if (records && records.length) {
        debouncedFetch(records);
      }
      return () => {
        debouncedFetch.cancel();
      };
    }, [records, debouncedFetch]);

    // Listen for async transactions applied event for debugging
    const onAsyncTransactionsApplied = useCallback((event) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Async transactions applied:', {
          results: event.results?.length || 0,
          totalTransactions: asyncTransactionManager.current.transactionCount
        });
      }
    }, []);

    // Cleanup async transactions on unmount
    useEffect(() => {
      return () => {
        if (gridRef.current?.api) {
          try {
            gridRef.current.api.flushAsyncTransactions();
          } catch (error) {
            console.error('Error flushing async transactions on cleanup:', error);
          }
        }
        // Clear any pending transactions
        const manager = asyncTransactionManager.current;
        manager.pendingUpdates.clear();
        manager.pendingAdds.length = 0;
        manager.pendingRemoves.length = 0;
      };
    }, []);

    // Add data loading states to show in the UI
    // const isDataLoading = !isReady || !initialGridSetupComplete.current;

    // Check if table is empty (no real records, only the '+' row for new records)
    const hasRealRecords = useMemo(() => {
      if (!Array.isArray(records)) return false;
      return records.some(record => record && record.id !== '+');
    }, [records]);

    // Handler for CSV import
    const handleImportCSV = useCallback(() => {
      setShowImportDrawer(true);
    }, []);

    // Handler for actual import process
    const handleCSVImport = useCallback(async (file, previewData) => {
      try {
        // Step 1: Upload the CSV file as media to get a URL
        const mediaUrl = await dispatch(createMedia({
          fileName: file.name,
          fileContent: await fileToBase64(file),
          fileType: file.type || 'text/csv',
        }));

        if (!mediaUrl) {
          throw new Error('Failed to upload CSV file');
        }

        // Step 2: Create column mapping from CSV headers to table fields
        const columnMapping = {};
        const tableFields = fields || [];
        // Map CSV headers to database field names
        previewData.headers.forEach((csvHeader, index) => {
          // Try to find a matching field by name (case insensitive)
          const matchingField = tableFields.find((field) =>
            field.name.toLowerCase() === csvHeader.toLowerCase() ||
            field.db_field_name.toLowerCase() === csvHeader.toLowerCase(),
          );

          if (matchingField) {
            columnMapping[csvHeader] = matchingField.db_field_name;
          } else {
            // If no exact match, use index-based mapping
            columnMapping[index.toString()] = csvHeader.toLowerCase().replace(/\s+/g, '_');
          }
        });

        // Step 3: Call the import endpoint
        const importData = {
          file_url: mediaUrl,
          column_mapping: columnMapping,
          has_header: true,
          batch_size: 1000,
          use_staging: false,
          validate_only: false,
        };

        const response = await dispatch(importCSVToTable(table.id, importData));

        // Refresh the table records after successful import
        await dispatch(loadTableRecords(table.id, { forceReload: true }));

        return response;
      } catch (error) {
        // console.error('CSV import error:', error);
        throw error;
      }
    }, [fields, table?.id]);

    // Watch for import trigger from context menu
    useEffect(() => {
      if (triggerImport) {
        setShowImportDrawer(true);
      }
    }, [triggerImport]);

    return (
      <div className="h-full w-full flex flex-col min-w-0">
        <div className="flex-grow flex min-w-0">
          <div
            className={`ag-theme-quartz${theme.palette.mode === 'dark' ? '-dark' : ''} w-full h-full relative`}
            style={{
              // Base colors
              '--ag-foreground-color': theme.palette.text.primary,
              '--ag-background-color':
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[900]
                  : theme.palette.background.paper,
              '--ag-header-background-color':
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[800]
                  : theme.palette.background.paper,
              '--ag-odd-row-background-color': 'transparent',
              '--ag-even-row-background-color': 'transparent',
              '--ag-row-hover-color': theme.palette.action.hover,
              '--ag-selected-row-background-color': theme.palette.action.selected,

              // Borders
              '--ag-border-color': theme.palette.divider,
              '--ag-row-border-color':
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : theme.palette.divider,

              // Text colors
              '--ag-header-foreground-color': theme.palette.text.primary,
              '--ag-secondary-foreground-color': theme.palette.text.secondary,
              '--ag-disabled-foreground-color': theme.palette.text.disabled,

              // Typography
              '--ag-font-family': theme.typography.fontFamily,
              '--ag-font-size': theme.typography.body2.fontSize,

              // Layout
              '--ag-border-radius': `${theme.shape.borderRadius}px`,
              '--ag-grid-size': '4px',
              '--ag-list-item-height': '32px',
              '--ag-row-height': '56px',
              '--ag-header-height': '56px',

              // Custom dark mode enhancements
              '--ag-control-panel-background-color':
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[800]
                  : theme.palette.background.paper,
              '--ag-side-button-selected-background-color':
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={localRowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              getRowId={(params) => params.data.id}
              onGridReady={onGridReady}
              onCellKeyPress={onCellKeyPress}
              getRowHeight={() => 48}
              headerHeight={headerHeight}
              onCellValueChanged={onCellValueChanged}
              components={components}
              enableCharts={true}
              quickFilterText={quickFilterText}
              cacheQuickFilter={true}
              rowDragManaged={false}
              animateRows={false}
              suppressRowHoverAnimation={true}
              suppressColumnMoveAnimation={true}
              suppressColumnResizeAnimation={true}
              // Async transaction settings for high-frequency updates
              asyncTransactionWaitMillis={50}
              onAsyncTransactionsApplied={onAsyncTransactionsApplied}
              suppressCellFocus={false}
              suppressMovableColumns={false}
              suppressDragLeaveHidesColumns={true}
              enableCellTextSelection={true}
              ensureDomOrder={true}
              domLayout="normal"
              suppressColumnVirtualisation={true}
              suppressRowVirtualisation={false}
              rowBuffer={250}
              blockLoadDebounceMillis={250}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              rowMultiSelectWithClick={true}
              suppressRowDeselection={false}
              isRowSelectable={(params) => params.data && params.data.id !== '+'}
              getContextMenuItems={getContextMenuItems}
              suppressPropertyNamesCheck={true}
              suppressAnimationFrame={true}
              suppressColumnStateEvents={true}
              suppressModelUpdateAnimations={true}
              suppressAggFuncInHeader={true}
              // Direct clipboard configuration
              enableRangeSelection={true}
              enableRangeHandle={true}
              enableFillHandle={false}
              suppressCopySingleCellRanges={false}
              suppressClipboardPaste={false}
              includeHiddenColumnsInQuickFilter={true}
              suppressNoRowsOverlay={true}
              pagination={false}
              initialState={{
                sort: {
                  sortModel: [
                    {
                      colId: 'created_at',
                      sort: 'asc',
                      nullsLast: true,
                    },
                  ],
                },
              }}
              sortingOrder={['asc', 'desc', null]}
              sideBar={{
                toolPanels: [
                  {
                    id: 'columns',
                    labelDefault: 'Columns',
                    labelKey: 'columns',
                    iconKey: 'columns',
                    toolPanel: 'agColumnsToolPanel',
                    toolPanelParams: {
                      suppressRowGroups: true,
                      suppressValues: true,
                      suppressPivots: true,
                      suppressPivotMode: true,
                      suppressColumnFilter: false,
                      suppressColumnSelectAll: false,
                    },
                  },
                  {
                    id: 'filters',
                    labelDefault: 'Filters',
                    labelKey: 'filters',
                    iconKey: 'filter',
                    toolPanel: 'agFiltersToolPanel',
                    toolPanelParams: {
                      suppressExpandAll: false,
                      suppressFilterSearch: false,
                      suppressSyncLayoutWithGrid: false,
                    },
                  },
                ],
                defaultToolPanel: undefined,
                position: 'right',
                hiddenByDefault: false,
                defaultToolPanelWidth: 0,
              }}
            />
            {!hasRealRecords && isReady && !isSearching && (
              <div
                style={{
                  position: 'absolute',
                  top: '100px', // A bit below the header
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  pointerEvents: 'none', // Allow clicks through to the grid
                }}
              >
                <div style={{ pointerEvents: 'auto' }}>
                  <EmptyTableState
                    onImportCSV={handleImportCSV}
                    tableName={table?.name || 'table'}
                  />
                </div>
              </div>
            )}
            {isSearching && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[4],
                }}
              >
                <Iconify
                  icon="svg-spinners:blocks-shuffle-3"
                  sx={{ width: 20, height: 20, color: theme.palette.primary.main }}
                />
                <span style={{ color: theme.palette.text.primary, fontSize: '0.875rem' }}>
                  Searching...
                </span>
              </div>
            )}
          </div>
        </div>
        <CreateFieldDialog
          open={showFieldDialog}
          onClose={() => setShowFieldDialog(false)}
          table={table}
        />
        <CreateRecordDialog
          baseId={table.base_id}
          tableId={table.id}
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />
        {editRecordId && table?.base_id && table?.id && (
          <EditRecordDialog
            baseId={table.base_id}
            tableId={table.id}
            recordId={editRecordId}
            open={true}
            onClose={() => {
              setEditRecordId(null);
              history.push(location.pathname.split('/records/')[0]);
            }}
          />
        )}
        <EditFieldDrawer
          field={editField}
          baseId={table.base_id}
          tableId={table.id}
          open={!!editField}
          onClose={() => setEditField(null)}
        />
        <ImportCSVDrawer
          open={showImportDrawer}
          onClose={() => setShowImportDrawer(false)}
          onImport={handleCSVImport}
          tableName={table?.name || 'table'}
        />
      </div>
    );
  },
);
