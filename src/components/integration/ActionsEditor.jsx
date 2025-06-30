import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingButton } from '@mui/lab';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Chip,
} from '@mui/material';
import React, { memo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import { createActionType, patchActionType, removeActionType } from '../../redux/slices/general';
import { isValidJSONFromSchema } from '../../utils/formatData';
import DeleteDialog from '../dialogs/DeleteDialog';
import FormParameter from '../tools/form/FormParameter';

const ACTION_SCHEMA = {
  title: 'Action',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'The name of the action.',
      'x-hide-label': true,
    },
    description: {
      type: 'string',
      description: 'The description of the action.',
      'x-hide-label': true,
    },
    url: {
      type: 'string',
      description: 'The URL of the action.',
      'x-hide-label': true,
    },
    method: {
      type: 'string',
      description: 'The HTTP method of the action.',
      'x-hide-label': true,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'DYNAMIC'],
    },
    headers: {
      type: 'object',
      description: 'The headers of the action.',
      'x-hide-label': true,
    },
    query_params: {
      type: 'object',
      description: 'The query parameters of the action.',
      'x-hide-label': true,
    },
    path_params: {
      type: 'object',
      description: 'The path parameters of the action.',
      'x-hide-label': true,
    },
    body: {
      type: 'object',
      description: 'The body of the action.',
      'x-hide-label': true,
    },
    output: {
      type: 'object',
      description: 'The output of the action.',
      'x-hide-label': true,
    },
  },
  required: ['name', 'url', 'method'],
};

// Define tab structure
const TAB_CONFIG = [
  {
    label: 'Basic Info',
    fields: ['name', 'description', 'url', 'method'],
    description: 'Action name, description, URL and HTTP method',
  },
  {
    label: 'Headers',
    fields: ['headers'],
    description: 'HTTP headers for the request',
  },
  {
    label: 'Query Params',
    fields: ['query_params'],
    description: 'URL query parameters',
  },
  {
    label: 'Path Params',
    fields: ['path_params'],
    description: 'URL path parameters (e.g., {id} in /users/{id})',
  },
  {
    label: 'Body',
    fields: ['body'],
    description: 'Request body payload',
  },
  {
    label: 'Output',
    fields: ['output'],
    description: 'Expected response structure',
  },
];

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`action-tabpanel-${index}`}
      aria-labelledby={`action-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function ActionsEditor({ connectionType }) {
  const [dispatchWithFeedback] = useFeedbackDispatch();

  const [selectedAction, setSelectedAction] = useState(null);
  const [open, setOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [actionToDelete, setActionToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { handleSubmit, reset, watch } = methods;

  if (!connectionType) {
    return <Typography variant="h6">Connection Type not found</Typography>;
  }

  const actions = connectionType.actions?.items || [];
  const filteredActions = actions.filter((action) =>
    action.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleClickOpen = (action = { name: '', description: '' }) => {
    setSelectedAction(action);
    reset(action);
    setOpen(true);
    setTabValue(0); // Reset to first tab
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAction(null);
    setTabValue(0);
  };

  const handleDelete = (actionId) => {
    setActionToDelete(actionId);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    setOpenDeleteDialog(false);
    setActionToDelete(null);
    dispatchWithFeedback(removeActionType(actionToDelete, connectionType.id), {
      useSnackbar: true,
      successMessage: 'Action deleted successfully',
      errorMessage: 'Could not delete action',
    });
  };

  const onSubmit = handleSubmit((data) => {
    const isValid = isValidJSONFromSchema(data, ACTION_SCHEMA);
    if (!isValid) return;

    const completeData = { connection_type_id: connectionType.id, ...data };

    const dispatchPromise = selectedAction.id
      ? dispatchWithFeedback(patchActionType(selectedAction.id, completeData), {
          useSnackbar: true,
          successMessage: 'Action updated successfully',
          errorMessage: 'Could not update action',
        })
      : dispatchWithFeedback(createActionType(completeData), {
          useSnackbar: true,
          successMessage: 'Action created successfully',
          errorMessage: 'Could not create action',
        });

    dispatchPromise.then(() => {
      handleClose();
    });
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Get method for display
  const watchedMethod = watch('method');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">Actions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleClickOpen()}
          sx={{ borderRadius: 2 }}
        >
          Add Action
        </Button>
      </Stack>

      <TextField
        fullWidth
        label="Search Actions"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        size="small"
        autoFocus
      />

      <Paper sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '80vh', borderRadius: 2 }}>
        <List>
          {filteredActions.map((action, index) => (
            <React.Fragment key={action.id}>
              <ListItem
                secondaryAction={
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleDelete(action.id)}
                    sx={{ '&:hover': { backgroundColor: 'error.light', color: 'white' } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                disablePadding
              >
                <ListItemButton
                  onClick={() => handleClickOpen(action)}
                  sx={{ borderRadius: 1, mx: 1 }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight="medium">
                          {action.name}
                        </Typography>
                        {action.method && (
                          <Chip
                            label={action.method}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    }
                    secondary={action.description || 'No description available'}
                  />
                </ListItemButton>
              </ListItem>
              {index < filteredActions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {filteredActions.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No actions found"
                secondary={searchTerm ? 'Try adjusting your search term' : 'Create your first action'}
                sx={{ textAlign: 'center' }}
              />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, minHeight: '60vh' },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="medium">
              {selectedAction?.id ? 'Edit Action' : 'Create New Action'}
            </Typography>
            {watchedMethod && (
              <Chip
                label={watchedMethod}
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
        </DialogTitle>

        <FormProvider {...methods}>
          <DialogContent sx={{ px: 0 }}>
            <Paper sx={{ mx: 3, borderRadius: 2 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                  },
                }}
              >
                {TAB_CONFIG.map((tab, index) => (
                  <Tab
                    key={index}
                    label={tab.label}
                    id={`action-tab-${index}`}
                    aria-controls={`action-tabpanel-${index}`}
                  />
                ))}
              </Tabs>

              {TAB_CONFIG.map((tab, index) => (
                <TabPanel key={index} value={tabValue} index={index}>
                  <Box sx={{ px: 3 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      {tab.description}
                    </Typography>
                    <Stack spacing={3}>
                      {tab.fields.map((fieldKey) => {
                        const fieldSchema = ACTION_SCHEMA.properties[fieldKey];
                        const required = ACTION_SCHEMA.required.includes(fieldKey);
                        return (
                          <FormParameter
                            key={fieldKey}
                            fieldKey={fieldKey}
                            schema={fieldSchema}
                            required={required}
                            enableLexical={false}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                </TabPanel>
              ))}
            </Paper>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleClose}
              color="inherit"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={onSubmit}
              color="primary"
              variant="contained"
              sx={{ borderRadius: 2, minWidth: 100 }}
            >
              {selectedAction?.id ? 'Update' : 'Create'}
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>

      <DeleteDialog
        openDeleteDialog={openDeleteDialog}
        handleCloseDeleteDialog={() => setOpenDeleteDialog(false)}
        confirmDelete={confirmDelete}
        message="Are you sure you want to delete this action? This action can't be undone."
      />
    </Box>
  );
}

export default memo(ActionsEditor);
