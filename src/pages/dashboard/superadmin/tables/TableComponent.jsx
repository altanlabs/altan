import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { GridChartsModule } from '@ag-grid-enterprise/charts';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { LicenseManager } from '@ag-grid-enterprise/core';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { Button, useTheme } from '@mui/material';
import React, { memo, useCallback, useMemo, useState } from 'react';

import DeleteDialog from './DeleteDialog.jsx';
import { DynamicIsland } from '../../../../components/dynamic-island/DynamicIsland.jsx';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import JsonCellRenderer from '../../../../components/JsonCellRenderer.jsx';
import ObjectMenu from '../../../../components/ObjectMenu.jsx';
import ActionsRenderer from '../../../../components/tables/renderers/ActionsRenderer.jsx';
import useFeedbackDispatch from '../../../../hooks/useFeedbackDispatch';
import { deleteEntity, getEntity } from '../../../../redux/slices/superadmin';
import { getAllKeys } from '../helpers/utils';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowGroupingModule,
  GridChartsModule,
  MenuModule,
  ClipboardModule,
]);

LicenseManager.setLicenseKey(
  'Altan_Products[v3][][0102]_MjA4MjY3MjAwMDAwMA==b79026526b81b3a5d7175371f58a75bd',
);

const style = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
};

const objectInViewInit = {
  name: null,
  value: null,
  error: null,
  isLoading: false,
};

const TableComponent = ({ data, table, handleFetchData, editingRow, onEdit }) => {
  const theme = useTheme();
  // const [, setGridApi] = useState(null);
  // const [, setColumnApi] = useState(null);
  const [objectInView, setObjectInView] = useState(objectInViewInit);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const [selectedRows, setSelectedRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [openObjectViewer, setOpenObjectViewer] = useState(false);

  // const handleGridReady = params => {
  //   setGridApi(params.api);
  //   setColumnApi(params.columnApi);
  // };

  const onFetchRelationship = useCallback(async (columnName, entityId) => {
    setObjectInView({ ...objectInViewInit, isLoading: true });
    try {
      const entity = await getEntity(columnName, entityId);
      setObjectInView((prev) => ({ ...prev, name: columnName, value: entity }));
    } catch (error) {
      setObjectInView((prev) => ({ ...prev, error }));
      // console.log(`Error fetching relationship: ${error}`);
    } finally {
      setOpenObjectViewer(true); // Open the drawer to show fetched data
      setObjectInView((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const handleDelete = useCallback(
    (id) => {
      setDeleteItemId(id);
      setOpenDeleteDialog(true);
    },
    [setDeleteItemId, setOpenDeleteDialog],
  );

  const onSelectObject = useCallback((name, value) => {
    setObjectInView({ ...objectInViewInit, name, value });
    setOpenObjectViewer(true); // Open the drawer to show fetched data
  }, []);

  const onSelectionChanged = useCallback((event) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  }, []);

  const actionCellRenderer = useCallback(
    (params) => (
      <ActionsRenderer
        actions={[
          {
            name: 'Edit',
            action: (data) => onEdit(data),
            icon: 'basil:edit-solid',
            color: 'primary',
          },
          {
            name: 'Delete',
            action: (data) => handleDelete(data.id),
            icon: 'iconamoon:trash-fill',
            color: 'error',
          },
          // Add more actions as needed
        ]}
        params={params}
      />
    ),
    [handleDelete, onEdit],
  );

  const jsonCellRenderer = useCallback(
    (params) => (
      <JsonCellRenderer
        params={params}
        onRelationshipSelect={onFetchRelationship}
        onOpenObject={onSelectObject}
      />
    ),
    [onFetchRelationship, onSelectObject],
  );

  const columns = useMemo(() => {
    const keys = data.length ? getAllKeys(data) : [];
    return [
      ...keys.sort().map((key) => ({
        field: key,
        cellRenderer: jsonCellRenderer,
        floatingFilter: true,
        tooltipField: key,
        sortable: true,
        resizable: true,
      })),
      {
        checkboxSelection: true,
        width: '40px',
        cellStyle: style,
        pinned: 'left',
        filter: false,
        sortable: false,
        suppressHeaderMenuButton: true,
        headerCheckboxSelection: (params) => {
          const allNodes = params.api.getDisplayedRowAtIndex(0) !== null;
          return allNodes;
        },
        headerCheckboxSelectionFilteredOnly: true,
      },
      {
        headerName: 'Actions',
        cellRenderer: actionCellRenderer,
        editable: false,
        filter: false,
        sortable: false,
        width: 110,
        pinned: 'left',
        suppressHeaderMenuButton: true,
      },
    ];
  }, [actionCellRenderer, data, jsonCellRenderer]);

  // console.log('@TableComponent.objectInView', objectInView);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
    }),
    [],
  );

  const frameworkComponents = {
    actionCellRenderer,
  };

  const handleCloseDeleteDialog = useCallback(() => {
    setOpenDeleteDialog(false);
    setDeleteItemId(null);
  }, [setDeleteItemId, setOpenDeleteDialog]);

  const confirmDelete = useCallback(() => {
    dispatchWithFeedback(deleteEntity(table, deleteItemId), {
      useSnackbar: true,
      successMessage: 'Entry deleted successfully',
      errorMessage: 'There was an error deleting the entry:',
    }).then(handleFetchData);
    setOpenDeleteDialog(false);
    setDeleteItemId(null);
  }, [dispatchWithFeedback, table, deleteItemId, handleFetchData]);

  const handleDeleteMultiple = useCallback(() => {
    Promise.all(
      selectedRows.map((row) =>
        dispatchWithFeedback(deleteEntity(table, row.id), {
          useSnackbar: true,
          successMessage: `Entry with id: ${row.id} deleted successfully.`,
          errorMessage: `There was an error deleting the entry with id: ${row.id}.`,
        }),
      ),
    )
      .then(() => {
        handleFetchData();
        setSelectedRows([]);
      })
      .finally(() => {
        setOpen(false);
      });
  }, [selectedRows, dispatchWithFeedback, table, handleFetchData]);

  return (
    <>
      <div
        className={`ag-theme-quartz${theme.palette.mode === 'dark' ? '-dark' : ''} h-full w-full`}
      >
        <AgGridReact
          rowData={data}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          frameworkComponents={frameworkComponents}
          // onGridReady={handleGridReady}
          rowSelection="multiple"
          onSelectionChanged={onSelectionChanged}
          tooltipShowDelay={1000}
          enableBrowserTooltips={true}
          tooltipHideDelay={5000}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={[50, 100, 500, 1000]}
        />
      </div>
      <ObjectMenu
        open={openObjectViewer}
        onClose={() => setOpenObjectViewer(false)}
        selectedObject={objectInView}
      />
      <DeleteDialog
        openDeleteDialog={openDeleteDialog}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        confirmDelete={confirmDelete}
      />
      {selectedRows.length > 0 && !editingRow && (
        <DynamicIsland>
          <Button
            color="error"
            onClick={() => setOpen(true)}
          >
            Delete {selectedRows.length} items
          </Button>
        </DynamicIsland>
      )}
      <DeleteDialog
        openDeleteDialog={open}
        handleCloseDeleteDialog={() => setOpen(false)}
        message="Are you sure you want to delete these items? This can't be undone."
        confirmDelete={handleDeleteMultiple}
        confirmationText={`DELETE ${selectedRows.length}`}
      />
    </>
  );
};

export default memo(TableComponent);
