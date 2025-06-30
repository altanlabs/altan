import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { GridChartsModule } from '@ag-grid-enterprise/charts';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { LicenseManager } from '@ag-grid-enterprise/core';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';

// AG Grid imports

// AG Grid Modules

// Import AG Grid styles
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { useSelector } from '../../../redux/store';

LicenseManager.setLicenseKey(
  'Altan_Products[v3][][0102]_MjA4MjY3MjAwMDAwMA==b79026526b81b3a5d7175371f58a75bd',
);

// Register the modules with the Grid
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  RowGroupingModule,
  MenuModule,
  ClipboardModule,
  GridChartsModule,
]);

/**
 * AgGridWrapper Component
 *
 * A powerful and flexible wrapper around the AG Grid React component.
 * It handles module imports, loading states, data selection, schema-based
 * column definitions, custom cell renderers, and passes through all AG Grid props.
 *
 * @param {Object} props - The props for the component.
 */
function AgGridWrapper(props) {
  const {
    loadingSelector,
    initializedSelector,
    dataSelector,
    dataFilter,
    schema,
    defaultColDef,
    gridOptions,
    rowHeight,
    getRowHeight,
    onRowDoubleClicked,
    style,
    initialSelectionCondition,
    onSelect,
    ...agGridProps
  } = props;
  const theme = useTheme();
  // Grid reference for API access if needed
  const gridRef = useRef(null);

  // Retrieve data using the provided selector function
  const loading = useSelector(loadingSelector);
  const initialized = useSelector(initializedSelector);

  // Retrieve data using the provided selector function
  const rawData = useSelector(dataSelector);

  // Apply data filtering if dataFilter prop is provided
  const rowData = useMemo(() => {
    return dataFilter ? dataFilter(rawData) : rawData;
  }, [rawData, dataFilter]);

  // Generate column definitions from the schema
  const columnDefs = useMemo(() => generateColumnDefsFromSchema(schema), [schema]);

  // Combine default grid options with provided options
  const combinedGridOptions = useMemo(
    () => ({
      defaultColDef,
      rowHeight,
      getRowHeight,
      onRowDoubleClicked,
      ...gridOptions,
    }),
    [defaultColDef, rowHeight, getRowHeight, onRowDoubleClicked, gridOptions],
  );

  const isFirstRender = useRef(true);

  // Handle initial selection
  useEffect(() => {
    if (isFirstRender.current) {
      if (initialSelectionCondition && rowData && rowData.length > 0) {
        if (initialSelectionCondition(rowData)) {
          const firstItem = rowData[0];
          if (onSelect) {
            onSelect(firstItem);
          }
        }
      }
      isFirstRender.current = false;
    }
  }, [initialSelectionCondition, rowData, onSelect]);

  // Handle selection changes in the grid
  const handleSelectionChanged = useCallback(
    (event) => {
      if (onSelect) {
        const selectedNodes = event.api.getSelectedNodes();
        if (selectedNodes.length > 0) {
          const selectedData = selectedNodes[0].data;
          onSelect(selectedData);
        } else {
          onSelect(null);
        }
      }
    },
    [onSelect],
  );

  // Handle loading state
  if (loading || !initialized) {
    return <div>Loading...</div>;
  }

  // Render the AG Grid component with all provided and additional props
  return (
    <div
      className={`ag-theme-quartz${theme.palette.mode === 'dark' ? '-dark' : ''} swiper-no-swiping`}
      style={{ height: '100%', width: '100%', ...style }}
    >
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        gridOptions={combinedGridOptions}
        onSelectionChanged={handleSelectionChanged} // Pass the handler directly as a prop
        {...agGridProps}
      />
    </div>
  );
}

/**
 * Generates AG Grid column definitions from the provided schema.
 *
 * @param {Array} schema - The schema defining the grid's columns.
 * @returns {Array} The column definitions for AG Grid.
 */
function generateColumnDefsFromSchema(schema) {
  return schema.map((col) => {
    const { field, headerName, cellRenderer, cellRendererParams, ...rest } = col;

    return {
      field,
      headerName,
      cellRendererFramework: cellRenderer,
      cellRendererParams,
      ...rest,
    };
  });
}

// Define prop types for type checking and documentation
AgGridWrapper.propTypes = {
  loadingSelector: PropTypes.func.isRequired,
  initializedSelector: PropTypes.func.isRequired,
  dataSelector: PropTypes.func.isRequired,
  schema: PropTypes.arrayOf(PropTypes.object).isRequired,
  defaultColDef: PropTypes.object,
  gridOptions: PropTypes.object,
  rowHeight: PropTypes.number,
  getRowHeight: PropTypes.func,
  onRowDoubleClicked: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string,
  theme: PropTypes.string,
};

AgGridWrapper.defaultProps = {
  defaultColDef: {
    resizable: true,
    sortable: true,
    filter: true,
  },
  gridOptions: {},
  rowHeight: 50,
};

export default memo(AgGridWrapper);
