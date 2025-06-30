import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { GridChartsModule } from '@ag-grid-enterprise/charts';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { LicenseManager } from '@ag-grid-enterprise/core';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { useTheme, Typography, Button, TextField } from '@mui/material';
import { parseISO } from 'date-fns';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { CompactLayout } from '../../../layouts/dashboard';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { fetchFormResponses } from '../../../redux/slices/general';
import { dispatch } from '../../../redux/store';
import ActionsRenderer from '../../../components/tables/renderers/ActionsRenderer';
import { optimai } from '../../../utils/axios';
import DeleteDialog from '../../../components/dialogs/DeleteDialog';
import { DynamicIsland } from '../../../components/dynamic-island/DynamicIsland';
import JsonCellRenderer from '../../../components/JsonCellRenderer';
import ObjectMenu from '../../../components/ObjectMenu';
import { fToNow } from '../../../utils/formatTime';

const retrigger = async (data) => {
  console.log('data', data);
  try {
    await optimai.patch(`/form/${data.form_id}/response/${data.id}/completed`);
    return 'success';
  } catch (e) {
    console.error(`Error updating form response: ${e.message}`);
    throw e;
  }
};

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowGroupingModule,
  GridChartsModule,
  MenuModule,
  ClipboardModule,
  MasterDetailModule,
]);

LicenseManager.setLicenseKey(
  'Altan_Products[v3][][0102]_MjA4MjY3MjAwMDAwMA==b79026526b81b3a5d7175371f58a75bd',
);

const style = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
};

const extractFields = (formPages) => {
  if (!formPages) {
    return [];
  }
  return formPages.flatMap((page) =>
    page.elements.map((element) => ({
      name: element.name,
      title: element.title || element.name,
      type: element.type,
    })),
  );
};

const generateColumns = (fields) => {
  return fields.map((field) => ({
    headerName: field.title,
    field: field.name,
    valueGetter: ({ data }) => {
      const value = data.details[field.name];
      if (field.type === 'boolean') {
        return value ? 'Yes' : 'No';
      } else if (field.type === 'file') {
        return value ? 'File uploaded' : 'No file';
      }
      return value;
    },
    sortable: true,
    resizable: true,
    filter: true,
    flex: 1,
    cellStyle: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    floatingFilter: true,
  }));
};

function FormResponses() {
  const { formId } = useParams();
  const theme = useTheme();
  const forms = useSelector((state) => state.general.account?.forms || []);
  const currentForm = forms.find((form) => form.id === formId);
  const [initialized, setInitalized] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [objectInView, setObjectInView] = useState({
    name: null,
    value: null,
    error: null,
    isLoading: false,
  });
  const [openObjectViewer, setOpenObjectViewer] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState('single'); // 'single' or 'multiple'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    if (!!currentForm && !initialized) {
      console.log('currentForm', currentForm);
      dispatch(fetchFormResponses(formId));
      setInitalized(true);
    }
  }, [dispatch, initialized, currentForm]);

  const openDeleteDialog = useCallback((id) => {
    setSelectedResponse(id);
    setDeleteMode('single');
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedResponse(null);
    setDeleteMode('single');
  }, []);

  const handleDelete = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (deleteMode === 'single') {
        await optimai.delete(`/responses/${selectedResponse}`);
      } else {
        await Promise.all(selectedRows.map((row) => optimai.delete(`/responses/${row.id}`)));
      }
      dispatch(fetchFormResponses(formId));
      setSelectedRows([]);
      closeDeleteDialog();
      // Show success message
    } catch (e) {
      console.error(`Error deleting form response(s): ${e.message}`);
      // Show error message
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteMode, selectedResponse, selectedRows, formId, closeDeleteDialog]);

  const handleDeleteMultiple = useCallback(() => {
    setDeleteMode('multiple');
    setDeleteDialogOpen(true);
  }, []);

  const onSelectionChanged = useCallback((event) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  }, []);

  const onFetchRelationship = useCallback(async (columnName, entityId) => {
    setObjectInView({ name: null, value: null, error: null, isLoading: true });
    try {
      // Implement the logic to fetch the relationship data
      // const entity = await fetchRelationshipData(columnName, entityId);
      // setObjectInView({ name: columnName, value: entity, error: null, isLoading: false });
    } catch (error) {
      setObjectInView({ name: columnName, value: null, error, isLoading: false });
    } finally {
      setOpenObjectViewer(true);
    }
  }, []);

  const onSelectObject = useCallback((name, value) => {
    setObjectInView({ name, value, error: null, isLoading: false });
    setOpenObjectViewer(true);
  }, []);

  const onFilterTextBoxChanged = useCallback((e) => {
    setGlobalFilter(e.target.value);
  }, []);

  const columns = useMemo(() => {
    const actions = [
      {
        name: 'Delete',
        action: (data) => openDeleteDialog(data?.id),
        icon: 'iconamoon:trash-fill',
        color: 'error',
      },
      {
        name: 'Retrigger ( generate a FormResponseCompleted event ) ',
        action: (data) => retrigger(data),
        icon: 'bi:arrow-repeat',
        color: 'primary',
      },
    ];
    const actionCellRenderer = (params) => (
      <ActionsRenderer
        actions={actions}
        params={params}
      />
    );

    const dateRenderer = (params) => (
      <Typography variant="caption"> {fToNow(params.data.date_creation)}</Typography>
    );

    const jsonCellRenderer = (params) => (
      <JsonCellRenderer
        params={params}
        onRelationshipSelect={onFetchRelationship}
        onOpenObject={onSelectObject}
      />
    );

    const dynamicFields = currentForm ? extractFields(currentForm.pages) : [];
    const dynamicColumns = generateColumns(dynamicFields);

    return [
      {
        checkboxSelection: true,
        width: 40,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        pinned: 'left',
        cellStyle: style,
      },
      ...dynamicColumns.map((col) => ({
        ...col,
        cellRenderer: jsonCellRenderer,
        floatingFilter: false,
        filter: false,
      })),
      {
        headerName: 'Actions',
        cellRenderer: actionCellRenderer,
        editable: false,
        filter: false,
        sortable: false,
        width: 130,
        pinned: 'left',
        cellStyle: style,
        suppressHeaderMenuButton: true,
      },
      {
        headerName: 'Created At',
        cellRenderer: dateRenderer,
        editable: false,
        filter: true,
        sortable: true,
        cellStyle: style,
        valueGetter: ({ data }) => parseISO(data.date_creation),
      },
      {
        headerName: 'Completed',
        field: 'is_completed',
        filter: false,
        sortable: true,
        cellStyle: style,
        valueGetter: ({ data }) => (data.is_completed ? 'Yes' : 'No'),
      },
    ];
  }, [currentForm, onFetchRelationship, onSelectObject, openDeleteDialog]);

  if (!currentForm) return null;

  return (
    <CompactLayout title={`${currentForm.name} · Responses · Altan`}>
      <>
        <div style={{ padding: '10px 5px' }}>
          <TextField
            size="small"
            variant="standard"
            fullWidth
            placeholder="Search across all columns..."
            onChange={onFilterTextBoxChanged}
          />
        </div>
        <div
          className={theme.palette.mode === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}
          style={{
            width: '100%',
            height: '100%',
            paddingRight: 5,
            paddingLeft: 5,
          }}
        >
          <AgGridReact
            className=" "
            rowData={currentForm?.responses || []}
            columnDefs={columns}
            masterDetail={true}
            detailRowAutoHeight={true}
            enableBrowserTooltips={true}
            tooltipShowDelay={1000}
            tooltipHideDelay={5000}
            rowHeight={50}
            rowSelection="multiple"
            onSelectionChanged={onSelectionChanged}
            quickFilterText={globalFilter}
            suppressFloatingFilter={true}
            pagination={true}
            domLayout="autoHeight"
            suppressHorizontalScroll={false}
          />
        </div>
        {selectedRows.length > 0 && (
          <DynamicIsland>
            <Button
              color="error"
              onClick={handleDeleteMultiple}
            >
              Delete {selectedRows.length} responses
            </Button>
          </DynamicIsland>
        )}
      </>
      <DeleteDialog
        openDeleteDialog={deleteDialogOpen}
        handleCloseDeleteDialog={closeDeleteDialog}
        confirmDelete={handleDelete}
        isSubmitting={isSubmitting}
        message={
          deleteMode === 'single'
            ? "Are you sure you want to delete this response? This action can't be undone."
            : `Are you sure you want to delete ${selectedRows.length} responses? This action can't be undone.`
        }
        confirmationText={deleteMode === 'multiple' ? `DELETE ${selectedRows.length}` : undefined}
      />
      <ObjectMenu
        open={openObjectViewer}
        onClose={() => setOpenObjectViewer(false)}
        selectedObject={objectInView}
      />
    </CompactLayout>
  );
}

export default FormResponses;
