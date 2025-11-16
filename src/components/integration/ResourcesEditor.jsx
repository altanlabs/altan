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
} from '@mui/material';
import React, { memo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import {
  createResourceType,
  patchResourceType,
  removeResourceType,
} from '../../redux/slices/general/index.ts';
import { isValidJSONFromSchema } from '../../utils/formatData';
import DeleteDialog from '../dialogs/DeleteDialog';
import FormParameter from '../tools/form/FormParameter';

const RESOURCE_SCHEMA = {
  title: 'Resource',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'The name of the resource.',
      'x-hide-label': true,
    },
    description: {
      type: 'string',
      description: 'The description of the resource.',
      'x-hide-label': true,
    },
    details: {
      type: 'object',
      description: 'The json schema of the resource.',
      'x-hide-label': true,
    },
  },
  required: ['name'],
};

function ResourcesEditor({ connectionType }) {
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const [selectedResource, setSelectedResource] = useState(null);
  const [open, setOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      details: {},
    },
  });

  const { handleSubmit, reset } = methods;

  if (!connectionType) {
    return <Typography variant="h6">Connection Type not found</Typography>;
  }

  const resources = connectionType.resources?.items || [];
  const filteredResources = resources.filter((resource) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleClickOpen = (resource = { name: '', description: '' }) => {
    setSelectedResource(resource);
    reset(resource);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedResource(null);
  };

  const handleDelete = (resourceId) => {
    setResourceToDelete(resourceId);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    console.log('Deleted Resource ID:', resourceToDelete);
    setOpenDeleteDialog(false);
    setResourceToDelete(null);
    dispatchWithFeedback(removeResourceType(resourceToDelete, connectionType.id), {
      useSnackbar: true,
      successMessage: 'Resource deleted successfully',
      errorMessage: 'Could not delte resource',
    });
  };

  const onSubmit = handleSubmit((data) => {
    const isValid = isValidJSONFromSchema(data, RESOURCE_SCHEMA);
    if (!isValid) {
      return;
    }
    if (selectedResource.id) {
      dispatchWithFeedback(patchResourceType(selectedResource.id, data), {
        useSnackbar: true,
        successMessage: 'Resource updated successfully',
        errorMessage: 'Could not update action',
      });
    } else {
      dispatchWithFeedback(createResourceType({ ...data, connection_type_id: connectionType.id }), {
        useSnackbar: true,
        successMessage: 'Resource created successfully',
        errorMessage: 'Could not create action',
      });
    }
    handleClose();
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">Resources</Typography>
        <IconButton
          color="primary"
          onClick={() => handleClickOpen()}
        >
          <AddIcon />
        </IconButton>
      </Stack>
      <TextField
        fullWidth
        label="Search Resources"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        size="small"
        autoFocus
      />
      <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '80vh' }}>
        <List>
          {filteredResources.map((resource) => (
            <React.Fragment key={resource.id}>
              <ListItem
                secondaryAction={
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleDelete(resource.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                disablePadding
              >
                <ListItemButton onClick={() => handleClickOpen(resource)}>
                  <ListItemText
                    primary={resource.name}
                    secondary={resource.description || 'No description available'}
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <DialogTitle>{selectedResource?.id ? 'Edit Resource' : 'Create New Resource'}</DialogTitle>
        <FormProvider {...methods}>
          <DialogContent>
            <Stack spacing={2}>
              {Object.entries(RESOURCE_SCHEMA.properties).map(([key, fieldSchema]) => {
                const required = RESOURCE_SCHEMA.required.includes(key);
                return (
                  <FormParameter
                    key={key}
                    fieldKey={key}
                    schema={fieldSchema}
                    required={required}
                    enableLexical={false}
                  />
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClose}
              color="error"
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={onSubmit}
              color="primary"
              variant="contained"
            >
              Save
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>

      <DeleteDialog
        openDeleteDialog={openDeleteDialog}
        handleCloseDeleteDialog={() => setOpenDeleteDialog(false)}
        confirmDelete={confirmDelete}
        message="Are you sure you want to delete this resource? This action can't be undone."
      />
    </Box>
  );
}

export default memo(ResourcesEditor);
