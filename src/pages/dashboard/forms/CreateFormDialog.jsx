import { Button, Box, TextField, Stack, Tooltip } from '@mui/material';
import React, { useState, useCallback, memo } from 'react';

import CustomDialog from '../../../components/dialogs/CustomDialog.jsx';
import Iconify from '../../../components/iconify/Iconify';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import useKeyShortcutListener from '../../../hooks/useKeyShortcutListener';
import { updateAltanerComponentById } from '../../../redux/slices/altaners';
import { createForm } from '../../../redux/slices/general';

function CreateFormDialog({ open, handleClose, altanerComponentId }) {
  const [formName, setFormName] = useState('new form');
  const [dispatchWithFeedback] = useFeedbackDispatch();

  const handleCreateForm = useCallback(
    (event) => {
      event?.preventDefault();
      dispatchWithFeedback(createForm({ name: formName.trim() }), {
        successMessage: 'Form created successfully!',
        errorMessage: 'Error creating Form ',
        useSnackbar: true,
      })
        .then((form) => {
          if (!!altanerComponentId) {
            dispatchWithFeedback(
              updateAltanerComponentById(altanerComponentId, {
                ids: [form.id],
                method: 'insert',
              }),
              {
                successMessage: 'Form linked to Altaner successfully!',
                errorMessage: 'Error linking Form ',
                useSnackbar: true,
              },
            )
              .then(() => {
                console.log('Form linked to Altaner successfully');
              })
              .catch((error) => {
                console.error('Error linking Form:', error);
              });
          }
          handleClose();
        })
        .catch((error) => {
          console.error('Error creating Form:', error);
        });
    },
    [altanerComponentId, dispatchWithFeedback, formName, handleClose],
  );

  const eventMappings = [
    {
      condition: (event) => (event.metaKey || event.ctrlKey) && event.key === 'Enter',
      handler: handleCreateForm,
    },
  ];

  useKeyShortcutListener({
    eventsMapping: eventMappings,
    debounceTime: 300,
    stopPropagation: true,
  });

  return (
    <>
      <CustomDialog
        dialogOpen={open}
        onClose={handleClose}
      >
        <Box
          component="form"
          onSubmit={handleCreateForm}
          sx={{ p: 4 }}
        >
          <TextField
            size="normal"
            autoFocus
            variant="filled"
            label="New form name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            fullWidth
          />
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 2 }}
          >
            <Tooltip
              title={
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                >
                  <Iconify icon="solar:command-linear" />
                  <Iconify icon="mdi:backspace-outline" />
                </Stack>
              }
            >
              <Button
                variant="outlined"
                onClick={handleClose}
                fullWidth
              >
                Cancel
              </Button>
            </Tooltip>
            <Tooltip
              title={
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                >
                  <Iconify icon="solar:command-linear" />
                  <Iconify icon="mi:enter" />
                </Stack>
              }
            >
              <Button
                variant="soft"
                type="submit"
                fullWidth
              >
                Create
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      </CustomDialog>
    </>
  );
}

export default memo(CreateFormDialog);
