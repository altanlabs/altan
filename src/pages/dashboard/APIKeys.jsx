import {
  Grid,
  Button,
  Card,
  Typography,
  Container,
  IconButton,
  Divider,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import React, { useCallback, useState, memo } from 'react';
import { useSelector } from 'react-redux';

import Iconify from '../../components/iconify/Iconify';
import LoadingScreen from '../../components/loading-screen/LoadingScreen';
import { useSnackbar } from '../../components/snackbar';
import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import {
  createAPIToken,
  fetchAPIToken,
  deleteAPIToken,
  selectAccount,
} from '../../redux/slices/general/index.ts';

const ApiTokenDialogs = ({
  createDialogOpen,
  setCreateDialogOpen,
  deleteDialogOpen,
  setDeleteDialogOpen,
  onApiTokenDelete,
}) => {
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [token, setToken] = useState({
    name: '',
    key: null,
    description: '',
  });

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleCreateApiKey = useCallback(() => {
    dispatchWithFeedback(createAPIToken({ name: token.name, description: token.description }), {
      successMessage: `API Key (${token.name}) created successfully!`,
      errorMessage: 'Error creating API Key: ',
      useSnackbar: true,
    }).then((t) => setToken({ token: t, name: '', description: '' }));
  }, [token.name, setToken]);

  const handleDeleteApiKey = () => {
    onApiTokenDelete();
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token.token);
    enqueueSnackbar('API Token copied to clipboard', { variant: 'success' });
  };

  return (
    <>
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        fullWidth
      >
        {!token.token ? (
          <>
            <DialogTitle>Create new API key</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Name"
                type="text"
                fullWidth
                variant="standard"
                value={token.name}
                onChange={(e) => setToken((prev) => ({ ...prev, name: e.target.value }))}
              />
              <TextField
                margin="dense"
                label="Description"
                type="text"
                fullWidth
                variant="standard"
                value={token.description}
                onChange={(e) => setToken((prev) => ({ ...prev, description: e.target.value }))}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCreateDialog}>Cancel</Button>
              <Button
                variant="soft"
                onClick={handleCreateApiKey}
              >
                Create API key
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>Your API Token</DialogTitle>
            <DialogContent>
              <DialogContentText>{token.token}</DialogContentText>
              <DialogActions>
                <Button onClick={handleCloseCreateDialog}>Close</Button>
                <Button
                  variant="soft"
                  color="info"
                  onClick={handleCopyToken}
                  startIcon={<Iconify icon="solar:copy-bold-duotone" />}
                >
                  Copy
                </Button>
              </DialogActions>
            </DialogContent>
          </>
        )}
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this API key?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            variant="soft"
            color="error"
            onClick={handleDeleteApiKey}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ----------------------------------------------------------------------

const APIKeys = () => {
  const account = useSelector(selectAccount);
  const [visibleKey, setVisibleKey] = useState('');
  const [dispatchWithFeedback] = useFeedbackDispatch();

  const handleCopyClick = useCallback((key) => {
    dispatchWithFeedback(fetchAPIToken(key), {
      successMessage: 'API Key copied to clipboard',
      errorMessage: 'Error copying API Key: ',
      useSnackbar: true,
    }).then((t) => navigator.clipboard.writeText(t));
  }, []);

  const handleViewClick = (key) => {
    setVisibleKey(visibleKey === key ? '' : key);
  };

  // States for managing dialog visibility
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);

  // Open and close handlers for create dialog
  const handleOpenCreateDialog = () => setCreateDialogOpen(true);

  // Open and close handlers for delete dialog
  const handleOpenDeleteDialog = (token) => {
    setSelectedToken(token);
    setDeleteDialogOpen(true);
  };

  const handleApiTokenDelete = useCallback(() => {
    if (selectedToken) {
      dispatchWithFeedback(deleteAPIToken(selectedToken), {
        successMessage: 'API Key deleted successfully!',
        errorMessage: 'Error deleting API Key: ',
        useSnackbar: true,
      });
    }
    setDeleteDialogOpen(false);
  }, [selectedToken, setDeleteDialogOpen]);

  if (!account) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container>
        <Card sx={{ p: 4 }}>
          <Typography variant="body">
            Your secret API keys are listed below. Do not share your API key with others, or expose
            it in the browser or other client-side code. In order to protect the security of your
            account, Altan may also automatically disable any API key that we've found has leaked
            publicly.
          </Typography>
          <Grid
            container
            alignItems="center"
            sx={{ mt: 2 }}
          >
            <Grid
              item
              xs={6}
              sm={4}
            >
              <Typography variant="h6">Name</Typography>
            </Grid>
            <Grid
              item
              xs={6}
              sm={4}
            >
              <Typography variant="h6">API Key</Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={4}
              sx={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <Typography variant="h6">Actions</Typography>
            </Grid>
          </Grid>
          <Divider
            sx={{ mt: 1, border: 'none', borderTop: '1px dotted', color: 'text.secondary' }}
          />
          {account.apikeys?.map((key, index) => (
            <Grid
              container
              alignItems="center"
              key={index}
              sx={{ mt: 1 }}
            >
              <Grid
                item
                xs={6}
                sm={4}
              >
                <Typography variant="body">{key.name}</Typography>
              </Grid>
              <Grid
                item
                xs={6}
                sm={4}
              >
                <Typography variant="body">{'*'.repeat(32)}</Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
                sx={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                {/* <IconButton onClick={() => handleViewClick(key.key)}>
                <Iconify icon="carbon:view-filled" />
              </IconButton> */}
                <IconButton onClick={() => handleCopyClick(key.id)}>
                  <Iconify icon="solar:copy-bold-duotone" />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleOpenDeleteDialog(key.id)}
                >
                  <Iconify icon="ic:twotone-delete" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button
            onClick={handleOpenCreateDialog}
            fullWidth
            sx={{ mt: 2 }}
            variant="soft"
          >
            Create new API key
          </Button>
        </Card>
      </Container>

      <ApiTokenDialogs
        createDialogOpen={createDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        onApiTokenDelete={handleApiTokenDelete}
      />
    </>
  );
};

export default memo(APIKeys);
