import { Card, Stack, IconButton, Typography, ButtonGroup } from '@mui/material';
import React, { useState } from 'react';

import Iconify from '@components/iconify/Iconify';

import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { deleteTool } from '../../../redux/slices/connections';
import { deleteAccountResource } from '../../../redux/slices/general/index.ts';
import DeleteDialog from '../superadmin/tables/DeleteDialog';

function ToolCard({ tool }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const handleDelete = () => {
    dispatchWithFeedback(deleteAccountResource('tool', tool.id, deleteTool), {
      successMessage: 'Tool deleted successfuly',
      errorMessage: 'there was an error deleting the tool',
      useSnackbar: true,
      useConsole: true,
    }).then(() => {
      closeDeleteDialog();
    });
  };

  const openDeleteDialog = () => setDeleteDialogOpen(true);
  const closeDeleteDialog = () => setDeleteDialogOpen(false);

  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >
          <Stack>
            <Typography variant="h6">{tool.name}</Typography>
            <Typography variant="caption">{tool.description}</Typography>
          </Stack>
        </Stack>
        <ButtonGroup>
          <IconButton color="primary">
            <Iconify icon="solar:settings-bold-duotone" />
          </IconButton>
          <IconButton
            color="error"
            onClick={openDeleteDialog}
          >
            <Iconify icon="tabler:trash-filled" />
          </IconButton>
        </ButtonGroup>
      </Stack>
      <DeleteDialog
        openDeleteDialog={deleteDialogOpen}
        handleCloseDeleteDialog={closeDeleteDialog}
        confirmDelete={handleDelete}
        isSubmitting={isSubmitting}
      />
    </Card>
  );
}

export default ToolCard;
