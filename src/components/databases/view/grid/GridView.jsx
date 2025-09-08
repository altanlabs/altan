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
import { debounce, maxBy } from 'lodash';
import { memo, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { createColumnDefs } from './columns/index.js';
import AttachmentEditor from './editors/AttachmentEditor';
import JsonEditor from './editors/JsonEditor';
import ReferenceField from './editors/ReferenceField';
import EmptyTableState from './EmptyTableState';
import useOptimizedRowData from './helpers/useOptimizedRowData.jsx';
import createFieldContextMenuItems from './menu/fieldContextMenu';
import createRecordContextMenuItems from './menu/recordContextMenu';
import { rowHeight, headerHeight, defaultColDef } from './utils/settings.js';
import {
  queryTableRecords,
  selectDatabaseQuickFilter,
  setDatabaseRecordCount,
  loadAllTableRecords,
  importCSVToTable,
} from '../../../../redux/slices/bases';
import { selectAccount } from '../../../../redux/slices/general';
import { createMedia } from '../../../../redux/slices/media';
import { dispatch, useSelector } from '../../../../redux/store';
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
    // Pagination props to pass up to parent
    onPaginationChange,
    triggerImport,
  }) => {
    const theme = useTheme();
    const gridRef = useRef();
    const history = useHistory();
    const location = useLocation();
    const members = useSelector((state) => selectAccount(state)?.members || []);
    const quickFilterText = useSelector(selectDatabaseQuickFilter);
    const [showFieldDialog, setShowFieldDialog] = useState(false);
    const [localRowData, setLocalRowData] = useState([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showImportDrawer, setShowImportDrawer] = useState(false);
    const [editRecordId, setEditRecordId] = useState(null);
    const [editField, setEditField] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [paginationInfo, setPaginationInfo] = useState({
      currentPage: 0,
      totalPages: 0,
      pageSize: 50,
      isLastPageFound: false,
    });

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

    // Add a batch update manager
    const batchUpdateRef = useRef({
      updates: new Map(),
      timeoutId: null,
    });

    // Batch process grid updates with optimized transaction
    const processBatchUpdates = useCallback(() => {
      if (!gridRef.current?.api || batchUpdateRef.current.updates.size === 0) return;

      const updates = Array.from(batchUpdateRef.current.updates.values());

      // Apply updates in a single transaction with optimized settings
      gridRef.current.api.applyTransaction({
        update: updates,
        suppressFlash: true,
        suppressVerticalScroll: true,
        suppressColumnVirtualisation: true,
      });

      batchUpdateRef.current.updates.clear();
    }, []);

    // Handle record updates in batches
    const handleRecordUpdate = useCallback(
      (recordId, changes) => {
        if (!isMounted.current) return;

        // Add update to batch
        batchUpdateRef.current.updates.set(recordId, changes);

        // Clear existing timeout
        if (batchUpdateRef.current.timeoutId) {
          clearTimeout(batchUpdateRef.current.timeoutId);
        }

        // Schedule batch update
        batchUpdateRef.current.timeoutId = setTimeout(() => {
          processBatchUpdates();
        }, 50); // 50ms batch window
      },
      [processBatchUpdates],
    );

    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);

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
      [history.push, location.pathname],
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
      return createFieldContextMenuItems(field, params, setEditField, table.id);
    }, []);

    const onGridReady = useCallback((params) => {
      gridRef.current = params;
      initialGridSetupComplete.current = true;
      const api = params.api;
      if (!api) return;

      // Add direct keyboard shortcut handler for copy
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
          const selectedCells = api.getCellRanges();
          const focusedCell = api.getFocusedCell();

          if (selectedCells?.length > 0 || focusedCell) {
            setTimeout(() => {
              api.copySelectedRangeToClipboard(false);
            }, 0);
          }
        }
      });

      // Initial focus setup
      // In newer AG-Grid, columnApi is available directly from api
      // Set initial column sizes once
      api.sizeColumnsToFit();

      api.addEventListener('firstDataRendered', () => {
        const displayedColumns = api.getAllDisplayedColumns();
        if (displayedColumns?.length) {
          api.setFocusedCell(0, displayedColumns[0]);
        }
        // Lock column sizes after initial render
        displayedColumns.forEach((col) => {
          const width = col.getActualWidth();
          api.setColumnWidth(col, width, true);
        });
      });
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
                handleRecordUpdate(result.records[0].id, result.records[0]);
              }
            }
          } else {
            const changes = { [params.column.colId]: params.newValue };
            try {
              const updatedRecord = await onUpdateRecord(params.data.id, changes);
              if (updatedRecord && gridRef.current?.api) {
                handleRecordUpdate(params.data.id, { ...params.data, ...changes });
              }
            } catch (error) {
              // console.error('Error updating record:', error);
              if (gridRef.current?.api) {
                handleRecordUpdate(params.data.id, {
                  ...params.data,
                  [params.column.colId]: params.oldValue,
                });
              }
            }
          }
        } catch (error) {
          // console.error('Error in cell value change handler:', error);
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

    // Pagination functions
    const onPaginationChanged = useCallback(() => {
      if (!gridRef.current?.api) return;

      const api = gridRef.current.api;
      setPaginationInfo({
        currentPage: api.paginationGetCurrentPage(),
        totalPages: api.paginationGetTotalPages(),
        pageSize: api.paginationGetPageSize(),
        isLastPageFound: api.paginationIsLastPageFound(),
      });
    }, []);

    const paginationGoToFirstPage = useCallback(() => {
      if (!gridRef.current?.api) return;
      gridRef.current.api.paginationGoToFirstPage();
    }, []);

    const paginationGoToLastPage = useCallback(() => {
      if (!gridRef.current?.api) return;
      gridRef.current.api.paginationGoToLastPage();
    }, []);

    const paginationGoToNextPage = useCallback(() => {
      if (!gridRef.current?.api) return;
      gridRef.current.api.paginationGoToNextPage();
    }, []);

    const paginationGoToPreviousPage = useCallback(() => {
      if (!gridRef.current?.api) return;
      gridRef.current.api.paginationGoToPreviousPage();
    }, []);

    const columnDefs = useMemo(() => {
      const defs = createColumnDefs({
        fields,
        table,
        members,
        handleExpandRecord,
        setShowFieldDialog: () => setShowFieldDialog(true),
        getCommonFieldMenuItems,
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
      emailColumnWidths,
    ]);

    // Keep track of which record-IDs we’ve already fetched
    const fetchedRef = useRef(new Map());

    // Extract reference fields when the table schema changes
    const referenceFields = useMemo(() => {
      if (!table || !table.fields || !table.fields.items) return [];
      return table.fields.items.filter((field) => {
        return (
          field.type === 'reference' &&
          field.options &&
          field.options.reference_options &&
          field.options.reference_options.foreign_table
        );
      });
    }, [table && table.fields && table.fields.items]);

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
      [dispatch, referenceFields],
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

    useEffect(() => {
      return () => {
        if (batchUpdateRef.current.timeoutId) {
          clearTimeout(batchUpdateRef.current.timeoutId);
        }
      };
    }, []);

    // Add data loading states to show in the UI
    // const isDataLoading = !isReady || !initialGridSetupComplete.current;

    // Pass pagination info up to parent components
    useEffect(() => {
      if (onPaginationChange) {
        onPaginationChange({
          paginationInfo,
          handlers: {
            onGoToFirstPage: paginationGoToFirstPage,
            onGoToLastPage: paginationGoToLastPage,
            onGoToNextPage: paginationGoToNextPage,
            onGoToPreviousPage: paginationGoToPreviousPage,
          },
        });
      }
    }, [
      paginationInfo,
      onPaginationChange,
      paginationGoToFirstPage,
      paginationGoToLastPage,
      paginationGoToNextPage,
      paginationGoToPreviousPage,
    ]);

    // Update record count in Redux when data changes
    useEffect(() => {
      if (localRowData?.length !== undefined) {
        dispatch(setDatabaseRecordCount(localRowData.length));
      }
    }, [localRowData?.length]);

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
        await dispatch(loadAllTableRecords(table.id, true));

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
      <div className="h-full flex flex-col">
        <div className="flex-grow flex">
          <div
            className={`ag-theme-quartz${theme.palette.mode === 'dark' ? '-dark' : ''} flex-grow relative`}
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
              '--ag-row-height': '48px',
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
              getRowHeight={() => rowHeight}
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
              pagination={true}
              paginationPageSize={50}
              paginationPageSizeSelector={[50, 100, 500, 1000]}
              suppressPaginationPanel={true}
              onPaginationChanged={onPaginationChanged}
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
            {!hasRealRecords && isReady && (
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
