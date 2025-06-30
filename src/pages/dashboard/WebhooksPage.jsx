import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { GridChartsModule } from '@ag-grid-enterprise/charts';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { LicenseManager } from '@ag-grid-enterprise/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { Typography, useTheme, Button, Drawer, Stack } from '@mui/material';
import { parseISO } from 'date-fns';
import React, { useCallback, useState, useMemo, memo } from 'react';

import DeleteDialog from '@components/dialogs/DeleteDialog';
import Iconify from '@components/iconify/Iconify';
import AceWrapper from '@components/json/AceWrapper.jsx';
import ActionsRenderer from '@components/tables/renderers/ActionsRenderer';
import CreateWebhook from '@components/webhook/CreateWebhook';
import TestWebhook from '@components/webhook/TestWebhook';
import useFeedbackDispatch from '@hooks/useFeedbackDispatch';
import useResponsive from '@hooks/useResponsive';

import { CompactLayout } from '../../layouts/dashboard';
import { deleteAccountResource } from '../../redux/slices/general';
import { useSelector } from '../../redux/store';
import { fToNow } from '../../utils/formatTime';

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

const dateRenderer = (params) => (
  <Typography variant="caption"> {fToNow(params.data.date_creation)}</Typography>
);

const style = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
};

const EVENT_COLS = ['id', 'payload_size'];

// ----------------------------------------------------------------------

const EventsPanel = ({ data }) => {
  const theme = useTheme();

  const JsonCellRenderer = (json) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          variant="soft"
          color="secondary"
          size="small"
          onClick={() => setOpen(true)}
          startIcon={<Iconify icon="mdi:show" />}
        >
          Show
        </Button>
        <Drawer
          open={open}
          anchor="right"
          onClose={() => setOpen(false)}
          PaperProps={{
            style: {
              height: '100%',
              width: '50%',
              maxWidth: '90%',
            },
          }}
          height="100%"
        >
          <Stack
            height="100%"
            width="100%"
            sx={{
              position: 'relative',
            }}
          >
            <AceWrapper
              themeMode="dark"
              value={json}
              fullHeight
              readOnly={true}
            />
          </Stack>
        </Drawer>
      </>
    );
  };

  const columns = useMemo(() => {
    return [
      ...EVENT_COLS.map((key) => ({
        field: key,
        cellRenderer: (params) => <Typography variant="caption">{params.value}</Typography>,
        tooltipField: key,
        sortable: true,
        resizable: true,
        filter: true,
        cellStyle: style,
        floatingFilter: true,
        flex: 1,
      })),
      {
        headerName: 'Created At',
        cellRenderer: dateRenderer,
        valueGetter: ({ data }) => parseISO(data.date_creation),
      },
      {
        headerName: 'Payload',
        cellRenderer: (params) => <JsonCellRenderer params={params.data.payload} />,
      },
    ];
  }, []);

  const rowData = data?.events?.items || [];

  return (
    <div
      className={theme.palette.mode === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}
      style={{ height: '500px', width: '100%', padding: '16px' }}
    >
      <AgGridReact
        columnDefs={columns}
        rowData={rowData}
        rowHeight={50}
      />
    </div>
  );
};

// ----------------------------------------------------------------------

const HOOK_STANDARD_COLUMNS = ['id', 'name', 'description'];

function WebhooksPage() {
  const theme = useTheme();
  const webhooks = useSelector((state) => state.general.account.webhooks);
  const isSmallScreen = useResponsive('down', 'md');
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const [selectedFlowToDelete, setSelectedFlowToDelete] = useState(null);
  const openDeleteDialog = (hookId) => setSelectedFlowToDelete(hookId);
  const closeDeleteDialog = useCallback(() => setSelectedFlowToDelete(null), []);
  const [selectedFlowToTest, setSelectedFlowToTest] = useState(null);
  const openTestDialog = (hook) => setSelectedFlowToTest(hook);
  const closeTestDialog = useCallback(() => setSelectedFlowToTest(null), []);
  // console.log('webhooks', webhooks);
  const handleDelete = useCallback(() => {
    if (!selectedFlowToDelete) {
      return;
    }
    dispatchWithFeedback(deleteAccountResource('Webhook', selectedFlowToDelete), {
      successMessage: 'Workflow deleted successfuly',
      errorMessage: 'There was an error deleting the workflow: ',
      useSnackbar: true,
      useConsole: {
        success: false,
        error: true,
      },
    }).then(() => {
      closeDeleteDialog();
    });
  }, [closeDeleteDialog, dispatchWithFeedback, selectedFlowToDelete]);

  const handleTestWebhook = useCallback((data) => openTestDialog(data), []);

  const columns = useMemo(() => {
    const actions = [
      {
        name: 'Test',
        action: (data) => handleTestWebhook(data),
        icon: 'mdi:test-tube',
        color: 'primary',
      },
      {
        name: 'Delete',
        action: (data) => openDeleteDialog(data?.id),
        icon: 'iconamoon:trash-fill',
        color: 'error',
      },
    ];
    const actionCellRenderer = (params) => (
      <ActionsRenderer
        actions={actions}
        params={params}
      />
    );

    const urlRenderer = (params) => {
      const baseUrl = 'https://api.altan.ai/galaxia/hook/';
      const fullUrl = `${baseUrl}${params.data.url}`;
      return <Typography variant="caption">{fullUrl}</Typography>;
    };

    return [
      ...HOOK_STANDARD_COLUMNS.map((key) => ({
        field: key,
        cellRenderer: (params) => <Typography variant="caption">{params.value}</Typography>,
        tooltipField: key,
        sortable: true,
        resizable: true,
        filter: true,
        cellStyle: style,
        floatingFilter: true,
      })),

      {
        headerName: 'Url',
        cellRenderer: urlRenderer,
        filter: true,
        sortable: true,
        width: isSmallScreen ? 60 : 130,
        cellStyle: style,
        flex: 1,
        floatingFilter: true,
      },
      {
        headerName: 'Actions',
        cellRenderer: actionCellRenderer,
        editable: false,
        filter: false,
        sortable: false,
        width: isSmallScreen ? 60 : 130,
        pinned: 'left',
        cellStyle: style,
        suppressHeaderMenuButton: true,
      },
      {
        headerName: 'Events',
        cellRenderer: 'agGroupCellRenderer',
        pinned: 'left',
        width: 100,
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
    ];
  }, [handleTestWebhook, isSmallScreen]);

  return (
    <CompactLayout
      title={'Webhooks · Altan'}
      toolbarChildren={<CreateWebhook />}
      breadcrumb={{
        title: 'Webhooks',
        links: [
          {
            name: 'Assets',
          },
          {
            name: 'Webhooks',
          },
        ],
      }}
    >
      <DeleteDialog
        openDeleteDialog={!!selectedFlowToDelete}
        handleCloseDeleteDialog={closeDeleteDialog}
        confirmDelete={handleDelete}
        isSubmitting={isSubmitting}
        confirmationText={
          !!selectedFlowToDelete
            ? `DELETE ${webhooks.find((f) => f?.id === selectedFlowToDelete)?.name}`
            : ''
        }
        message="Deleting this webhook will delete all events and triggers associated with it, are you sure you want to continue?"
      />

      <TestWebhook
        open={!!selectedFlowToTest}
        onClose={closeTestDialog}
        webhook={selectedFlowToTest}
      />

      <div
        className={theme.palette.mode === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}
        style={{
          width: '100%',
          height: '100%',
          paddingRight: 5,
          paddingLeft: 5,
          // paddingX: 5
        }}
      >
        <AgGridReact
          className=" "
          rowData={webhooks}
          columnDefs={columns}
          masterDetail={true}
          detailRowAutoHeight={true}
          enableBrowserTooltips={true}
          tooltipShowDelay={1000}
          tooltipHideDelay={5000}
          rowHeight={50}
          detailCellRenderer={EventsPanel}
          detailCellRendererParams={{
            getDetailRowData: (params) => {
              params.successCallback(params.data);
            },
          }}
        />
      </div>
    </CompactLayout>
  );
}

export default memo(WebhooksPage);
