// React and Core
import {
  Typography,
  Button,
  Drawer,
  Stack,
  Card,
  CardContent,
  CardActions,
  Grid,
  Box,
} from '@mui/material';
import React, { useCallback, useState, memo } from 'react';

// MUI Components

// Components
import CreateDevApp from '../../components/CreateDevApp';
import DeleteDialog from '../../components/dialogs/DeleteDialog';
import Iconify from '../../components/iconify/Iconify';
import AceWrapper from '../../components/json/AceWrapper';
import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import { selectAccount, deleteAccountResource } from '../../redux/slices/general';
import { useSelector } from '../../redux/store';
import { fToNow } from '../../utils/formatTime';

const DevAppCard = ({ data, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
        >
          {data.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          ID: {data.id}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          App ID: {data.app_id}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Created {fToNow(data.date_creation)}
        </Typography>
      </CardContent>
      <CardActions sx={{ mt: 'auto' }}>
        <Button
          variant="soft"
          color="secondary"
          size="small"
          onClick={() => setOpen(true)}
          startIcon={<Iconify icon="mdi:show" />}
        >
          Show Details
        </Button>
        <Button
          variant="soft"
          color="error"
          size="small"
          onClick={() => onDelete(data.id)}
          startIcon={<Iconify icon="iconamoon:trash-fill" />}
        >
          Delete
        </Button>
      </CardActions>

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
      >
        <Stack
          height="100%"
          width="100%"
          sx={{ position: 'relative' }}
        >
          <AceWrapper
            themeMode="dark"
            value={data.details}
            fullHeight
            readOnly={true}
          />
        </Stack>
      </Drawer>
    </Card>
  );
};

const selectDevApps = (state) => selectAccount(state)?.developer_apps;

function DevApps() {
  const dev_apps = useSelector(selectDevApps);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const [selectedFlowToDelete, setSelectedFlowToDelete] = useState(null);
  const openDeleteDialog = (hookId) => setSelectedFlowToDelete(hookId);
  const closeDeleteDialog = useCallback(() => setSelectedFlowToDelete(null), []);

  const handleDelete = useCallback(() => {
    if (!selectedFlowToDelete) {
      return;
    }
    dispatchWithFeedback(deleteAccountResource('ExternalDevApp', selectedFlowToDelete), {
      successMessage: 'ExternalDevApp deleted successfuly',
      errorMessage: 'There was an error deleting the dev app: ',
      useSnackbar: true,
      useConsole: {
        success: false,
        error: true,
      },
    }).then(() => {
      closeDeleteDialog();
    });
  }, [closeDeleteDialog, dispatchWithFeedback, selectedFlowToDelete]);

  // const handleTestWebhook = useCallback((data) => {
  //   // openTestDialog(data);
  // }, []);

  return (
    <>
      <Box sx={{ height: '100%', width: '100%', p: 2 }}>
        <Box sx={{ px: 2, pt: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Typography variant="h5">Developer Apps</Typography>
            </Stack>
            <CreateDevApp />
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            A Developer App is a custom integration registered on a third-party service that
            provides unique OAuth credentials. By adding your own Developer App, your users will
            grant you secure access to their account and data, enabling actions and automation under
            their own credentials.
          </Typography>
        </Box>
        <Grid
          container
          spacing={3}
        >
          {dev_apps?.map((app) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={app.id}
            >
              <DevAppCard
                data={app}
                onDelete={openDeleteDialog}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      <DeleteDialog
        openDeleteDialog={!!selectedFlowToDelete}
        handleCloseDeleteDialog={closeDeleteDialog}
        confirmDelete={handleDelete}
        isSubmitting={isSubmitting}
        message="Deleting this dev apps will delete all events and triggers associated with it, are you sure you want to continue?"
      />
    </>
  );
}

export default memo(DevApps);
