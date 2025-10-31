import { Typography, Stack, Box } from '@mui/material';
import React, { useCallback, useState, memo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import DeleteDialog from '../../components/dialogs/DeleteDialog.jsx';
import CustomAppEditor from '../../components/integration/CustomAppEditor.jsx';
import CustomAppCard from '../../components/integrator/customapp/CustomAppCard.jsx';
import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import {
  removeApp,
  selectCustomApps,
  selectCustomConnectionTypes,
} from '../../redux/slices/general';
import { useSelector } from '../../redux/store';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function CustomApps() {
  const apps = useSelector(selectCustomApps);
  const connectionTypes = useSelector(selectCustomConnectionTypes);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const [selectedAppToDelete, setSelectedAppToDelete] = useState(null);

  const openDeleteDialog = (customApp) => setSelectedAppToDelete(customApp);
  const closeDeleteDialog = useCallback(() => setSelectedAppToDelete(null), []);

  const query = useQuery();
  const history = useHistory();;
  const connectionTypeId = query.get('connectionTypeId');

  const handleDelete = useCallback(() => {
    if (!selectedAppToDelete?.id) return;

    dispatchWithFeedback(removeApp(selectedAppToDelete.id), {
      successMessage: 'App deleted successfully',
      errorMessage: 'There was an error deleting the app: ',
      useSnackbar: true,
      useConsole: {
        success: false,
        error: true,
      },
    }).then(() => {
      closeDeleteDialog();
    });
  }, [closeDeleteDialog, dispatchWithFeedback, selectedAppToDelete?.id]);

  const handleEdit = useCallback(
    (id) => {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set('connectionTypeId', id);
      history.push(`${window.location.pathname}?${currentParams.toString()}`);
    },
    [history.push],
  );

  const handleOpenDelete = useCallback(
    (id) => {
      const app = apps.find((app) => app.connection_types.items.some((ct) => ct.id === id));
      openDeleteDialog(app);
    },
    [apps],
  );

  if (connectionTypeId) {
    return <CustomAppEditor connectionTypeId={connectionTypeId} />;
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <DeleteDialog
        openDeleteDialog={Boolean(selectedAppToDelete)}
        handleCloseDeleteDialog={closeDeleteDialog}
        confirmDelete={handleDelete}
        isSubmitting={isSubmitting}
        message={`Deleting ${selectedAppToDelete?.name || 'this App'} will delete all actions, webhooks and resources associated to it, are you sure you want to continue?`}
      />

      {/* Title and Create Button at the top */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5">Custom Apps</Typography>
        <div style={{ maxWidth: '250px' }}>
          <CreateCustomApp />
        </div>
      </Stack>

      {/* Scrollable area with smaller cards */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Stack spacing={2}>
          {connectionTypes?.map((item) => (
            <CustomAppCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export default memo(CustomApps);
