import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { GridChartsModule } from '@ag-grid-enterprise/charts';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { LicenseManager } from '@ag-grid-enterprise/core';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import {
  Stack,
  Button,
  TextField,
  Typography,
  DialogContent,
  Divider,
  useTheme,
  Card,
  CardContent,
  Box,
  IconButton,
} from '@mui/material';
import { useState, useEffect, useCallback, memo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import ConnectionTypesAutocomplete from '../../components/ConnectionTypesAutocomplete.jsx';
import { CustomAvatar } from '../../components/custom-avatar';
import CustomDialog from '../../components/dialogs/CustomDialog.jsx';
import DeleteDialog from '../../components/dialogs/DeleteDialog.jsx';
import EmptyContent from '../../components/empty-content/EmptyContent.jsx';
import Iconify from '../../components/iconify/Iconify.jsx';
import IconRenderer from '../../components/icons/IconRenderer.jsx';
import SkeletonStack from '../../components/SkeletonStack.jsx';
import ConnectionDialog from '../../components/tools/ConnectionDialog.jsx';
import CreateConnection from '../../components/tools/CreateConnection.jsx';
import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import {
  getConnections,
  selectAccountConnectionsInitialized,
  selectConnections,
  selectConnectionTypes,
} from '../../redux/slices/connections';
import { deleteAccountResource, selectAccount } from '../../redux/slices/general';
import { dispatch } from '../../redux/store';
import { fToNow } from '../../utils/formatTime.js';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import InteractiveButton from '../../components/buttons/InteractiveButton.jsx';

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
  MasterDetailModule,
]);

// ----------------------------------------------------------------------

function getUserById(account, userId) {
  if (account.owner && account.owner.id === userId) {
    return account.owner;
  }

  if (Array.isArray(account.members)) {
    for (const member of account.members) {
      if (member.user.id === userId) {
        return member.user;
      }
    }
  }

  return null;
}

// ----------------------------------------------------------------------

const style = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
};

const CONNECTIONS_STANDARD_COLUMNS = ['id', 'name'];

const TOOLS_COLS = ['id', 'name', 'action_type_id'];

const RESOURCE_COLS = ['id', 'name', 'resource_type_id'];

// ----------------------------------------------------------------------
const TOOLS_COLS_RENDER = TOOLS_COLS.map((key) => ({
  field: key,
  cellRenderer: (params) => <Typography variant="caption">{params.value}</Typography>,
  tooltipField: key,
  sortable: true,
  resizable: true,
  filter: true,
  cellStyle: style,
  floatingFilter: true,
  flex: 1,
}));

const ToolsPanel = ({ data }) => {
  const theme = useTheme();

  const rowData = data.tools.items || [];

  return (
    <div
      className={theme.palette.mode === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}
      style={{ height: '400px', width: '100%', padding: '12px' }}
    >
      <AgGridReact
        columnDefs={TOOLS_COLS_RENDER}
        rowData={rowData}
        rowHeight={50}
      />
    </div>
  );
};

const RESOURCE_COLS_RENDER = RESOURCE_COLS.map((key) => ({
  field: key,
  cellRenderer: (params) => <Typography variant="caption">{params.value}</Typography>,
  tooltipField: key,
  sortable: true,
  resizable: true,
  filter: true,
  cellStyle: style,
  floatingFilter: true,
  flex: 1,
}));

const ResourcePanel = ({ data }) => {
  const theme = useTheme();
  const rowData = data.resources.items || [];

  return (
    <div
      className={theme.palette.mode === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}
      style={{ height: '400px', width: '100%', padding: '12px' }}
    >
      <AgGridReact
        columnDefs={RESOURCE_COLS_RENDER}
        rowData={rowData}
        rowHeight={50}
      />
    </div>
  );
};

// ----------------------------------------------------------------------

function ConnectionsPage() {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const [selectedConnection, setSelectedConnection] = useState(null);
  const openDeleteDialog = (id) => setSelectedConnection(id);
  const closeDeleteDialog = useCallback(() => setSelectedConnection(null), []);
  const types = useSelector(selectConnectionTypes);
  const connections = useSelector(selectConnections);
  const initialized = useSelector(selectAccountConnectionsInitialized);
  const account = useSelector(selectAccount);
  const [selectedType, setSelectedType] = useState(null);
  const [open, setDialog] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);
  const [buttonText, setButtonText] = useState('Copy magic link');
  const [externalId, setExternalId] = useState('');
  const [magicLink, setMagicLink] = useState('');

  useEffect(() => {
    if (selectedType && account?.id) {
      const baseUrl = 'https://app.altan.ai/magic-link';
      const params = new URLSearchParams({
        ids: selectedType,
        aid: account.id,
        ...(externalId && { eid: externalId }),
      });
      setMagicLink(`${baseUrl}?${params.toString()}`);
    }
  }, [selectedType, account?.id, externalId]);

  const handleDelete = () => {
    dispatchWithFeedback(deleteAccountResource('connection', selectedConnection, null), {
      successMessage: 'Connection deleted successfully',
      errorMessage: 'There was an error deleting the connection',
      useSnackbar: true,
      useConsole: true,
    }).then(() => {
      closeDeleteDialog();
    });
  };

  useEffect(() => {
    const id = searchParams.get('conn');
    if (!!id) {
      setSelectedType(id);
      setDialog(true);
      setIsTemplate(true);
    }
  }, [searchParams]);

  useEffect(() => {
    dispatch(getConnections(account?.id));
  }, [account?.id]);

  const handleTypeChange = (event, newValue) => {
    setSelectedType(newValue ? newValue.id : null);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(magicLink).then(() => {
      setButtonText('Copied');
      setTimeout(() => setButtonText('Copy Magic Link'), 2000);
    });
  };

  const safeConnections = Array.isArray(connections[account?.id]) ? connections[account?.id] : [];

  // eslint-disable-next-line react/display-name
  const ConnectionCard = memo(({ connection }) => {
    const user = getUserById(account, connection.user_id);
    const [openDialog, setOpenDialog] = useState(false);

    return (
      <Card
        sx={{
          mb: 2,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            {/* Connection Type Icon */}
            <IconRenderer
              icon={connection.connection_type.icon}
              size={32}
            />

            {/* Main Content */}
            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
              >
                <Typography variant="subtitle1">{connection.name}</Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {fToNow(connection.date_creation)}
                </Typography>
              </Stack>

              {connection.meta_data?.external_id && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  ID: {connection.meta_data.external_id}
                </Typography>
              )}

              {/* User Info */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 1 }}
              >
                <CustomAvatar
                  name={user?.person?.first_name}
                  src={user?.person?.avatar_url}
                  sx={{ width: 24, height: 24 }}
                />
                <Typography variant="caption">
                  {user?.person?.first_name} {user?.person?.last_name}
                </Typography>
              </Stack>
            </Box>

            {/* Actions */}
            <Stack
              direction="row"
              spacing={1}
            >
              <ConnectionDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                connection={connection}
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => openDeleteDialog(connection.id)}
              >
                <Iconify icon="iconamoon:trash-fill" />
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  });

  const openDialog = useCallback(() => setDialog(true), []);
  const onClose = useCallback(() => setDialog(false), []);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Fixed Header */}
      <Box sx={{ px: 2, pt: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <Typography variant="h5">Connections</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Manage your third-party connections
            </Typography>
          </Stack>
          <InteractiveButton
            id="create-custom-app-button"
            icon="mdi:plug"
            title="Create Connection"
            onClick={openDialog}
            // duration={8000}
            containerClassName="h-[40] border-transparent"
            borderClassName="h-[80px] w-[250px]"
            // enableBorder={true}
            className="py-1 px-2"
          />
        </Stack>
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 2,
          pb: 2,
        }}
      >
        {initialized ? (
          safeConnections.length > 0 ? (
            <Stack spacing={2}>
              {safeConnections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                />
              ))}
            </Stack>
          ) : (
            <EmptyContent
              title="No connections yet :("
              description="Why not create one?"
            />
          )
        ) : (
          <SkeletonStack
            count={5}
            height="90px"
          />
        )}
      </Box>

      {/* Dialogs */}
      <DeleteDialog
        openDeleteDialog={!!selectedConnection}
        handleCloseDeleteDialog={closeDeleteDialog}
        confirmDelete={handleDelete}
        isSubmitting={isSubmitting}
        message="Deleting this connection will delete all tools and resources associated with it, are you sure you want to continue?"
      />

      <CustomDialog
        dialogOpen={open}
        onClose={onClose}
      >
        {types.length === 0 ? (
          <DialogContent className="h-full w-full flex flex-row items-center justify-center">
            <Iconify icon="svg-spinners:gooey-balls-2" />
          </DialogContent>
        ) : (
          <Stack
            padding={2}
            spacing={2}
          >
            <Typography>New connection</Typography>
            <ConnectionTypesAutocomplete
              value={selectedType}
              onChange={handleTypeChange}
            />
            {selectedType && (
              <>
                <CreateConnection
                  id={selectedType}
                  setIsCreatingNewConnection={() => setSelectedType(null)}
                />
                {!isTemplate && (
                  <>
                    <Divider>OR</Divider>

                    <Typography
                      variant="subtitle2"
                      color="primary"
                    >
                      Share Connection Setup
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Generate a magic link to let another user set up this connection. They will be
                      able to securely connect their account without needing access to your
                      dashboard.
                    </Typography>

                    <TextField
                      label="External ID (Optional)"
                      value={externalId}
                      onChange={(e) => setExternalId(e.target.value)}
                      size="small"
                      helperText="Add an identifier to track this specific connection"
                    />

                    <Button
                      onClick={handleCopyLink}
                      startIcon={<Iconify icon="solar:copy-bold" />}
                      variant="soft"
                      fullWidth
                    >
                      {buttonText}
                    </Button>
                  </>
                )}
              </>
            )}
          </Stack>
        )}
      </CustomDialog>
    </Box>
  );
}

export default memo(ConnectionsPage);
